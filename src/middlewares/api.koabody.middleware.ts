import { Middleware, Options } from '@/decorators';
import { IApiClassMiddleware } from '@/typings/middleware';
import bodyParser from 'koa-body';
import { IOptions } from '@/typings';
@Middleware('ApiKoaBodyMiddleware')
export default class ApiKoaBodyMiddleware implements IApiClassMiddleware {
    @Options()
    private readonly options!: IOptions;

    resolve() {
        return bodyParser({
            multipart: true,
            ...this.options.koaBody
        });
    }
}
