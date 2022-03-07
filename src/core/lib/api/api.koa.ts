import { ApiErrorMiddleware } from '../middleware/api.error.middleware';
import { ApiDefaultOptions, ApiClassMiddleware, ApiMiddleware } from '../../index';
import Koa from 'koa';
import compose from 'koa-compose';
import ApiRoutesMiddleware from '../middleware/api.routes.middleware';
import { ApiBodyMiddleware } from '../middleware/api.body.middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
export default class ApiKoa extends Koa {
    /**
     * 拓展中间件
     */
    public extendMiddleware: Array<ApiMiddleware> = [];

    /**
     * 配置
     */
    public appDefaultOptions: ApiDefaultOptions;

    constructor(options?: ApiDefaultOptions) {
        super(options);
        this.appDefaultOptions = options || {};
        this.useMiddleware([ApiErrorMiddleware, ApiBodyMiddleware, ApiRoutesMiddleware]);
    }

    /**
     * 引入内置中间件
     * @param middleware
     * @param params
     * @returns
     */
    public useMiddleware(middlewares: ApiClassMiddleware | Array<ApiClassMiddleware>): ApiKoa {
        if (!(middlewares instanceof Array)) {
            middlewares = [middlewares];
        }
        middlewares.forEach((middleware) => {
            this.extendMiddleware.push((middleware as any).call(middleware, this.appDefaultOptions || {}));
        });
        return this;
    }

    /**
     * 前插入
     * @param middleware
     */
    public unshiftUse(middleware: ApiMiddleware): ApiKoa {
        this.extendMiddleware.unshift(middleware);
        return this;
    }

    /**
     * 前插入
     * @param middleware
     */
    public unshiftUseMiddleware(middlewares: ApiClassMiddleware | Array<ApiClassMiddleware>): ApiKoa {
        if (!(middlewares instanceof Array)) {
            middlewares = [middlewares];
        }
        middlewares.forEach((middleware) => {
            this.extendMiddleware.unshift((middleware as any).call(middleware, this.appDefaultOptions || {}));
        });
        return this;
    }

    /**
     * 插入
     * @param middleware
     */
    public pushUseMiddleware(middleware: ApiMiddleware) {
        this.extendMiddleware.push(middleware);
    }

    /**
     * 装饰器
     * @returns
     */
    private initUseMiddleware(): ApiKoa {
        this.use(compose(this.extendMiddleware));
        return this;
    }

    /**
     * Return a request handler callback
     * for node's native http/http2 server.
     */
    public callback(): (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void {
        this.initUseMiddleware();
        return super.callback();
    }
}
