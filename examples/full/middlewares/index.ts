import { Middleware } from '@/decorators';
import { ApiFunctionMiddleware, IApiClassMiddleware } from '@/typings';
import { Context } from 'koa';

/**
 * 中间件测试
 */
@Middleware()
export class TestStringMiddleware implements IApiClassMiddleware {
    resolve(): ApiFunctionMiddleware<any, any> {
        return (ctx: Context) => {
            ctx.body = {
                text: 'hello world'
            };
        };
    }
}

@Middleware()
export class TestNumberMiddleware implements IApiClassMiddleware {
    resolve(): ApiFunctionMiddleware<any, any> {
        return (ctx: Context) => {
            ctx.body = {
                text: 222
            };
        };
    }
}
