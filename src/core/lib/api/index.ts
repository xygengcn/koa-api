import ApiServer from './api.server';
import http from 'http';
import { ApiClassMiddleware, ApiOptions, ApiFunctionMiddleware, ApiRunOptions } from '../../index';
import ApiKoa from './api.koa';
export default class Api extends ApiServer {
    constructor(options?: ApiOptions) {
        super(options);
        this.app = new ApiKoa(options);
    }

    /**
     * koa程序
     */
    private app!: ApiKoa;

    /**
     * 插入中间件
     * @param middleware
     */
    public use(middleware: ApiFunctionMiddleware, index?: number) {
        this.app.pushUseMiddleware(middleware, index);
        return this;
    }

    /**
     * 插入中间件
     * @param middleware
     */
    public unshiftUse(middleware: ApiFunctionMiddleware) {
        this.app.unshiftUse(middleware);
        return this;
    }

    /**
     * 后插入中间件
     * @param middleware
     */
    public useMiddleware(middleware: ApiClassMiddleware, index?: number) {
        this.app.useMiddleware(middleware, index);
        return this;
    }

    /**
     * 前插入中间件
     * @param middleware
     */
    public unshiftUseMiddleware(middleware: ApiClassMiddleware) {
        this.app.unshiftUseMiddleware(middleware);
        return this;
    }

    /**
     *  返回http
     */
    public callback(): ApiRunOptions['server'] {
        return this.app.callback();
    }

    /**
     * 启动
     * @param options
     * @param callback
     * @returns
     */
    public start(callback: Array<(server: http.Server) => void> = []): Api {
        this.startServer(this.app.callback(), callback);
        return this;
    }

    /**
     * 不启动，获取相关配置
     * @param callback
     */
    public run(callback: (options: ApiRunOptions) => void): void {
        const server = this.app.callback();
        callback({
            server,
            middlewares: this.app.extendMiddleware,
            ...this.app.appDefaultOptions
        });
    }
}
