/**
 * 内置中间件，路由校验
 */

import { Next, Context } from '@core/app/index';
import { IAppMiddleware, IAppControllerCoreRequestOption, IHttpErrorResponse } from '@core/type/controller';
import { isBoolean, isFunction } from 'lodash';
import Middleware from './app.middleware';

@Middleware()
export default class AppMiddlewareAuth implements IAppMiddleware {
    init() {
        return async (ctx: Context, next: Next) => {
            const exts: IAppControllerCoreRequestOption = ctx.exts();
            let errorMsg: IHttpErrorResponse = {
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
                    errorMsg = err;
                });
                if (auth) {
                    return await next();
                }
            }
            return ctx.fail(errorMsg.error, errorMsg.code, { developMsg: errorMsg.developMsg });
        };
    }
}
