import { ApiMiddlewareParams, ApiMiddleware } from './../../typings/index';
import koaBody from 'koa-body';
import { Middleware } from '../decorators/api.middleware';
import ApiError from '../../base/api.error';
@Middleware('ApiBodyMiddleware')
export class ApiBodyMiddleware implements ApiMiddleware {
    resolve({ options }: ApiMiddlewareParams) {
        return koaBody({
            multipart: true,
            onError: (e) => {
                throw new ApiError({
                    code: 10501,
                    error: 'Incorrect body',
                    developMsg: `${e}`
                });
            },
            ...(options.koaBody || {})
        });
    }
}
