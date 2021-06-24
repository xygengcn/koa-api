import Koa, { Middleware } from 'koa';
import AppMiddlewareError from './app.middleware.error';
import AppMiddlewareInit from './app.middleware.init';
import KoaJson from 'koa-json';
import KoaBodyParser from 'koa-bodyparser';
import AppMiddlewareAuth from './app.middleware.auth';
import AppMiddlewareCors from './app.middleware.cors';
import appControllerCore from './app.controllerCore';

export default class AppMiddlewareCore {
    /**
     * 路由前的中间件
     */
    private beforeRoutesMiddlewares: Array<Koa.Middleware> = [];

    /**
     * 路由后的中间件
     */
    private afterRoutesMiddlewares: Array<Koa.Middleware> = [];

    /**
     * 中间件配置
     */
    private middlewareOptions: Object = {};

    /**
     * 引入内置中间件
     * @param middleware
     * @param params
     * @returns
     */
    private useMiddleware(middleware: any): Koa.Middleware {
        return middleware.call(middleware, this.middlewareOptions);
    }

    /**
     * 初始化内置中间件
     */
    private initMiddleware(): void {
        this.beforeRouteUse(
            KoaBodyParser({
                enableTypes: ['json', 'form', 'text'],
            })
        );
        this.beforeRouteUse(KoaJson());
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareInit));
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareError));
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareCors));
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareAuth));
        this.afterRouteUse(appControllerCore.instance.routes() as Koa.Middleware);
    }

    /**
     * 设置内置中间件传值
     * @param name
     * @param options
     */
    public setOptions(options: any) {
        this.middlewareOptions = {
            ...this.middlewareOptions,
            ...options,
        };
    }

    /**
     * 插入路由前中间件
     * @param middleware 中间件
     */
    public beforeRouteUse(middleware: Middleware): void {
        this.beforeRoutesMiddlewares.push(middleware);
    }

    /**
     * 插入路由后中间件
     * @param middleware 中间件
     */
    public afterRouteUse(middleware: Middleware): void {
        this.afterRoutesMiddlewares.push(middleware);
    }

    /**
     * 返回所有中间件
     * @returns
     */
    public init(callback: (middlewares: Middleware[]) => void): void {
        this.initMiddleware();
        const middlewares = this.beforeRoutesMiddlewares.concat([], this.afterRoutesMiddlewares);
        callback(middlewares);
        this.middlewareOptions = {};
        this.beforeRoutesMiddlewares = [];
        this.afterRoutesMiddlewares = [];
    }
}
