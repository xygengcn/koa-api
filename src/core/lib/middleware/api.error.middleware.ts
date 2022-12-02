import { Context, Next, ApiMiddleware, ApiMiddlewareParams, ApiErrorCode, ApiErrorCodeMessage } from '@/core/typings';
import ApiError from '@/core/base/api.error';
import { Middleware } from '../decorators/api.middleware.decorator';
import Logger from '@/core/base/api.logger';
import stringify from 'json-stringify-safe';
import { objectUpper } from '../utils/string';
@Middleware('ApiErrorMiddleware')
export class ApiErrorMiddleware implements ApiMiddleware {
    /**
     * 对于不同的status处理
     * @param param0
     */
    private error({ ctx, options }: ApiMiddlewareParams) {
        switch (ctx.status) {
            case 404:
                throw new ApiError({
                    code: ApiErrorCode.notFound,
                    userMsg: ApiErrorCodeMessage.notFound
                });
            default:
                throw new ApiError({
                    code: ctx.status,
                    userMsg: stringify(ctx.body)
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

                // 预设
                let developError = new ApiError({ code: ApiErrorCode.unknown, userMsg: '未知' });

                if (!(error instanceof ApiError)) {
                    // 处理字符串
                    if (typeof error === 'string') {
                        developError = new ApiError({
                            code: ApiErrorCode.serviceError,
                            userMsg: error
                        });
                    } else if (error instanceof Error) {
                        // 通用异常处理
                        developError = new ApiError({
                            code: ApiErrorCode.serviceError,
                            error,
                            userMsg: error.message
                        });
                    } else {
                        developError = new ApiError({
                            code: ApiErrorCode.unknown,
                            error: {
                                developMsg: stringify(error)
                            },
                            userMsg: '未知'
                        });
                    }
                } else {
                    developError = error;
                }

                // 处理用户提供处理函数
                if (options?.errHandle && typeof options.errHandle === 'function') {
                    developError = options.errHandle(error, developError) || developError;
                }

                // 处理特出错误
                if (developError instanceof ApiError) {
                    ctx.body = {
                        // 由于数据量问题，避免循环套嵌，只取前四级
                        ...objectUpper(developError),
                        updateTime: new Date().getTime()
                    };
                } else {
                    // 非法格式返回
                    const errMsg = stringify(developError);
                    ctx.body = {
                        code: ApiErrorCode.parseResponseError,
                        error: errMsg,
                        updateTime: new Date().getTime()
                    };
                }
                // 日志记录
                Logger(
                    {
                        type: 'error',
                        module: 'http'
                    },
                    {
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
