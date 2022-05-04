import { ApiMiddlewareParams, Context, Middleware, Next } from '@/core';

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
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
            ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            ctx.set('Access-Control-Allow-Credentials', 'true');
            // 自己的路由配置
            const routeOrigin = route?.origin || [];
            if (routeOrigin.length) {
                const check = routeOrigin.some((origin) => {
                    return host?.match(origin);
                });
                if (check) {
                    ctx.set('Access-Control-Allow-Origin', host);
                } else {
                    ctx.set('Access-Control-Allow-Origin', '*');
                }
                return next();
            }

            // 没有任何配置
            ctx.set('Access-Control-Allow-Origin', host);
            return next();
        };
    }
}
