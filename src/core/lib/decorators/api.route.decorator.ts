import { ApiRequestType, ApiControllerAttributes, IApiRoute, ApiRequestOptions, ApiRouteParams, Context, Next, ApiGetRequestOptions, ApiPostRequestOptions } from '../../index';
import ApiRoute from '../routes/api.route';
import ApiRoutes from '../routes/api.routes';

/**
 * 路由类装饰器
 * @param path 路由前缀
 * @returns
 */
export function ApiRoutesDecorator(prefix?: string, attributes?: ApiControllerAttributes): (target?: any) => any {
    return (target): ApiRoutes => {
        // 定义一个路由
        const route = new ApiRoutes({
            routePrefix: prefix,
            target: new target(),
            anonymous: false,
            attributes: {
                name: target.name,
                ...(attributes || {})
            }
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
function ApiRouteDecorator(options: Partial<IApiRoute>) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        // 函数原型
        const routeMethodValue = descriptor.value;

        // 存在即合并
        if (routeMethodValue instanceof ApiRoute) {
            routeMethodValue.options(options);
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
                    const body: Object = Object.assign({}, ctx.request?.body || {});
                    // file
                    const files: Object = Object.assign({}, ctx.request?.files || {});
                    // 函数返回结果
                    const result = await routeMethodValue.call(_this, { query, body, ctx, files } as ApiRouteParams);
                    ctx.body = result;
                    next();
                };
            };
            // 改造路由
            descriptor.value = new ApiRoute({
                ...options,
                url,
                type: options.type || ApiRequestType.GET,
                methodName: name,
                value,
                name: options.name || `${target.constructor.name}.${name}`
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
export function RequestApiRouteDecorator(options: ApiRequestOptions) {
    if (options.url) {
        return ApiRouteDecorator(options);
    }
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        return descriptor;
    };
}

/**
 * get请求装饰器
 */
export function GetRequestApiRouteDecorator(url: string, options: ApiGetRequestOptions = {}) {
    return RequestApiRouteDecorator({
        ...options,
        url,
        type: ApiRequestType.GET
    });
}

/**
 * post请求装饰器
 */
export function PostRequestApiRouteDecorator(url: string, options: ApiPostRequestOptions = {}) {
    return RequestApiRouteDecorator({
        ...options,
        url,
        type: ApiRequestType.POST
    });
}
