import Koa, { Middleware } from 'koa';
import AppMiddlewareInit from './app.middleware.init';
import KoaBody from 'koa-body';
import AppMiddlewareAuth from './app.middleware.auth';
import AppMiddlewareCors from './app.middleware.cors';
import AppRoutes from '../class/app.routes';
import AppControllerClass from '@lib/class/app.controller.class';
import AppMiddlewareData from './app.middleware.data';

export default class AppMiddlewareCore {
    constructor(options?: AppOptions) {
        if (options) {
            this.option(options);
        }
    }
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
    private middlewareOptions: AppOptions = {};

    /**
     * 引入内置中间件
     * @param middleware
     * @param params
     * @returns
     */
    private useMiddleware(middleware, _this = middleware): Koa.Middleware {
        return middleware.call(_this, this.middlewareOptions);
    }

    /**
     * 初始化内置中间件
     */
    private initMiddleware(): void {
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareInit));
        this.beforeRouteUse(
            KoaBody({
                multipart: true,
                onError: (e) => {
                    throw {
                        code: 10501,
                        error: '参数格式不对',
                        developMsg: `${e}`
                    };
                }
            })
        );
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareCors));
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareAuth));
        this.beforeRouteUse(this.useMiddleware(AppMiddlewareData));
        this.afterRouteUse(this.useMiddleware(AppRoutes.routes, AppRoutes));
    }

    /**
     * 获取自定义配置
     * @param callback
     */
    public controllers(callback: (controllers: { [key: string]: AppControllerClass }) => any) {
        callback(AppRoutes.controllers);
    }

    /**
     * 设置内置中间件传值
     * @param name
     * @param options
     */
    public option(options: AppOptions) {
        this.middlewareOptions = {
            ...this.middlewareOptions,
            ...options
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
        this.beforeRoutesMiddlewares = [];
        this.afterRoutesMiddlewares = [];
    }
}
