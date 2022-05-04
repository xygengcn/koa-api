/**
 * 程序装饰器合集
 */
import { ApiDefaultOptions, ApiFunctionMiddleware, Context, Next, Layer, ApiMiddlewareParams, IApiRoute, ApiRoutesBase } from '../../index';
/**
 * 中间件
 * @param name
 * @returns
 */
export function Middleware(name?: string): any {
    return (target: any) => {
        return (options: ApiDefaultOptions): ApiFunctionMiddleware => {
            const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
            const controllerMethodName = Object.getOwnPropertyNames(controllerMethod);
            const Middleware = new target();
            // 初始化函数
            if (controllerMethodName.includes('init') && typeof controllerMethod.init.value === 'function') {
                controllerMethod.init.value.call(Middleware, options);
            }
            return async (ctx: Context, next: Next) => {
                // 获取当前路由的stack
                const stack: Layer | undefined = options.stack?.find((layer) => {
                    return ctx.path.match(layer.regexp);
                });
                // 获取当前路由的实现参数
                const route: IApiRoute | undefined = (stack?.name && options.queue?.find((route) => route.name === stack.name)) || undefined;

                // 父级名字
                const parentNames: string[] = route?.routeName.split('.').slice(0, -1) || [];

                // 按照层级来获取父级
                const parents: ApiRoutesBase[] = parentNames.reduce((parents: ApiRoutesBase[], name) => {
                    const find = options.controllerQueue?.find((controller) => controller.controllerName === name);
                    if (find) {
                        parents.push(find);
                    }
                    return parents;
                }, []);

                // 中间件入参
                const apiMiddlewareParams: ApiMiddlewareParams = { ctx, stack, options, route, parents };

                // 匹配函数
                if (controllerMethodName.includes('match') && typeof controllerMethod.match.value === 'function') {
                    if (!(await controllerMethod.match.value.call(Middleware, apiMiddlewareParams))) {
                        return await next();
                    }
                }
                // 忽略函数
                if (controllerMethodName.includes('ignore') && typeof controllerMethod.ignore.value === 'function') {
                    if (await controllerMethod.ignore.value.call(Middleware, apiMiddlewareParams)) {
                        return await next();
                    }
                }
                // 执行函数
                if (controllerMethodName.includes('resolve') && typeof controllerMethod.resolve.value === 'function') {
                    return await controllerMethod.resolve.value.call(Middleware, apiMiddlewareParams)(ctx, next);
                }
                return await next();
            };
        };
    };
}
