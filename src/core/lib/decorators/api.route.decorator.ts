import { ApiRouteOptions, ApiRouteRequestType, ApiRoutesOptions, IApiRoute } from '../../index';
import ApiRoute from '../routes/api.route';
import ApiRoutes from '../routes/api.routes';
import { Context, Next } from '../../index';

/**
 * 路由类装饰器
 * @param path 路由前缀
 * @returns
 */
export function ApiRoutesDecorator(prefix?: string, options?: ApiRoutesOptions): (target?: any) => any {
    return (target): ApiRoutes => {
        // 定义一个路由
        const route = new ApiRoutes({
            routePrefix: prefix,
            target: new target(),
            name: target.name,
            ...(options || {})
        });
        // 通过原型，获取类里面所有方法
        const routeMethods: {
            [methodName: string]: PropertyDescriptor;
        } = Object.getOwnPropertyDescriptors(target.prototype);

        // 遍历方法名，提取接口
        Object.entries(routeMethods).forEach(([methodName, methodFunction]) => {
            // 过滤构造函数
            if (methodName !== 'constructor' && typeof methodFunction.value === 'object' && methodFunction.value instanceof ApiRoute) {
                // 直接插入
                route.pushMethodRoutes(methodFunction.value);
            }
        });

        return route;
    };
}

/**
 *
 * 具体接口实现构造器
 */
export function ApiRouteDecorator(options: Partial<IApiRoute>, routeOptions: ApiRouteOptions) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        // 函数原型
        const routeMethodValue = descriptor.value;

        // 存在即合并
        if (routeMethodValue instanceof ApiRoute) {
            routeMethodValue.options(options, routeOptions);
            descriptor.value = function () {
                return routeMethodValue;
            };
        } else {
            // 接口路由
            const url: string = (options && options.url) || `/${name}`;

            // 路由执行函数
            const value = function (_this: ClassDecorator) {
                return async (ctx: Context, next: Next) => {
                    // url请求参数
                    const query: Object = Object.assign({}, ctx.query || {});
                    // body请求参数
                    const body: Object = Object.assign({}, ctx.request?.body?.content || {});
                    // 函数返回结果
                    const result = await routeMethodValue.call(_this, { query, body, ctx, next });
                    ctx.body = result;
                    next();
                };
            };
            // 改造路由
            descriptor.value = new ApiRoute({
                ...options,
                url,
                type: options.type || ApiRouteRequestType.GET,
                routeOptions: options.routeOptions || {},
                methodName: name,
                value,
                name: options.name || name
            });
        }
        return descriptor;
    };
}

/**
 * 请求装饰器
 * @param options
 * @returns
 */
export function RequestApiRouteDecorator(options: Pick<IApiRoute, 'type' | 'url'> & { options?: ApiRouteOptions }) {
    if (options.url) {
        return ApiRouteDecorator(
            {
                url: options.url,
                type: options.type || ApiRouteRequestType.GET
            },
            options.options || {}
        );
    }
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        return descriptor;
    };
}

/**
 * get请求装饰器
 */
export function GetRequestApiRouteDecorator(url: string, options: ApiRouteOptions = {}) {
    return RequestApiRouteDecorator({
        url,
        type: ApiRouteRequestType.GET,
        options
    });
}

/**
 * post请求装饰器
 */
export function PostRequestApiRouteDecorator(url: string, options: ApiRouteOptions = {}) {
    return RequestApiRouteDecorator({
        url,
        type: ApiRouteRequestType.POST,
        options
    });
}
