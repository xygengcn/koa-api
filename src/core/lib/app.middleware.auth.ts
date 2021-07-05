/**
 * 内置中间件，路由校验
 */

import { AppMiddleware } from '@core/typings/app';
import { ResponseError, Next, Context, RequestExts } from 'koa';
import { isBoolean, isFunction } from 'lodash';
import Middleware from './app.decorator';

@Middleware()
export default class AppMiddlewareAuth implements AppMiddleware {
    init() {
        return async (ctx: Context, next: Next) => {
            const exts: RequestExts = ctx.exts();
            let errorMsg: ResponseError = {
                code: 10405,
                developMsg: '',
                error: '验证失败',
            };
            if (!exts) return await next();
            if (!exts.hasOwnProperty('auth')) {
                return await next();
            }
            if (isBoolean(exts.auth) && exts.auth) {
                return await next();
            }
            if (isFunction(exts.auth)) {
                const auth = await exts.auth.call(exts.auth, { ctx, next }, (err) => {
                    errorMsg = {
                        ...errorMsg,
                        ...err,
                    };
                });
                if (auth) {
                    return await next();
                }
            }
            return ctx.fail(errorMsg.error, errorMsg.code, {
                developMsg: errorMsg.developMsg,
            });
        };
    }
}
