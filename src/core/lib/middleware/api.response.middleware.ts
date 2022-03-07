import { ApiDefaultOptions, IApiClassMiddleware } from '../../index';
import Middleware from '../decorators/api.middleware';
@Middleware('ApiBodyMiddleware')
export class ApiBodyMiddleware implements IApiClassMiddleware {
    resolve(apiOptions: ApiDefaultOptions) {
        return () => {};
    }
}
