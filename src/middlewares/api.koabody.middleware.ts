import { Middleware, Options } from '@/decorators';
import { IApiClassMiddleware } from '@/typings/middleware';
import { koaBody } from 'koa-body';
import { IOptions } from '@/typings';
import { Context, Next } from 'koa';
import { isFunction } from '@/utils';
@Middleware('ApiKoaBodyMiddleware')
export default class ApiKoaBodyMiddleware implements IApiClassMiddleware {
    @Options()
    private readonly options!: IOptions;

    resolve() {
        return async (ctx: Context, next: Next) => {
            try {
                await koaBody({
                    multipart: true,
                    ...this.options.koaBody,
                    onError: (error) => {
                        throw error;
                    }
                })(ctx, next);
            } catch (e) {
                if (isFunction(this.options.koaBody?.onError)) {
                    return this.options.koaBody?.onError?.(e as Error, ctx, next);
                }
                throw e;
            }
        };
    }
}
