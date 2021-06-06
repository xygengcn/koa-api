import http from 'http';
import Koa, { Context } from 'koa';
import Log from './app.log';
import debug from 'debug';
import Router from 'koa-router';
import AppMiddlewareCore from './app.middlewareCore';
import appEventCore from './app.eventCore';
import { IAppMiddlewareOptions } from '@core/type/controller';

/**
 * 主要启动程序，继承于Koa
 */
class App {
    constructor() {
        this.koa = new Koa();
        this.middleware = new AppMiddlewareCore();
    }

    /**
     * 初始化koa对象
     */
    private koa: Koa;

    private middleware: AppMiddlewareCore;

    /**
     * http服务
     */
    private server: http.Server | null = null;

    /**
     * 默认端口
     */
    private port: string | number = 3000;

    /**
     * 启动处理额外的中间件
     */
    private initMiddleware(): void {
        this.middleware.init((middlewares) => {
            middlewares.forEach((middleware) => {
                this.koa.use(middleware);
            });
        });
    }

    /**
     * 服务器，错误拦截
     * Event listener for HTTP server "error" event.
     */
    private onServerError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                Log.error(`Port: ${this.port}: requires elevated privileges`);
                process.exit(1);
            case 'EADDRINUSE':
                Log.error(`${this.port}: is already in use`);
                process.exit(1);
            default:
                throw error;
        }
    }

    /**
     * 监听
     * Event listener for HTTP server "listening" event.
     */
    private onListening() {
        if (!this.server) return null;
        debug(`Listening on Port: ${this.port}, Addr: ${this.server.address()}`);
    }

    /**
     * 创建http服务
     * Create HTTP server.
     */
    private createServer() {
        this.server = http.createServer(this.koa.callback());
        this.server.listen(this.port);
        this.server.on('error', this.onServerError);
        this.server.on('listening', this.onListening);
    }

    /**
     * 插入路由前中间件
     * @param middleware 中间件
     */
    public use(middleware: Koa.Middleware) {
        return this.beforeRouteUse(middleware);
    }

    /**
     * 插入路由前中间件
     * @param middleware 中间件
     */
    public beforeRouteUse(middleware: Koa.Middleware | Router.IMiddleware): void {
        this.middleware.beforeRouteUse(middleware);
    }

    /**
     * 插入路由后中间件
     * @param middleware 中间件
     */
    public afterRouteUse(middleware: Koa.Middleware | Router.IMiddleware): void {
        this.middleware.afterRouteUse(middleware);
    }

    /**
     * 请求预警回调
     * @param callback
     */
    public onError(callback: (ctx: Context, content: any) => any): void {
        appEventCore.onError(callback);
    }

    /**
     * 设置跨域配置
     */
    public cors(options: IAppMiddlewareOptions) {
        this.middleware.setOptions(options);
    }

    /**
     * 启动程序
     * @param port 端口
     */
    public start(port: number = 3000): void {
        this.port = port;
        this.initMiddleware();
        this.createServer();
    }
}
export default new App();
