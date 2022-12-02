import { ApiErrorMiddleware } from '../middleware/api.error.middleware';
import { ApiOptions, ApiClassMiddleware, ApiFunctionMiddleware, ApiResponseType, Enumerable } from '../../typings';
import Koa from 'koa';
import compose from 'koa-compose';
import ApiRoutesMiddleware from '../middleware/api.routes.middleware';
import ApiBodyMiddleware from '../middleware/api.body.middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import ApiResponseMiddleware from '../middleware/api.response.middleware';
import ApiRequestMiddleware from '../middleware/api.request.middleware';
export default class ApiKoa extends Koa {
    /**
     * 拓展中间件
     */
    public extendMiddleware: Array<ApiFunctionMiddleware> = [];

    /**
     * 配置
     */
    public appDefaultOptions: Partial<ApiOptions> = {
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
    public useMiddleware(middlewares: Enumerable<ApiClassMiddleware | ApiFunctionMiddleware>, index?: number): ApiKoa {
        if (!(middlewares instanceof Array)) {
            middlewares = [middlewares];
        }
        /**
         * class 转换成 Function
         */
        const funcMiddlewares: Array<ApiFunctionMiddleware> = middlewares.map((middleware) => {
            if (middleware?.name && middleware['middlewareType'] === 'ApiClassMiddleware') {
                return (middleware as any).call(middleware, this.appDefaultOptions || {});
            }
            return middleware;
        });

        // 是否截取
        if (typeof index === 'number') {
            this.extendMiddleware.splice(index, 0, ...funcMiddlewares);
        } else {
            this.extendMiddleware = this.extendMiddleware.concat(funcMiddlewares);
        }
        return this;
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
