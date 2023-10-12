import { Middleware } from '@/decorators';
import ApiLogger from '@/logger';
import { IApiClassMiddleware } from '@/typings/middleware';
import { Context, Next } from 'koa';
import { Logger, Options } from '@/decorators';
import { stringifyError, isFunction } from '@/utils';
import { IOptions } from '@/typings';
@Middleware('ApiResponseMiddleware')
export default class ApiResponseMiddleware implements IApiClassMiddleware {
    @Logger()
    private readonly logger!: ApiLogger;

    @Options()
    private readonly options!: IOptions;
    resolve() {
        return async (ctx: Context, next: Next) => {
            try {
                await next();

                // 设置头部
                const contentType: string = ctx.response.headers?.['content-type'] as string;

                // 跳过eventStream
                if (contentType?.indexOf('text/event-stream') > -1) {
                    return;
                }
                // 返回错误和重定向问题
                if (ctx.body instanceof Error || ![200, 301, 204].includes(ctx.status)) {
                    throw ctx.body;
                }

                if (contentType?.indexOf('application/json') > -1 || !contentType || ctx.body === null) {
                    ctx.status = 200;
                    ctx.message = 'OK';
                    ctx.body = {
                        code: 200,
                        data: ctx.body || null,
                        error: null,
                        userMsg: undefined,
                        updateTime: Date.now()
                    };
                }
            } catch (error) {
                error && this.logger.error(`[http] ${ctx.path}`, error);
                // 存在错误处理
                if (isFunction(this.options.responseOptions?.handler)) {
                    return this.options.responseOptions?.handler?.(ctx, error as Error);
                }
                // 默认执行
                const errorJson = stringifyError(error);
                ctx.set('content-type', 'application/json');
                // 返回错误
                if (this.options.responseOptions?.allowErrorStatusCode) {
                    ctx.status = 500;
                    ctx.message = ctx.message || 'Request Fail';
                }
                ctx.body = {
                    code: errorJson?.code || 500,
                    data: null,
                    error: error instanceof Error ? errorJson.stack : null,
                    userMsg: typeof errorJson === 'string' ? errorJson : errorJson?.userMsg || errorJson?.message || errorJson?.name || null,
                    updateTime: Date.now()
                };
            }
        };
    }
}
