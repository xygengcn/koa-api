import { ApiRequestMethod } from '@/core';
import { Context, Next, ApiMiddleware, ApiMiddlewareParams, ApiErrorCode, ApiErrorCodeMessage } from '../../index';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware.decorator';
@Middleware('ApiRequestMiddleware')
export class ApiRequestMiddleware implements ApiMiddleware {
    public resolve({ stack, options }: ApiMiddlewareParams) {
        /**
         * 验证方法
         */
        return async (ctx: Context, next: Next) => {
            if (ctx && stack) {
                if (!stack.methods.includes(ctx.method) && !stack.methods.includes(ApiRequestMethod.ALL)) {
                    throw new ApiError({
                        code: ApiErrorCode.illegalMethod,
                        error: options.error?.message?.['illegalMethod'] || ApiErrorCodeMessage.illegalMethod,
                        developMsg: `Please request through ${stack.methods?.join('、')}.`
                    });
                }
            }
            await next();
        };
    }
}
