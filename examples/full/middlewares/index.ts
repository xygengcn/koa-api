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
        return async (ctx: Context, next) => {
            await next();
            ctx.body = {
                text: 123456789
            };
        };
    }
}

@Middleware()
export class GlobalLogMiddleware implements IApiClassMiddleware {
    resolve(): ApiFunctionMiddleware<any, any> {
        console.log('[GlobalLogMiddleware] init');
        return async (ctx: Context, next) => {
            console.log('[GlobalLogMiddleware] start');
            ctx.set('Access-Control-Allow-Origin', '*');
            await next();
            console.log('[GlobalLogMiddleware] end');
        };
    }
}

@Middleware()
export class GlobalLogMiddleware2 implements IApiClassMiddleware {
    resolve(): ApiFunctionMiddleware<any, any> {
        console.log('[GlobalLogMiddleware2] init');
        return async (ctx: Context, next) => {
            console.log('[GlobalLogMiddleware2] start');
            await next();
            console.log('[GlobalLogMiddleware2] end');
        };
    }
}
