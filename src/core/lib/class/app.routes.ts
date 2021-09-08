import { get, set } from 'lodash';
import KoaRouter, { Layer } from 'koa-router';
import { getFilePath, isDirectory, isFile, isIndexFile, readDirSync, getFileName } from '@util/file';
import * as Path from 'path';
import Config from '@lib/config';
import AppControllerClass from './app.controller.class';
import AppControllerMethod from './app.controller.method.class';

/**
 * 控制器处理基础类
 */
class AppRoutes extends KoaRouter {
    constructor(options?: KoaRouter.IRouterOptions) {
        super(options);
        this.getAllControllers(this, getFilePath(Config.get('controller.path')));
        this.handleControllerPath();
    }

    /**
     * 自定义配置
     */
    public controllers: {
        [className: string]: AppControllerClass;
    } = {};

    /**
     * 获取接口结构
     * @param name
     */
    public getControlleOptions(name: string): AppControllerMethod | undefined {
        if (name) {
            const nameArr = name.split('.');
            if (nameArr && nameArr.length === 2) {
                const controllerClass = get(this.controllers, nameArr[0]) as AppControllerClass;
                const controllerMethod = controllerClass && (get(controllerClass.controllers, nameArr[1]) as AppControllerMethod);
                return controllerMethod;
            }
        }
        return undefined;
    }

    /**
     * 重新处理每个接口的url,把父级的路由加上
     */
    private handleControllerPath() {
        const stack: Layer[] = this.stack;
        stack.forEach((layer) => {
            const controller = this.getControlleOptions(layer.name);
            if (controller) {
                controller.merge({
                    url: layer.path
                });
            }
        });
    }

    /**
     * 通过文件名获取前缀
     * @param file 文件名
     * @returns
     */
    private getPrefix(fileName: string): string {
        if (isIndexFile(fileName, '.js')) {
            return '/';
        }
        return getFileName(fileName, '.js');
    }

    /**
     * 获取控制器文件
     * @param file 文件名
     * @param filepath 完整的文件目录
     * @returns
     */
    private getController(file: string, filepath: string): AppControllerClass | false {
        const controller: AppControllerClass = require(filepath).default;
        if (controller instanceof AppControllerClass) {
            // 自定义配置挂到总接口
            set(this.controllers, controller.className, controller);
            // 获取前缀
            const prefix = this.getPrefix(file);
            // 判断有没有前缀
            if (!(controller.opts && controller.opts.prefix)) {
                controller.setPrefix(prefix);
            }
            return controller;
        }
        return false;
    }

    /**
     * 读取所有控制器数据
     * @param parent 父级路由
     * @param path 控制器目录
     */
    private getAllControllers(parent: KoaRouter, filePath: string, dir: string = ''): void {
        // 读取文件下的所有文件和文件夹
        const controllerFiles = readDirSync(filePath);

        // 在此文件夹新建一个父路由
        const parentController = new KoaRouter({
            prefix: dir,
            routerPath: dir
        });

        // 开启循环
        controllerFiles.forEach((file) => {
            // 子文件绝对路径
            const childPath = Path.join(filePath, file);

            // 判断是不是文件
            if (isFile(childPath)) {
                // 文件则读取该文件的控制器
                const controller = this.getController(file, childPath);
                controller && parentController.use(controller.routes());
            } else if (isDirectory(childPath)) {
                // 文件夹则递归
                this.getAllControllers(parentController, childPath, `/${file}`);
            }
        });
        parent.use(parentController.routes());
    }
}

export default new AppRoutes();
