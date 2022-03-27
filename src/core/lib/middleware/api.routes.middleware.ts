import ApiRoutes from '../routes/api.routes';
import { isDirectory, isFile, readDirSync } from '../utils/file';
import path from 'path';
import { Middleware } from '../decorators/api.middleware';
import { ApiFunctionMiddleware, ApiDefaultOptions, ApiMiddleware } from '../../index';

@Middleware('ApiRoutesMiddleware')
export default class ApiRoutesMiddleware implements ApiMiddleware {
    /**
     * 匹配控制器正则
     */
    public fileNameReg = /([\d\w]+)(\.controller\.[t|j]s)$/i;

    /**
     * 匹配index控制器正则
     */
    public indexFileNameReg = /index\.controller\.[t|j]s$/i;

    /**
     * 路由集合中间件
     */
    public controllers: ApiFunctionMiddleware = () => {};

    /**
     * 主路由
     */
    public routerController!: null | ApiRoutes;

    /**
     * 初始化
     * @param options
     */
    public init(options: ApiDefaultOptions) {
        if (options?.controllerPath) {
            this.routerController = this.readControllers(options.controllerPath);
            this.controllers = this.routerController?.routes() as ApiFunctionMiddleware;
            // 堆栈
            const stack = this.routerController?.stack;
            // 队列结构
            const queue = this.routerController?.getQueue(stack);
            // 树形结构
            const routeTree = this.routerController?.getRouteTree(stack);
            Object.defineProperties(options, {
                stack: {
                    writable: false,
                    configurable: false,
                    enumerable: true,
                    value: stack
                },
                queue: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: queue
                },
                routeTree: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: routeTree
                }
            });
        }
    }

    /**
     * 返回所有配置
     * @returns
     */
    public resolve() {
        return this.controllers;
    }

    private readControllers(absolutePath: string, relativePath: string = '/'): null | ApiRoutes {
        // 判断为空
        if (!absolutePath) return null;

        // 判断是不是文件夹
        if (!isDirectory(absolutePath)) return null;

        // 读取文件下的所有文件和文件夹
        const controllerFiles = readDirSync(absolutePath);

        // 空目录
        if (controllerFiles.length === 0) return null;

        // 该文件夹下主路由
        let parent: ApiRoutes | null = null;

        // 读取index文件
        if (controllerFiles.includes('index.controller.ts')) {
            parent = this.readController(path.join(absolutePath, 'index.controller.ts'), relativePath);
        } else if (controllerFiles.includes('index.controller.js')) {
            parent = this.readController(path.join(absolutePath, 'index.controller.js'), relativePath);
        }
        // 没有index，创建一个匿名的
        if (!parent) {
            parent = new ApiRoutes({
                routePrefix: path.basename(relativePath),
                anonymous: true
            });
        }

        // 开启循环
        controllerFiles.forEach((file) => {
            // 子文件绝对路径
            const childAbsolutePath = path.join(absolutePath, file);
            // 相对路径
            const childRelativePath = path.join(relativePath, file);
            // 单文件
            if (isFile(childAbsolutePath) && this.fileNameReg.test(file) && !this.indexFileNameReg.test(file)) {
                // 子文件结构
                const childController = this.readController(childAbsolutePath, childRelativePath);
                // 插入
                if (childController instanceof ApiRoutes) {
                    parent?.pushChildRoutes(childController);
                }
            }
            // 文件夹
            if (isDirectory(childAbsolutePath)) {
                const childControllers = this.readControllers(childAbsolutePath, childRelativePath);
                childControllers && parent?.pushChildRoutes(childControllers);
            }
        });
        return parent;
    }

    /**
     * 读取当个文件内容
     * @param filepath
     * @returns
     */
    public readController(absolutePath: string, relativePath: string): ApiRoutes | null {
        const controller = require(absolutePath).default;
        if (controller instanceof ApiRoutes) {
            // 提取文件名
            const filePath = relativePath.match(this.fileNameReg);
            if (filePath && filePath[1]) {
                controller.setPath(filePath[1]);
            } else {
                controller.setPath(relativePath);
            }
            return controller;
        }
        return null;
    }
}
