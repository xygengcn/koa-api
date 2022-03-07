/**
 * 程序装饰器合集
 */
import { ApiDefaultOptions, ApiMiddleware, Context, Next } from '../../index';
/**
 * 中间件
 * @param name
 * @returns
 */
export default function Middleware(name?: string): any {
    return (target: any) => {
        const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
        const controllerMethodName = Object.getOwnPropertyNames(controllerMethod);
        const Middleware = new target();
        return (options: ApiDefaultOptions): ApiMiddleware => {
            if (controllerMethodName.includes('init') && typeof controllerMethod.init.value === 'function') {
                controllerMethod.init.value.call(Middleware, options);
            }
            return async (ctx: Context, next: Next) => {
                if (controllerMethodName.includes('match') && typeof controllerMethod.match.value === 'function') {
                    if (!(await controllerMethod.match.value.call(Middleware, ctx))) {
                        return await next();
                    }
                }
                if (controllerMethodName.includes('ignore') && typeof controllerMethod.ignore.value === 'function') {
                    if (await controllerMethod.ignore.value.call(Middleware, ctx)) {
                        return await next();
                    }
                }
                if (controllerMethodName.includes('resolve') && typeof controllerMethod.resolve.value === 'function') {
                    return await controllerMethod.resolve.value.call(Middleware, options)(ctx, next);
                }
                return await next();
            };
        };
    };
}
