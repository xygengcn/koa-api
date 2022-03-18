import ApiServer from './api.server';
import http from 'http';
import { ApiClassMiddleware, ApiDefaultOptions, ApiFunctionMiddleware } from '../../index';
import ApiKoa from './api.koa';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
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
    public callback(): (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void {
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
}
