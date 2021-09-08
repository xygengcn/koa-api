/**
 * 内置中间件，处理跨域问题
 */
import Koa from 'koa';
import Middleware from '../decorators/middleware';

@Middleware()
export default class AppMiddlewareCors implements AppMiddleware {
    private allowMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    init(options?: AppOptions) {
        return async (ctx: Koa.Context, next: Koa.Next) => {
            const controller = ctx.controller;
            ctx.vary('Origin');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');

            // 配置全局
            if (options && options.allowMethods) {
                ctx.set('Access-Control-Allow-Methods', options.allowMethods.toString());
            } else {
                ctx.set('Access-Control-Allow-Methods', this.allowMethods.toString());
            }

            if (ctx.header.referer?.match(ctx.host)) {
                // 没有配置直接通过
                ctx.set('Access-Control-Allow-Origin', '*');
                return await next();
            }
            // 验证来源
            if (ctx.header.origin) {
                // 验证用户配置
                if (controller?.origin?.length) {
                    if (controller.origin.includes(ctx.header.origin) || controller.origin.includes('*')) {
                        ctx.set('Access-Control-Allow-Origin', ctx.header.origin);
                        return await next();
                    }
                }
                // 全局配置
                if (options?.origin?.length) {
                    if (options.origin.includes(ctx.header.origin) || options.origin.includes('*')) {
                        ctx.set('Access-Control-Allow-Origin', ctx.header.origin);
                        return await next();
                    }
                }
                // 有配置都没有通过
                if (controller?.origin?.length || options?.origin?.length) {
                    ctx.status = 403;
                    ctx.message = 'CORS Forbidden';
                    return ctx.fail({
                        code: 10403,
                        error: 'CORS Forbidden',
                        developMsg: '请求跨域'
                    });
                }
            }
            // 没有配置直接通过
            ctx.set('Access-Control-Allow-Origin', '*');
            return await next();
        };
    }
}
