/**
 * 内置中间件，路由校验
 */

import { Next, Context } from 'koa';
import { isBoolean, isFunction } from 'lodash';
import Middleware from '../decorators/middleware';

@Middleware()
export default class AppMiddlewareAuth implements AppMiddleware {
    init() {
        return async (ctx: Context, next: Next) => {
            const controller = ctx.controller;
            let defaultErrorMsg: ResponseError = {
                code: 10405,
                developMsg: '',
                error: '验证失败'
            };
            if (!controller) return await next();
            if (!controller.auth) {
                return await next();
            }
            if (isBoolean(controller.auth) && controller.auth) {
                return await next();
            }
            if (isFunction(controller.auth)) {
                const auth = await controller.auth.call(controller.auth, { ctx, next }, (err) => {
                    defaultErrorMsg = {
                        ...defaultErrorMsg,
                        ...err
                    };
                });
                if (auth) {
                    return await next();
                }
            }
            return ctx.fail(defaultErrorMsg);
        };
    }
}
