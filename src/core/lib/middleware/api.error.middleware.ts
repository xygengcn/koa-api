import { Layer } from 'koa-router';
import { Context, Next, ApiMiddleware, ApiMiddlewareParams } from '../../index';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware';
import apiEvent from '@/core/base/api.event';
@Middleware('ApiErrorMiddleware')
export class ApiErrorMiddleware implements ApiMiddleware {
    private error(ctx: Context) {
        switch (ctx.status) {
            case 404:
                throw new ApiError({
                    code: 404,
                    error: 'Not Found'
                });
            default:
                throw new ApiError({
                    code: ctx.status,
                    error: ctx.body as any
                });
        }
    }

    /**
     * 过滤favicon.ico
     */
    public ignore?({ ctx }: ApiMiddlewareParams) {
        return ctx.path === '/favicon.ico';
    }
    /**
     * 验证方法
     */
    private verifyMethod(ctx: Context, stack: Layer | undefined) {
        if (ctx && stack) {
            if (!stack.methods.includes(ctx.method)) {
                throw new ApiError({
                    code: 10502,
                    error: 'Incorrect Method',
                    developMsg: `Please request through ${stack.methods?.join('、')}.`
                });
            }
        }
    }

    public resolve({ stack, route, options }: ApiMiddlewareParams) {
        return async (ctx: Context, next: Next) => {
            try {
                this.verifyMethod(ctx, stack);
                await next();
                if (ctx.status !== 200) {
                    this.error(ctx);
                }
            } catch (error) {
                apiEvent.emitError(
                    {
                        type: 'error',
                        subType: 'http',
                        content: error as Error
                    },
                    {
                        stack,
                        route,
                        options,
                        ctx
                    }
                );
                ctx.set('content-type', 'application/json');
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
                            error: 'Unknown Error',
                            developMsg: error
                        };
                    }
                }
                ctx.body = {
                    code: 10404,
                    error: 'Unknown Error',
                    ...((error as Object) || {}),
                    updateTime: new Date().getTime()
                };
            }
        };
    }
}
