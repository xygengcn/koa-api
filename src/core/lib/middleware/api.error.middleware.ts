import { Context, Next, ApiMiddleware, ApiMiddlewareParams, ApiErrorCode, ApiErrorCodeMessage } from '../../index';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware.decorator';
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

    public resolve({ stack, route, options }: ApiMiddlewareParams) {
        return async (ctx: Context, next: Next) => {
            try {
                await next();
                if (![200, 301, 204].includes(ctx.status)) {
                    this.error({ ctx, stack, route, options });
                }
            } catch (error) {
                ctx.status === 200;
                ctx.set('content-type', 'application/json');
                if (typeof error === 'string') {
                    error = new ApiError({
                        code: ApiErrorCode.serviceError,
                        error: {
                            developMsg: `${error}`
                        }
                    });
                }
                if (error instanceof Error && !(error instanceof ApiError)) {
                    error = new ApiError({
                        code: ApiErrorCode.serviceError,
                        error: {
                            ...error,
                            developMsg: `${error}`
                        }
                    });
                }
                if (error instanceof ApiError) {
                    ctx.body = {
                        ...error,
                        updateTime: new Date().getTime()
                    };
                } else {
                    ctx.body = {
                        code: ApiErrorCode.unknown,
                        error: {
                            developMsg: error
                        },
                        updateTime: new Date().getTime()
                    };
                }
                // 日志记录
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
                                routeName: route?.routeName,
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
            }
        };
    }
}
