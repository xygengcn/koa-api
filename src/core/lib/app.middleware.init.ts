/**
 * 内置中间件，重写返回格式、拓展字段
 */
import Koa, { ResponseOptions } from 'koa';
import { isArray, isObject } from 'lodash';
import Middleware from './app.decorator';
import appControllerCore from './app.controllerCore';
import appEventCore from './app.eventCore';
import { AppMiddleware, ResponseType } from '@core/typings/app';
@Middleware()
export default class AppMiddlewareInit implements AppMiddleware {
    /**
     * 成功返回
     * @param ctx
     * @param data
     * @param msg
     * @param option
     */
    private success(ctx: Koa.Context, data: string | number | object | undefined, msg?: string | object | undefined, option?: ResponseOptions): void {
        ctx.type = (option && option.type) || ResponseType.json;
        if (ctx.type === ResponseType.json) {
            ctx.body = {
                code: (option && option.successCode) || 200,
                data: data || {},
                msg,
                updateTime: new Date().getTime(),
            };
        } else {
            const text = isArray(data) || isObject(data) ? JSON.stringify(data) : data;
            ctx.body = String(text) || '';
        }
    }

    /**
     * 错误返回
     * @param ctx
     * @param error 错误文本
     * @param code 错误代码
     * @param option
     */
    private fail(ctx: Koa.Context, error: string | number | object | null, code: number, option?: ResponseOptions) {
        // 处理返回数据
        ctx.type = (option && option.type) || ResponseType.json;
        ctx.body = {
            code: code || (option && option.failCode) || 404,
            error: error || (option && option.successMsg) || 'fail',
            developMsg: option && option.developMsg,
            updateTime: new Date().getTime(),
        };
    }
    /**
     * 中间件：处理返回
     * @param option
     * @returns
     */
    public init() {
        return async (ctx: Koa.Context, next: Koa.Next) => {
            ctx.success = (data, msg?, option?) => {
                this.success(ctx, data, msg, option);
            };
            ctx.fail = (error, code, option?): void => {
                this.fail(ctx, error, code, option);
            };
            ctx.exts = () => {
                const matched = appControllerCore.instance.match(ctx.path, ctx.method);
                if (matched && matched.route) {
                    const method = matched.path[0];
                    return appControllerCore.instance.exts.get(method.name);
                }
                return {
                    url: ctx.path,
                };
            };
            ctx.$event = appEventCore;
            await next();
        };
    }
}
