import { Middleware } from '@/decorators';
import ApiLogger from '@/logger';
import { IApiClassMiddleware } from '@/typings/middleware';
import { Context, Next } from 'koa';
import { Logger } from '@/decorators';
import { stringifyError } from '@/utils';
@Middleware('ApiResponseMiddleware')
export default class ApiResponseMiddleware implements IApiClassMiddleware {
    @Logger('error')
    private readonly logger!: ApiLogger;
    resolve() {
        return async (ctx: Context, next: Next) => {
            try {
                await next();
                // 返回错误和重定向问题
                if (ctx.body instanceof Error || ![200, 301, 204].includes(ctx.status)) {
                    throw ctx.body;
                }
                // status转换
                if (ctx.status === 204) {
                    ctx.status = 200;
                }
                ctx.body = {
                    code: 200,
                    data: ctx.body || null,
                    userMsg: undefined,
                    updateTime: Date.now()
                };
            } catch (error) {
                this.logger.log(error);
                const errorJson = stringifyError(error);
                ctx.body = {
                    code: errorJson?._code || typeof errorJson?.code === 'number' ? errorJson?.code : ctx.status || 500,
                    error: error instanceof Error ? errorJson : null,
                    userMsg: typeof errorJson === 'string' ? errorJson : errorJson?.userMsg || errorJson?.message || null,
                    updateTime: Date.now()
                };
            }
        };
    }
}
