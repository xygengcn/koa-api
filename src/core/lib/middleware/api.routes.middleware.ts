import { IControllerPathTransformApiRoutes } from '@/core/typings';
import ApiRoutes from '../routes/api.routes';
import path from 'path';
import { Middleware } from '../decorators/api.middleware.decorator';
import { ApiFunctionMiddleware, ApiDefaultOptions, ApiMiddleware } from '../../typings';
import { capitalizeFirstLetter } from '../utils/string';
import { controllerPathTransformApiRoutes, Controller_File_Path_Reg, Index_Controller_File_Name_Reg } from '../utils/controller';

@Middleware('ApiRoutesMiddleware')
export default class ApiRoutesMiddleware implements ApiMiddleware {
    /**
     * 匹配控制器正则
     */
    public fileNameReg = /([\d\w]+)(\.controller\.[t|j]s)$/i;

    /**
     * path路由正则
     */
    public filePathReg = /(.+)(\.controller\.[t|j]s)$/i;

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
            // 优先transform ，没有再取controllerPath
            const transform = options.transform?.length ? options.transform : controllerPathTransformApiRoutes(options.controllerPath, '/') || [];

            // 读取控制器
            this.routerController = this.readControllers(transform, '/');

            this.controllers = this.routerController?.routes() as ApiFunctionMiddleware;
            // 堆栈
            const stack = this.routerController?.stack;
            // 队列结构
            const queue = this.routerController?.getQueue(stack);
            // 树形结构
            const routeTree = this.routerController?.getRouteTree(stack);

            //控制器集合
            const controllerQueue = this.routerController?.getControllerQueue([]);

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
                },
                controllerQueue: {
                    writable: false,
                    enumerable: true,
                    configurable: false,
                    value: controllerQueue
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

    private readControllers(transform: IControllerPathTransformApiRoutes[], relativePath: string = '/', middlewares: ApiFunctionMiddleware[] = []): ApiRoutes | null {
        // 该文件夹下主路由
        let parent: ApiRoutes | null = null;

        const indexController = transform.find((controller) => controller.name.match(Index_Controller_File_Name_Reg));

        if (indexController) {
            parent = this.readController(indexController);
        } else {
            parent = new ApiRoutes({
                controllerName: capitalizeFirstLetter(`${path.basename(relativePath) || 'index'}Controller`),
                routePrefix: '/',
                anonymous: true,
                attributes: {}
            });
            parent.setPath(relativePath);
        }
        if (transform.length && parent) {
            transform.forEach((route) => {
                if (route.type === 'file' && !route.name.match(Index_Controller_File_Name_Reg)) {
                    // 子文件结构
                    const childController = this.readController(route, (parent?.middlewares || []).concat(middlewares));
                    // 插入
                    if (childController instanceof ApiRoutes) {
                        parent?.pushChildRoutes(childController);
                    }
                } else if (route.type === 'dir' && route.children?.length) {
                    const childControllers = this.readControllers(route.children, route.relativePath, (parent?.middlewares || []).concat(middlewares));
                    childControllers && parent?.pushChildRoutes(childControllers);
                }
            });
        }

        return parent;
    }

    private readController(route: IControllerPathTransformApiRoutes, middlewares: ApiFunctionMiddleware[] = []): ApiRoutes | null {
        if (route.controller?.default && route.controller?.default instanceof ApiRoutes) {
            const controller: ApiRoutes = route.controller?.default;

            // 合并父级的中间件
            controller.concatMiddleware(middlewares);

            // index文件
            if (route.name.match(Index_Controller_File_Name_Reg)) {
                const relativePath = path.dirname(route.relativePath);
                controller.setPath(relativePath);
            } else {
                // 非index文件
                const filePath = route.relativePath.match(Controller_File_Path_Reg);
                if (filePath && filePath[1]) {
                    controller.setPath(filePath[1]);
                } else {
                    controller.setPath(route.relativePath);
                }
            }
            return controller;
        }
        return null;
    }
}
