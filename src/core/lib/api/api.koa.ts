import { ApiErrorMiddleware } from '../middleware/api.error.middleware';
import { ApiOptions, ApiClassMiddleware, ApiFunctionMiddleware, ApiResponseType } from '../../typings';
import Koa from 'koa';
import compose from 'koa-compose';
import ApiRoutesMiddleware from '../middleware/api.routes.middleware';
import { ApiBodyMiddleware } from '../middleware/api.body.middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import { ApiResponseMiddleware } from '../middleware/api.response.middleware';
import { ApiRequestMiddleware } from '../middleware/api.request.middleware';
export default class ApiKoa extends Koa {
    /**
     * 拓展中间件
     */
    public extendMiddleware: Array<ApiFunctionMiddleware> = [];

    /**
     * 配置
     */
    public appDefaultOptions: ApiOptions = {
        response: {
            type: ApiResponseType.RESTFUL
        }
    };

    constructor(options?: ApiOptions) {
        super(options);
        Object.assign(this.appDefaultOptions, options || {});
        this.useMiddleware([ApiErrorMiddleware, ApiRequestMiddleware, ApiResponseMiddleware, ApiBodyMiddleware, ApiRoutesMiddleware]);
    }

    /**
     * 引入内置中间件
     * @param middleware
     * @param params
     * @returns
     */
    public useMiddleware(middlewares: ApiClassMiddleware | Array<ApiClassMiddleware>, index?: number): ApiKoa {
        if (!(middlewares instanceof Array)) {
            middlewares = [middlewares];
        }
        const funcMiddlewares: Array<ApiFunctionMiddleware> = middlewares.map((middleware) => {
            return (middleware as any).call(middleware, this.appDefaultOptions || {});
        });
        if (typeof index === 'number') {
            this.extendMiddleware.splice(index, 0, ...funcMiddlewares);
        } else {
            this.extendMiddleware = this.extendMiddleware.concat(funcMiddlewares);
        }
        return this;
    }

    /**
     * 前插入
     * @param middleware
     */
    public unshiftUse(middleware: ApiFunctionMiddleware): ApiKoa {
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
     * 原生插入
     * @param middleware
     */
    public pushUseMiddleware(middleware: ApiFunctionMiddleware, index?: number) {
        if (typeof index === 'number') {
            this.extendMiddleware.splice(index, 0, middleware);
        } else {
            this.extendMiddleware.push(middleware);
        }
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
