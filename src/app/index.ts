import ApiServer from './api.server';
import http from 'http';
import ApiKoa from './api.koa';
import { IOptions } from '@/typings';
import { ApiClassMiddleware, ApiFunctionMiddleware } from '@/typings/middleware';

export default class Api extends ApiServer {
    constructor(options: IOptions = {}) {
        super(options);
        this.app = new ApiKoa(options);
    }

    /**
     * koa程序
     */
    private app!: ApiKoa;

    /**
     * 插入中间件
     *
     * 先插入，先执行
     *
     * @param middleware
     */
    public use(...middlewares: Array<ApiClassMiddleware | ApiFunctionMiddleware>) {
        this.app.useMiddleware(...middlewares);
        return this;
    }

    /**
     *  返回http
     */
    public callback() {
        return this.app.callback();
    }

    /**
     * 启动
     * @param options
     * @param callback
     * @returns
     */
    public start(callback: Array<(server: http.Server) => void> = []): Api {
        this.logger.emit('start');
        this.startServer(this.app.callback(), callback);
        return this;
    }
}
