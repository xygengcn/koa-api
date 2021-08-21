/**
 * 内置中间件，重写返回格式、拓展字段、错误处理
 */
import Koa, { ResponseOptions } from 'koa';
import { isArray, isObject } from 'lodash';
import Middleware from './app.decorator';
import appControllerCore from './app.core.controller';
import appEventBus from './app.event';
import { AppMiddleware, IHttpContent, IResponse, ResponseType } from '@core/typings/app';
import Config from '@core/lib/app.config';
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
            header: ctx.header,
            params: ctx.params || {},
            query: ctx.body || {}
        };
        // 请求结果
        const content: IHttpContent = {
            type: ctx.method,
            name: ctx.routerName,
            status: ctx.status,
            time: new Date().getTime() - options.startTime,
            updateTime: options.startTime,
            request,
            response: ctx.body,
            path: ctx.url,
            error: options.code === 200 || ctx.code === 200 ? null : options.error || '内部服务器报错',
            code: (isObject(ctx.body) && ctx.body.code) || options.code || 500,
            clientIP: ctx.ip || ctx.ips,
            referer: ctx.request.headers.origin || ctx.request.headers.referer || ''
        };
        return {
            type: options.code === 200 || ctx.code === 200 ? 'success' : 'error',
            content: {
                type: 'http',
                content
            }
        };
    }

    /**
     * 配置处理
     * @returns
     */
    private setOptions(ctx: Koa.Context, options?: ResponseOptions): ResponseOptions {
        const option = {
            ...(options || {}),
            headers: {
                version: Config.get('version'),
                author: Config.get('author'),
                ...(options?.headers || {})
            }
        };
        if (option.headers) {
            Object.keys(option.headers).forEach((key) => {
                if (option.headers && option.headers[key]) {
                    ctx.append(key, option.headers[key]);
                }
            });
        }
        return option;
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
            // 请求头设置
            const options = this.setOptions(ctx, {
                developMsg: httpContent.developMsg
            });
            ctx.fail(httpContent.error, httpContent.code, options);
        }
    }

    /**
     * 成功返回
     * @param ctx
     * @param data
     * @param msg
     * @param option
     */
    private success(ctx: Koa.Context, data: string | number | object | undefined, options?: ResponseOptions): void {
        // 类型
        ctx.type = (options && options.type) || ResponseType.json;
        // 请求头设置
        options = this.setOptions(ctx, options);
        if (ctx.type === ResponseType.json) {
            ctx.body = {
                code: (options && options.successCode) || 200,
                data: data || {},
                updateTime: new Date().getTime()
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
     * @param options
     */
    private fail(ctx: Koa.Context, error: string | number | object | null, code: number, options?: ResponseOptions) {
        // 类型
        ctx.type = (options && options.type) || ResponseType.json;
        ctx.body = {
            code: code || (options && options.failCode) || 404,
            error: error || (options && options.error) || 'fail',
            developMsg: options && options.developMsg,
            updateTime: new Date().getTime()
        };
    }

    /**
     * 获取单个路由额外参数
     * @param ctx
     * @returns
     */
    private exts(ctx: Koa.Context) {
        const matched = appControllerCore.instance.match(ctx.path, ctx.method);
        if (matched && matched.route) {
            const method = matched.path[0];
            return (
                appControllerCore.instance.exts.get(method.name) || {
                    url: ctx.path
                }
            );
        }
        return {
            url: ctx.path
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
            let responseContent: IResponse | null = null;
            //成功返回
            ctx.success = (data, option?) => {
                this.success(ctx, data, option);
            };
            // 失败返回
            ctx.fail = (error, code, option?): void => {
                this.fail(ctx, error, code, option);
            };
            // 拓展字段
            ctx.exts = this.exts(ctx);
            // 事件监听
            ctx.$event = appEventBus;

            // 错误处理
            try {
                await next();
                if ((isObject(ctx.body) && ctx.body.code === 200) || ctx.status === 200) {
                    responseContent = this.formatContent(ctx, {
                        code: (isObject(ctx.body) && ctx.body.code) || ctx.status,
                        error: isObject(ctx.body) && ctx.body.error,
                        startTime
                    });
                } else if (isObject(ctx.body) && ctx.body.code) {
                    responseContent = this.formatContent(ctx, {
                        code: ctx.body.code,
                        startTime,
                        error: ctx.body.error
                    });
                } else {
                    responseContent = this.formatContent(ctx, {
                        code: 404,
                        startTime,
                        error: 'Not Found'
                    });
                }
            } catch (e) {
                responseContent = this.formatContent(ctx, {
                    code: e && e.code,
                    startTime,
                    error: e && e.error,
                    developMsg: (e && e.developMsg) || `${e}`
                });
            } finally {
                responseContent && this.finally(ctx, responseContent);
            }
        };
    }
}
