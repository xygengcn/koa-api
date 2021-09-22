/**
 * 内置中间件，重写返回格式、拓展字段、错误处理
 */
import Koa from 'koa';
import { isObject } from 'lodash';
import Middleware from '../decorators/middleware';
import appEventBus from '../event';
import Config from '@lib/config';
import { ResponseType } from '@typings/enum';
import appRoutes from '@lib/class/app.routes';
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
            developMsg?: any;
        }
    ): DefaultContent {
        //请求参数
        const request = {
            header: ctx.header,
            params: ctx.params || {},
            query: ctx.body || {}
        };
        // 请求结果
        const content: HttpContent = {
            type: ctx.method,
            path: ctx.url,
            name: ctx.routerName,
            status: ctx.status,
            request,
            response: '',
            time: new Date().getTime() - options.startTime,
            updateTime: options.startTime,
            error: options.code === 200 || ctx.code === 200 ? null : options.error || '内部服务器报错',
            code: (isObject(ctx.body) && ctx.body.code) || options.code || 500,
            clientIP: ctx.ip || ctx.ips,
            developMsg: options?.developMsg
        };
        return {
            type: options.code === 200 || ctx.code === 200 ? 'info' : 'error',
            subType: 'http',
            content
        };
    }

    /**
     * 配置处理
     * @returns
     */
    private setOptions(ctx: Koa.Context, options?: ResponseOptions | ResponseError): ResponseOptions | ResponseError {
        options = {
            ...(options || {}),
            headers: {
                version: Config.get('version'),
                author: Config.get('author'),
                'Content-Type': 'application/json;charset=utf-8',
                ...(options?.headers || {})
            }
        };
        if (options?.headers) {
            Object.keys(options.headers).forEach((key) => {
                if (options?.headers && options.headers[key]) {
                    ctx.set(key, options.headers[key]);
                }
            });
        }
        return options;
    }

    /**
     * 最后处理数据
     * @param ctx
     * @param content
     */
    private finally(ctx: Koa.Context, content: DefaultContent) {
        // 请求结果回调
        ctx.$event.emitHttp(content, ctx);
        // 错误回调
        if (content.type === 'error') {
            const httpContent = content.content as HttpContent;
            // 请求头设置
            const options = this.setOptions(ctx, {
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                developMsg: httpContent.developMsg
            });
            ctx.fail({ error: httpContent.error, code: httpContent.code, ...options });
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
        // 请求头设置
        options = this.setOptions(ctx, options);
        if (ctx.type === ResponseType.json) {
            ctx.body = {
                code: 200,
                data: data || {},
                updateTime: new Date().getTime()
            };
        } else {
            ctx.body = data as any;
        }
    }

    /**
     * 错误返回
     * @param ctx
     * @param error 错误文本
     * @param code 错误代码
     * @param options
     */
    private fail(ctx: Koa.Context, options: ResponseError) {
        // 类型
        ctx.type = ResponseType.json;
        ctx.body = {
            code: options?.code || 404,
            error: options?.error || 'fail',
            developMsg: options?.developMsg,
            updateTime: new Date().getTime()
        };
    }

    /**
     * 获取单个路由额外参数
     * @param ctx
     * @returns
     */
    private getController(ctx: Koa.Context) {
        const matched = appRoutes.match(ctx.path, ctx.method);
        if (matched && matched.route) {
            const method = matched.path[0];
            const controller = appRoutes.getControlleOptions(method.name);
            return controller;
        }
        return undefined;
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
            let responseContent: DefaultContent | null = null;
            //成功返回
            ctx.success = (data, option?) => {
                this.success(ctx, data, option);
            };
            // 失败返回
            ctx.fail = (option): void => {
                this.fail(ctx, option);
            };
            // 拓展字段
            ctx.controller = this.getController(ctx);
            // 事件监听
            ctx.$event = appEventBus;

            // 错误处理
            try {
                await next();
                if ((isObject(ctx.body) && ctx.body.code === 200) || ctx.status === 200) {
                    responseContent = this.formatContent(ctx, {
                        code: (isObject(ctx.body) && ctx.body.code) || ctx.status,
                        error: isObject(ctx.body) && ctx.body.error,
                        developMsg: isObject(ctx.body) && ctx.body.developMsg,
                        startTime
                    });
                } else if (isObject(ctx.body) && ctx.body.code) {
                    responseContent = this.formatContent(ctx, {
                        code: ctx.body.code,
                        startTime,
                        developMsg: isObject(ctx.body) && ctx.body.developMsg,
                        error: ctx.body.error
                    });
                } else {
                    responseContent = this.formatContent(ctx, {
                        code: 404,
                        startTime,
                        developMsg: isObject(ctx.body) && ctx.body.developMsg,
                        error: 'Not Found'
                    });
                }
            } catch (e: any) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('系统报错', e);
                }
                responseContent = this.formatContent(ctx, {
                    code: (e && e.code) || 500,
                    startTime,
                    error: e && e.error,
                    developMsg: (e && e.developMsg) || `${e}`
                });
                appEventBus.emitError(responseContent, ctx);
            } finally {
                responseContent && this.finally(ctx, responseContent);
            }
        };
    }
}
