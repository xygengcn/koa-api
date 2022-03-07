import koaBody from 'koa-body';
import { ApiDefaultOptions, IApiClassMiddleware } from '../../index';
import Middleware from '../decorators/api.middleware';
import ApiError from '../../base/api.error';
@Middleware('ApiBodyMiddleware')
export class ApiBodyMiddleware implements IApiClassMiddleware {
    resolve(apiOptions: ApiDefaultOptions) {
        return koaBody({
            multipart: true,
            onError: (e) => {
                throw new ApiError({
                    code: 10501,
                    error: '参数格式不对',
                    developMsg: `${e}`
                });
            },
            ...(apiOptions.koaBody || {})
        });
    }
}
