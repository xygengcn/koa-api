import { Context, Middleware } from 'koa';

// 默认中间件，函数
export type ApiFunctionMiddleware<T = any, K = any> = Middleware<T, K>;

// class中间件
export type ApiClassMiddleware<T = any> = { new (...args: any[]): T };
// 中间件继承类
export interface IApiClassMiddleware {
    created?(): void;
    resolve: () => ApiFunctionMiddleware;
    match?(ctx: Context): boolean;
    ignore?(ctx: Context): boolean;
}
