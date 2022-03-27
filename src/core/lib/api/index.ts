import ApiServer from './api.server';
import http from 'http';
import { ApiClassMiddleware, ApiDefaultOptions, ApiFunctionMiddleware, ApiOptions } from '../../index';
import ApiKoa from './api.koa';
export default class Api extends ApiServer {
    constructor(options?: ApiDefaultOptions) {
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
    public use(middleware: ApiFunctionMiddleware) {
        this.app.pushUseMiddleware(middleware);
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
     * 插入中间件
     * @param middleware
     */
    public useMiddleware(middleware: ApiClassMiddleware) {
        this.app.useMiddleware(middleware);
        return this;
    }

    /**
     * 插入中间件
     * @param middleware
     */
    public unshiftUseMiddleware(middleware: ApiClassMiddleware) {
        this.app.unshiftUseMiddleware(middleware);
    }

    /**
     *  返回http
     */
    public callback(): ApiOptions['server'] {
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
    public run(callback: (options: ApiOptions) => void): void {
        const server = this.app.callback();
        callback({
            server,
            options: this.app.appDefaultOptions,
            middlewares: this.app.extendMiddleware
        });
    }
}
