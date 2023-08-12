import { Middleware } from '@/decorators';
import ApiLogger from '@/logger';
import { IApiClassMiddleware } from '@/typings/middleware';
import { Context, Next } from 'koa';
import { Logger } from '@/decorators';
import { stringifyError } from '@/utils';
@Middleware('ApiResponseMiddleware')
export default class ApiResponseMiddleware implements IApiClassMiddleware {
    @Logger()
    private readonly logger!: ApiLogger;
    resolve() {
        return async (ctx: Context, next: Next) => {
            try {
                await next();
                // 返回错误和重定向问题
                if (ctx.body instanceof Error || ![200, 301, 204].includes(ctx.status)) {
                    throw ctx.body;
                }
                // 设置头部
                const contentType: string = ctx.response.headers?.['content-type'] as string;
                if (contentType?.indexOf('application/json') > -1 || !contentType || ctx.body === null) {
                    ctx.status = 200;
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
                const errorJson = stringifyError(error);
                ctx.set('content-type', 'application/json');
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
