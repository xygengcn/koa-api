import { Context, Next, ApiMiddleware, ApiMiddlewareParams, ApiErrorCode, ApiErrorCodeMessage } from '../../index';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware';
import apiEvent from '@/core/base/api.event';
@Middleware('ApiErrorMiddleware')
export class ApiErrorMiddleware implements ApiMiddleware {
    private error({ ctx, options }: ApiMiddlewareParams) {
        switch (ctx.status) {
            case 404:
                throw new ApiError({
                    code: ApiErrorCode.notFound,
                    error: options.error?.message['notFound'] || ApiErrorCodeMessage.notFound
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
    private verifyMethod({ stack, ctx, options }: ApiMiddlewareParams) {
        if (ctx && stack) {
            if (!stack.methods.includes(ctx.method)) {
                throw new ApiError({
                    code: ApiErrorCode.illegalMethod,
                    error: options.error?.message?.['illegalMethod'] || ApiErrorCodeMessage.illegalMethod,
                    developMsg: `Please request through ${stack.methods?.join('、')}.`
                });
            }
        }
    }

    public resolve({ stack, route, options }: ApiMiddlewareParams) {
        return async (ctx: Context, next: Next) => {
            try {
                this.verifyMethod({ stack, route, options, ctx });
                await next();
                if (ctx.status !== 200) {
                    this.error({ ctx, stack, route, options });
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
                            code: ApiErrorCode.unknown,
                            error: options.error?.message?.['unknown'] || ApiErrorCodeMessage.unknown,
                            developMsg: error
                        };
                    }
                }
                ctx.body = {
                    code: ApiErrorCode.unknown,
                    error: options.error?.message?.['unknown'] || ApiErrorCodeMessage.unknown,
                    ...((error as Object) || {}),
                    updateTime: new Date().getTime()
                };
            }
        };
    }
}
