/**
 * 内置中间件，处理跨域问题
 */
import Koa, { RequestExts } from 'koa';
import Middleware from './app.decorator';
import { isArray } from 'lodash';
import { AppMiddleware, AppMiddlewareOpts } from '@core/typings/app';

@Middleware()
export default class AppMiddlewareCors implements AppMiddleware {
    private allowMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    init(options?: AppMiddlewareOpts) {
        return async (ctx: Koa.Context, next: Koa.Next) => {
            const exts: RequestExts = ctx.exts;
            ctx.vary('Origin');
            ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
            if (options && options.allowMethods) {
                ctx.set('Access-Control-Allow-Methods', options.allowMethods.toString());
            } else {
                ctx.set('Access-Control-Allow-Methods', this.allowMethods.toString());
            }

            if (ctx.header.origin) {
                // 验证用户配置
                if (isArray(exts.origin)) {
                    if (exts.origin.includes(ctx.header.origin) || exts.origin.includes('*')) {
                        ctx.set('Access-Control-Allow-Origin', ctx.header.origin);
                        return await next();
                    }
                }
                // 全局配置
                if (options && options.origin) {
                    if (options.origin.includes(ctx.header.origin) || options.origin.includes('*')) {
                        ctx.set('Access-Control-Allow-Origin', ctx.header.origin);
                        return await next();
                    }
                }
                if (isArray(exts.origin) && options && options.origin) {
                    ctx.status = 403;
                    ctx.message = 'CORS Forbidden';
                    return ctx.fail('ctx.message', 10403);
                }
            }
            return await next();
        };
    }
}
