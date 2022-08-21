import stringify from 'json-stringify-safe';
import { ApiMiddlewareParams, ApiMiddleware, ApiErrorCode, ApiErrorCodeMessage } from './../../typings/index';
import koaBody from 'koa-body';
import { Middleware } from '../decorators/api.middleware.decorator';
import ApiError from '../../base/api.error';
@Middleware('ApiBodyMiddleware')
export default class ApiBodyMiddleware implements ApiMiddleware {
    resolve({ options }: ApiMiddlewareParams) {
        return koaBody({
            multipart: true,
            onError: (e) => {
                throw new ApiError({
                    code: ApiErrorCode.illegalBody,
                    error: stringify(e),
                    userMsg: ApiErrorCodeMessage.illegalBody
                });
            },
            ...(options.koaBody || {})
        });
    }
}
