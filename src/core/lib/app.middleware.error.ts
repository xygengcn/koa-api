/**
 * 内置错误处理中间件，和打印日志
 */
import { ILog, ILogType } from '@core/type/log';
import Koa from 'koa';
import Log from '@core/lib/app.log';
import Middleware from './app.middleware';
import { IAppControllerCoreRequestOption, IAppMiddleware } from '@core/type/controller';
@Middleware()
export default class AppMiddlewareError implements IAppMiddleware {
    /**
     * 控制器日志
     * @param ctx
     * @param code 代码
     * @param updateTime 启动时间
     * @param content 内容
     * @param developMsg 开发信息
     * @returns
     */
    private log(
        ctx: Koa.Context,
        options: {
            code: number;
            updateTime: number;
            content?: string;
            developMsg?: string;
        }
    ): boolean {
        //请求参数
        const request = {
            params: ctx.params,
            query: ctx.request.body,
        };
        // 日志内容
        const content = {
            subType: ctx.method,
            developMsg: options.developMsg,
            content: {
                name: ctx.routerName,
                type: ctx.method,
                time: new Date().getTime() - options.updateTime,
                updateTime: options.updateTime,
                request,
                respone: ctx.body,
                path: ctx.url,
                content: options.content || '内部服务器报错',
                code: (ctx.body && ctx.body.code) || options.code || 500,
                clientIP: ctx.ip || ctx.ips,
                referer: ctx.request.headers.origin || ctx.request.headers.referer,
            },
        };
        // 日志体
        const log: ILog = {
            type: options.code === 200 || ctx.code === 200 ? ILogType.success : ILogType.error,
            content,
        };

        const exts: IAppControllerCoreRequestOption = ctx.exts();
        // 错误回调
        if (log.type === ILogType.error) {
            ctx.$event.emitError(ctx, log);
            ctx.fail(content.content.content, content.content.code, {
                developMsg: content.developMsg,
            });
        }
        return Log.w(log, exts.log);
    }
    /**
     * 中间件：错误处理，请求错误，日志处理
     * @returns
     */
    public init() {
        return async (ctx: Koa.Context, next: Koa.Next) => {
            const updateTime: number = new Date().getTime(); //请求时间
            try {
                await next();
                if ((ctx.body && ctx.body.code === 200) || ctx.status === 200) {
                    this.log(ctx, { code: ctx.body.code, updateTime });
                } else if (ctx.body && ctx.body.code) {
                    this.log(ctx, { code: ctx.body.code, updateTime, content: ctx.body.error });
                } else {
                    this.log(ctx, { code: 404, updateTime, content: 'Not Found' });
                }
            } catch (e) {
                this.log(ctx, {
                    code: e && e.code,
                    updateTime,
                    content: e && e.error,
                    developMsg: (e && e.developMsg) || `${e}`,
                });
            }
        };
    }
}
