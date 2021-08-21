/**
 * 程序装饰器合集
 */

import { RequestType } from '@core/typings/app';
import { Context, Next, RequestExts } from 'koa';
import AppController from './app.controller';

/**
 * 控制器装饰器
 * @param prefix
 * @returns
 */
export function ControllerDecorator(prefix: string = '/'): (target?: any) => any {
    return (target): AppController => {
        const router = new AppController(target.name, prefix);
        const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
        Object.getOwnPropertyNames(controllerMethod).forEach((methodName) => {
            if (methodName !== 'constructor') {
                const controller: PropertyDescriptor = controllerMethod[methodName];
                const type = Object.getOwnPropertyDescriptor(controller.value, 'type');
                // 判断是不是路由方法
                if (type && type.value === 'controllerMethod') {
                    if (controller.value.options && controller.value.options.url) {
                        router.exts[methodName] = controller.value.options;
                    }
                    target.prototype.name = target.name;
                    return controller.value.call(new target(), router, target);
                }
            }
        });
        return router;
    };
}

/**
 * 请求方法控制器
 * @param method 请求方法
 * @param option 请求配置
 * @returns
 */
export function MethodDecorator(method: RequestType, options?: RequestExts) {
    /**
     * 处理用户配置
     */
    const option = (options: RequestExts): RequestExts => {
        return {
            ...options
        };
    };
    return function (target, name: string, descriptor: PropertyDescriptor) {
        const controllerMethod = descriptor.value;
        const path: string = (options && options.url) || `/${name}`;
        const opts = option(options || { url: path });
        descriptor.value = function (router: AppController) {
            const routerName: string = `${router.name}.${name}`;
            router[method || RequestType.GET](routerName, path, async (ctx, next) => {
                // 调用方法
                const res = await controllerMethod.call(this, ctx, next, {
                    query: ctx.query,
                    param: ctx.request.body
                });
                ctx.success(res, opts);
                return res;
            });
        };
        // 标识此方法是路由方法
        Object.defineProperty(descriptor.value, 'type', {
            value: 'controllerMethod',
            writable: false,
            configurable: false,
            enumerable: true
        });
        // 把配置挂载装饰器返回值
        Object.defineProperty(descriptor.value, 'options', {
            value: opts,
            writable: false,
            configurable: false,
            enumerable: true
        });
        return descriptor;
    };
}

/**
 * 中间件
 * @param name
 * @returns
 */
export default function Middleware(name?: string): (target: any) => void {
    return (target) => {
        const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
        const controllerMethodName = Object.getOwnPropertyNames(controllerMethod);
        if (controllerMethodName.includes('init')) {
            const middleware = new target();
            middleware.name = name || target.name;
            return controllerMethod.init.value.bind(middleware);
        }
        const middleware = (ctx: Context, next: Next) => {};
        middleware.name = name || target.name;
        return middleware;
    };
}
