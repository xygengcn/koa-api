/**
 * 程序装饰器合集
 */
import { Context, Next } from 'koa';

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
