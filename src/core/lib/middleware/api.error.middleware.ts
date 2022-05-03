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
                if (![200, 301, 204].includes(ctx.status)) {
                    this.error({ ctx, stack, route, options });
                }
            } catch (error) {
                apiEvent.emitError(
                    {
                        type: 'error',
                        subType: 'http',
                        content: {
                            error,
                            updateTime: new Date().getTime(),
                            request: {
                                method: ctx.method,
                                headers: ctx.headers,
                                url: ctx.url,
                                routeName: route?.functionName,
                                querystring: ctx.querystring,
                                ip: ctx.ip,
                                ips: ctx.ips
                            }
                        }
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
                        code: ApiErrorCode.serviceError,
                        error
                    });
                }
                ctx.status === 200;
                if (error instanceof ApiError) {
                    ctx.body = error;
                } else {
                    if (typeof error !== 'object') {
                        error = {
                            developMsg: error
                        };
                    }
                }
                ctx.body = {
                    code: ApiErrorCode.unknown,
                    error: error || options.error?.message?.['unknown'] || ApiErrorCodeMessage.unknown,
                    updateTime: new Date().getTime()
                };
            }
        };
    }
}
