import { ApiRequestMethod, Context, Next, ApiMiddleware, ApiMiddlewareParams, ApiErrorCode, ApiErrorCodeMessage } from '../../typings';
import ApiError from '../../base/api.error';
import { Middleware } from '../decorators/api.middleware.decorator';
@Middleware('ApiRequestMiddleware')
export default class ApiRequestMiddleware implements ApiMiddleware {
    public resolve({ stack, options }: ApiMiddlewareParams) {
        /**
         * 验证方法
         */
        return async (ctx: Context, next: Next) => {
            if (ctx && stack) {
                if (!stack.methods.includes(ctx.method) && !stack.methods.includes(ApiRequestMethod.ALL)) {
                    throw new ApiError({
                        code: ApiErrorCode.illegalMethod,
                        userMsg: ApiErrorCodeMessage.illegalMethod,
                        error: `Please request through ${stack.methods?.join('、')}.`
                    });
                }
            }
            await next();
        };
    }
}
