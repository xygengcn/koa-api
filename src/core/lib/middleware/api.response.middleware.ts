import { ApiMiddleware, ApiMiddlewareParams, ApiResponseType, Context, Next } from '../../typings';
import { Middleware } from '../decorators/api.middleware.decorator';

@Middleware('ApiResponseMiddleware')
export default class ApiResponseMiddleware implements ApiMiddleware {
    resolve({ route, options }: ApiMiddlewareParams) {
        return async (ctx: Context, next: Next) => {
            await next();
            if (route?.responseType === ApiResponseType.RESTFUL && options.response?.type === ApiResponseType.RESTFUL) {
                ctx.set('content-type', 'application/json');
                ctx.body = {
                    code: 200,
                    data: ctx.body || null,
                    updateTime: new Date().getTime()
                };
                // 处理返回格式
                if (options.response?.handle && typeof options.response.handle === 'function') {
                    ctx.body = options.response.handle(ctx.body, ctx);
                }
                return;
            }
            if (route?.responseType === ApiResponseType.REDIRECT) {
                ctx.body && ctx.redirect(ctx.body as string);
            }
        };
    }
}
