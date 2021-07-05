/**
 * 内置中间件，重写返回格式、拓展字段、错误处理
 */
import Koa, { ResponseOptions } from 'koa';
import { isArray, isObject } from 'lodash';
import Middleware from './app.decorator';
import appControllerCore from './app.core.controller';
import appEventCore from './app.core.event';
import { AppMiddleware, IHttpContent, IResponse, ResponseType } from '@core/typings/app';
@Middleware()
export default class AppMiddlewareInit implements AppMiddleware {
    /**
     * 整理返回格式
     * @param ctx
     */
    private formatContent(
        ctx: Koa.Context,
        options: {
            code: number;
            startTime: number;
            error?: string;
            developMsg?: string;
        }
    ): IResponse {
        //请求参数
        const request = {
            params: ctx.params || {},
            query: ctx.request.body,
        };
        // 请求结果
        const content: IHttpContent = {
            type: ctx.method,
            name: ctx.routerName,
            status: ctx.status,
            time: new Date().getTime() - options.startTime,
            updateTime: options.startTime,
            request,
            respone: ctx.body,
            path: ctx.url,
            error: options.code === 200 || ctx.code === 200 ? null : options.error || '内部服务器报错',
            code: (isObject(ctx.body) && ctx.body.code) || options.code || 500,
            clientIP: ctx.ip || ctx.ips,
            referer: ctx.request.headers.origin || ctx.request.headers.referer || '',
        };
        return {
            type: options.code === 200 || ctx.code === 200 ? 'success' : 'error',
            content: {
                type: 'http',
                content,
            },
        };
    }

    /**
     * 最后处理数据
     * @param ctx
     * @param content
     */
    private finally(ctx: Koa.Context, content: IResponse) {
        // 请求结果回调
        ctx.$event.emitHttp(ctx, content);
        // 错误回调
        if (content.type === 'error') {
            const httpContent = content.content.content as IHttpContent;
            ctx.fail(httpContent.error, httpContent.code, {
                developMsg: httpContent.developMsg,
            });
        }
    }

    /**
     * 成功返回
     * @param ctx
     * @param data
     * @param msg
     * @param option
     */
    private success(ctx: Koa.Context, data: string | number | object | undefined, option?: ResponseOptions): void {
        ctx.type = (option && option.type) || ResponseType.json;
        if (ctx.type === ResponseType.json) {
            ctx.body = {
                code: (option && option.successCode) || 200,
                data: data || {},
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
            error: error || (option && option.error) || 'fail',
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
            //请求开始时间
            const startTime: number = new Date().getTime();
            // 请求结果
            let responeContent: IResponse | null = null;
            //成功返回
            ctx.success = (data, option?) => {
                this.success(ctx, data, option);
            };
            // 失败返回
            ctx.fail = (error, code, option?): void => {
                this.fail(ctx, error, code, option);
            };
            // 拓展字段
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
            // 事件监听
            ctx.$event = appEventCore;

            // 错误处理
            try {
                await next();
                if ((isObject(ctx.body) && ctx.body.code === 200) || ctx.status === 200) {
                    responeContent = this.formatContent(ctx, {
                        code: (isObject(ctx.body) && ctx.body.code) || ctx.status,
                        error: isObject(ctx.body) && ctx.body.error,
                        startTime,
                    });
                } else if (isObject(ctx.body) && ctx.body.code) {
                    responeContent = this.formatContent(ctx, {
                        code: ctx.body.code,
                        startTime,
                        error: ctx.body.error,
                    });
                } else {
                    responeContent = this.formatContent(ctx, {
                        code: 404,
                        startTime,
                        error: 'Not Found',
                    });
                }
            } catch (e) {
                responeContent = this.formatContent(ctx, {
                    code: e && e.code,
                    startTime,
                    error: e && e.error,
                    developMsg: (e && e.developMsg) || `${e}`,
                });
            } finally {
                responeContent && this.finally(ctx, responeContent);
            }
        };
    }
}
