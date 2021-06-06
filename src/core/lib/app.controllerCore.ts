import { set } from 'lodash';
import { getFileName, getFilePath, isDirectory, isFile, isIndexFile, readDirSync } from '@core/utils/file';
import * as Path from 'path';
import { IAppControllerCoreRequestOption } from '@core/type/controller';
import AppController from './app.controller';
import { IAppControllerRequest } from '@core/type/controller';
import { ILogTarget } from '@core/type/log';

/**
 * 控制器处理基础类
 */
export class AppControllerCore {
    public instance: AppController;

    /**
     * 控制器文件夹路径
     */
    private path: string = '';

    constructor() {
        this.path = getFilePath('./controller');
        this.instance = new AppController();
        this.getAllControllers(this.path);
    }

    /**
     * 处理用户配置
     */
    private static options(options: IAppControllerCoreRequestOption): IAppControllerCoreRequestOption {
        return {
            log: [ILogTarget.local, ILogTarget.console],
            ...options,
        };
    }

    /**
     * 请求方法控制器
     * @param method 请求方法
     * @param option 请求配置
     * @returns
     */
    public static setControllerMethod(method: IAppControllerRequest, options?: IAppControllerCoreRequestOption) {
        return (target: Object, name: string, descriptor: PropertyDescriptor) => {
            const controllerMethod = descriptor.value;
            const path: string = (options && options.url) || `/${name}`;
            const opts = this.options(options || { url: path });
            descriptor.value = function (router: AppController, target) {
                const routerName: string = `${target.name}.${name}`;
                router[method || IAppControllerRequest.GET](routerName, path, async (ctx, next) => {
                    const params = ctx.params === {} ? ctx.request.body : ctx.params; //请求数据
                    const res = await controllerMethod.call(this, ctx, next, params); //获取返回值
                    ctx.success(res, '', opts);
                    return res;
                });
            };
            Object.defineProperty(descriptor.value, 'type', {
                value: 'controllerMethod',
                writable: false,
                configurable: false,
                enumerable: true,
            });
            Object.defineProperty(descriptor.value, 'options', {
                value: opts,
                writable: false,
                configurable: false,
                enumerable: true,
            });
            return descriptor;
        };
    }

    /**
     * 控制器装饰器
     * @param prefix
     * @returns
     */
    public static setControllerClass(prefix: string = '/') {
        const router = new AppController();
        prefix && router.prefix(prefix);
        return (target): AppController => {
            const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
            const controllerMethodName = Object.getOwnPropertyNames(controllerMethod);
            controllerMethodName.forEach((methodName) => {
                if (methodName !== 'constructor') {
                    const controller: PropertyDescriptor = controllerMethod[methodName];
                    const type = Object.getOwnPropertyDescriptor(controller.value, 'type');
                    if (type && type.value === 'controllerMethod') {
                        if (controller.value.options && controller.value.options.url) {
                            router.exts[methodName] = controller.value.options;
                        }
                        target.prototype.name = target.name;
                        return controller.value.call(new target(), router, target);
                    }
                }
            });
            router.name = target.name;
            return router;
        };
    }

    /**
     * 获取前缀
     * @param controller
     * @param file
     * @param filepath
     * @returns
     */
    private getPrefix(controller: AppController, file: string, filepath: string): string {
        const prefix: string = (controller.opts && controller.opts.prefix) || '';
        if (!prefix) {
            if (!isIndexFile(filepath, '.js')) {
                return `/${getFileName(filepath)}`;
            } else if (isDirectory(filepath) || !isIndexFile(filepath, '.js')) {
                return `/${file}`;
            }
        }
        return prefix;
    }

    /**
     * 读取所有控制器数据
     * @param path 控制器目录
     */
    private getAllControllers(path: string): void {
        const controllerFiles = readDirSync(path);
        controllerFiles.forEach((file) => {
            const filepath = Path.join(path, file);
            if (isFile(filepath) || isDirectory(filepath)) {
                const controller: AppController = require(filepath).default;
                if (!!controller && controller.isController && controller.isController()) {
                    const prefix = this.getPrefix(controller, file, filepath);
                    if (!controller.opts || !controller.opts.prefix) {
                        controller.prefix(prefix);
                    }
                    set(this.instance.exts, controller.name, controller.exts);
                    this.instance.use(controller.routes());
                }
            }
        });
    }
}

export default new AppControllerCore();
