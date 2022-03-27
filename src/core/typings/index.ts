import { IKoaBodyOptions } from 'koa-body';
import { IMiddleware, Layer, IRouterOptions } from 'koa-router';
import { Context as KoaContext, Middleware, Next as KoaNext, Request } from 'koa';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export type Context = KoaContext;

export type Next = KoaNext;

// 默认中间件
export type ApiFunctionMiddleware<T = any, K = any> = IMiddleware<T, K> | Middleware;

// 自定义中间件
export type ApiClassMiddleware = new (...args: any[]) => ApiMiddleware;

/**
 * 外部启动插件的配置
 */
export interface ApiOptions {
    server: (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void;
    options: ApiDefaultOptions;
    middlewares: Array<ApiFunctionMiddleware>;
}

/**
 * 中间类的函数参数
 */
export interface ApiMiddlewareParams {
    options: Readonly<ApiDefaultOptions>;
    stack: Readonly<Layer> | undefined;
    route: Readonly<IApiRoute> | undefined;
    ctx: Context;
}

// 中间件继承类
export interface ApiMiddleware {
    init?: (options: ApiDefaultOptions) => void;
    resolve: (params: ApiMiddlewareParams) => ApiFunctionMiddleware;
    match?: (params: ApiMiddlewareParams) => boolean;
    ignore?: (params: ApiMiddlewareParams) => boolean;
}

/**
 * 默认主体
 */
export interface ApiEventContent<T = Object | string | number | Error> {
    type?: string;
    subType?: string;
    content?: T;
    module?: string;
}

/**
 * 日志事件
 */
export interface ApiLogEventContent extends Omit<ApiEventContent, 'type' | 'module'> {
    type?: 'log';
}

/**
 * 错误事件
 */
export interface ApiErrorEventContent extends Omit<ApiEventContent, 'type' | 'module'> {
    type?: 'error';
}

// 类型
type ClassType<T> = { (): T } | { new (...args: never[]): T & object } | { new (...args: string[]): Function };

/**
 * 路由参数
 */
export interface ApiRouteParams {
    query: Readonly<any>;
    body: Readonly<any>;
    ctx: Readonly<Context>;
    files: Request['files'];
}

/**
 * koa配置
 */
export interface KoaOptions {
    env?: string | undefined;
    keys?: string[] | undefined;
    proxy?: boolean | undefined;
    subdomainOffset?: number | undefined;
    proxyIpHeader?: string | undefined;
    maxIpsCount?: number | undefined;
}

/**
 * 入口配置
 */
export interface ApiDefaultOptions extends KoaOptions {
    port?: number;
    controllerPath?: string;
    koaBody?: IKoaBodyOptions;
    response?: {
        type: ApiResponseType;
    };
    stack?: Array<Layer>;
    queue?: Array<Readonly<IApiRoute>>;
    exts?: any;
}

/**
 * 请求类型
 */
export enum ApiRequestType {
    GET = 'GET',
    POST = 'POST',
    ALL = 'ALL',
    DELETE = 'DELETE',
    PUT = 'PUT',
    HEAD = 'HEAD'
}

/**
 * 返回类型
 */
export enum ApiResponseType {
    DEFAULT = 'DEFAULT', // 不经过处理返回
    RESTFUL = 'RESTFUL' // 正确返回结果将会包一层默认结构 default
}
/**
 * 控制类参数
 */
export interface ApiControllerAttributes {
    name?: string;
    // 描述
    description?: string;
}

/**
 * 单个路由参数
 */
export type ApiRequestOptions = Omit<IApiRoute, 'value' | 'methodName'>;

/**
 * @todo 默认路由属性值 预留，未实现
 */
interface ApiRouteOptionsValue<T = any, K = any> {
    type: K & ClassType<T>;
    defaultValue?: any; // require为true时失效
    require?: boolean;
    validator?(value: any): Boolean | Promise<Boolean>;
    description?: string;
}

/**
 * 路由类参数
 */
export interface IApiRoutes extends IRouterOptions {
    routePrefix?: string;
    target?: ClassDecorator;
    attributes?: ApiControllerAttributes;
}

/**
 * 路由函数参数
 */
export interface IApiRoute<T = any, K = ClassType<T>> {
    // 函数名
    methodName: string;

    // 自定义名字
    name?: string;

    // 函数体
    value: (_this: ClassDecorator) => IMiddleware;

    // 路由
    url: string;

    /**
     * 路由类型
     * @default GET
     */
    type?: ApiRequestType;

    /**
     * 返回类型
     *
     * @default RESTFUL
     */
    responseType?: ApiResponseType;

    // 描述
    description?: string;

    /**
     * 限制跨域
     * @todo 预留，未实现
     * @deprecated
     */
    origin?: string[];

    /**
     * 返回参数
     * @todo 预留，未实现，可自定义实现
     */
    response?: {
        // TODO 返回头
        headers?: {
            [key: string]: ApiRouteOptionsValue<T, K>;
        };

        // TODO 返回类型
        returns?: {
            [key: string]: ApiRouteOptionsValue<T, K>;
        };
    };

    /**
     * 请求头参数
     * @todo 可用于数据校验，预留，未实现，可自定义实现
     */
    request?: {
        // TODO 请求头
        headers?: {
            [key: string]: ApiRouteOptionsValue<T, K>;
        };

        // TODO 请求参数
        query?: {
            [key: string]: ApiRouteOptionsValue<T, K>;
        };

        // TODO 请求主体
        body?: {
            [key: string]: ApiRouteOptionsValue<T, K>;
        };
    };
}
