/**
 * 内置中间件，参数校验
 */

import { isIllegalObjectSync } from '@util/object';
import { Next, Context } from 'koa';
import { isEmpty, isArray } from 'lodash';
import Middleware from '../decorators/middleware';
@Middleware()
export default class AppMiddlewareData implements AppMiddleware {
    /**
     * 校验条件
     * @param content
     * @returns
     */
    private valid(content: { [key: string]: DefaultMethodValue }): Array<{ key: string; rule: (value: any) => Boolean }> {
        return Object.keys(content).map((key) => {
            return {
                key,
                rule: (value) => {
                    const config = content[key];
                    // 必须
                    if (config.require) {
                        if (!value) {
                            return false;
                        }
                    }
                    // 判断类型
                    if (config.type && value) {
                        if (config.type === Object) {
                            if (typeof value !== 'object') {
                                return false;
                            }
                        }
                        if (config.type === String) {
                            if (typeof value !== 'string') {
                                return false;
                            }
                        }
                        if (config.type === Number) {
                            if (typeof value !== 'number') {
                                return false;
                            }
                        }
                        if (config.type === Boolean) {
                            if (typeof value !== 'boolean') {
                                return false;
                            }
                        }
                        if (config.type === Array) {
                            if (!isArray(value)) {
                                return false;
                            }
                        }
                    }
                    if (config.validator) {
                        return config.validator(value);
                    }
                    return true;
                }
            };
        });
    }
    init() {
        return async (ctx: Context, next: Next) => {
            const controller = ctx.controller;
            if (!controller) return await next();
            // 没有参数
            if (!controller.content || !controller.exts) {
                return await next();
            }

            // 验证content
            if (controller.content && !isEmpty(controller.content)) {
                if (ctx.request.body?.content) {
                    const content = controller.content;
                    const isIllegal = isIllegalObjectSync(ctx.request.body.content, this.valid(content));
                    if (isIllegal) {
                        return ctx.fail({
                            code: 10601,
                            developMsg: `参数content的${isIllegal.join('、')}检验失败`,
                            error: '参数检验失败'
                        });
                    }
                } else {
                    return ctx.fail({
                        code: 10601,
                        developMsg: 'content为null',
                        error: '参数验证失败'
                    });
                }
            }
            // 验证query
            if (controller.query && !isEmpty(controller.query)) {
                if (ctx.query) {
                    const content = controller.query;
                    const isIllegal = isIllegalObjectSync(ctx.query, this.valid(content));
                    if (isIllegal) {
                        return ctx.fail({
                            code: 10601,
                            developMsg: `url参数的${isIllegal.join('、')}检验失败`,
                            error: 'url参数检验失败'
                        });
                    }
                } else {
                    return ctx.fail({
                        code: 10601,
                        developMsg: '参数为空',
                        error: 'url参数验证失败'
                    });
                }
            }
            // 验证exts
            if (controller.exts && !isEmpty(controller.exts)) {
                if (ctx.request.body?.exts) {
                    const exts = controller.exts;
                    const isIllegal = isIllegalObjectSync(ctx.request.body.exts, this.valid(exts));
                    if (isIllegal) {
                        return ctx.fail({
                            code: 10602,
                            developMsg: `exts${isIllegal.join('、')}检验失败`,
                            error: '参数检验失败'
                        });
                    }
                } else {
                    return ctx.fail({
                        code: 10602,
                        developMsg: 'exts为null',
                        error: '参数验证失败'
                    });
                }
            }
            return await next();
        };
    }
}
