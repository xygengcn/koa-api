import { ApiMiddlewareParams, Context, Middleware, Next, ApiError, ApiErrorCode } from '@/core';

/**
 * 测试使用：处理跨域中间件
 */
@Middleware()
export default class OriginMiddleware {
    /**
     * 过滤favicon.ico
     */
    public ignore?({ ctx }: ApiMiddlewareParams) {
        return ctx.path === '/favicon.ico';
    }
    public resolve({ parents, route, options }: ApiMiddlewareParams) {
        return async (ctx: Context, next: Next) => {
            const host = ctx.header.origin || '';
            ctx.set('Access-Control-Allow-Origin', host);
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
            ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Credentials', 'true');
            // 自己的路由配置
            const routeOrigin = route?.origin || [];
            if (routeOrigin.length) {
                const check = routeOrigin.some((origin) => {
                    return host?.match(origin);
                });
                if (!check) {
                    throw new ApiError({
                        code: ApiErrorCode.originError,
                        error: `Access to fetch at ${ctx.path} from origin ${host} has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.`
                    });
                }
            }
            return next();
        };
    }
}
