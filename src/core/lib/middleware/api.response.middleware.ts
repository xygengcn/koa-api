import { ApiMiddleware, ApiMiddlewareParams, ApiResponseType, Context, Next } from '../../index';
import { Middleware } from '../decorators/api.middleware.decorator';

@Middleware('ApiResponseMiddleware')
export class ApiResponseMiddleware implements ApiMiddleware {
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
                return;
            }
            if (route?.responseType === ApiResponseType.REDIRECT) {
                ctx.body && ctx.redirect(ctx.body as string);
            }
        };
    }
}
