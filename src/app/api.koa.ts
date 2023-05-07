import { Options } from '@/decorators';
import ApiKoaBodyMiddleware from '@/middlewares/api.koabody.middleware';
import ApiResponseMiddleware from '@/middlewares/api.response.middleware';
import ApiRoutesMiddleware from '@/middlewares/api.routes.middleware';
import { IOptions } from '@/typings';
import { ApiClassMiddleware, ApiFunctionMiddleware } from '@/typings/middleware';
import { convertMiddleware } from '@/utils/middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import Koa from 'koa';
import compose from 'koa-compose';
import ApiOptions from './api.options';
export default class ApiKoa extends Koa {
    /**
     * 拓展中间件
     */
    public extendMiddleware: Array<ApiFunctionMiddleware | ApiClassMiddleware> = [];

    /**
     * 配置
     */
    @Options()
    public readonly appDefaultOptions!: ApiOptions;

    constructor(options: Partial<IOptions>) {
        super(options);

        // 初始化配置
        this.appDefaultOptions.merge(options || {});
        // 初始化中间件
        this.useMiddleware(ApiKoaBodyMiddleware, ApiResponseMiddleware, ApiRoutesMiddleware);
    }

    /**
     * 引入内置中间件
     * @param middleware
     * @param params
     * @returns
     */

    public useMiddleware(...middlewares: Array<ApiClassMiddleware | ApiFunctionMiddleware>): ApiKoa {
        this.extendMiddleware = this.extendMiddleware.concat(middlewares);
        return this;
    }
    /**
     * 装饰器
     * @returns
     */
    private initUseMiddleware(): ApiKoa {
        const middlewares: ApiFunctionMiddleware[] = this.extendMiddleware.reduce((list, middleware, index) => {
            const koaMiddleware = convertMiddleware(middleware);
            if (koaMiddleware) {
                list.push(koaMiddleware);
            }
            return list;
        }, [] as ApiFunctionMiddleware[]);
        this.use(compose(middlewares));
        return this;
    }

    /**
     * Return a request handler callback
     * for node's native http/http2 server.
     */
    public callback(): (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => Promise<void> {
        this.initUseMiddleware();
        return super.callback();
    }
}
