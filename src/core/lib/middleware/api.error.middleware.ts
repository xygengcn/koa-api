import { Context, Next, ApiMiddleware } from '../../index';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware';
@Middleware('ApiErrorMiddleware')
export class ApiErrorMiddleware implements ApiMiddleware {
    private error(ctx: Context) {
        switch (ctx.status) {
            case 404:
                throw new ApiError({
                    code: 404,
                    error: '未找到此接口'
                });
            default:
                throw new ApiError({
                    code: ctx.status,
                    error: ctx.body as any
                });
        }
    }
    public match() {
        return true;
    }
    public resolve() {
        return async (ctx: Context, next: Next) => {
            try {
                await next();
                if (ctx.status !== 200) {
                    this.error(ctx);
                }
            } catch (error) {
                if (error instanceof Error) {
                    error = new ApiError({
                        code: 10500,
                        error: error.message,
                        ...error
                    });
                }
                ctx.status === 200;
                if (error instanceof ApiError) {
                    ctx.body = error;
                } else {
                    if (typeof error !== 'object') {
                        error = {
                            code: 10404,
                            error: '未知错误',
                            developMsg: error
                        };
                    }
                }
                ctx.body = {
                    code: 10404,
                    error: '未知错误',
                    ...((error as Object) || {}),
                    updateTime: new Date().getTime()
                };
            }
        };
    }
}
