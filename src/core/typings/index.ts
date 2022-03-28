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
 * 中间类的函数参数
 */
export interface ApiMiddlewareParams {
    options: Readonly<ApiDefaultOptions>; // 全局配置
    stack: Readonly<Layer> | undefined; // 当前路由
    route: Readonly<IApiRoute> | undefined; // 当前路由
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
 * 默认事件主体
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
        type: ApiResponseType; // 全局是否按照restful格式返回
    };
    stack?: Array<Layer>; // 全局路由
    queue?: Array<Readonly<IApiRoute>>; // 全局路由
    routeTree?: Readonly<ApiRoutesTree>; // 全局路由
    exts?: any;
}

/**
 * 外部启动插件的配置
 */
export interface ApiRunOptions extends ApiDefaultOptions {
    server: (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void;
    middlewares: Array<ApiFunctionMiddleware>;
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
 * post请求参数
 */
export type ApiPostRequestOptions = Partial<Omit<ApiRequestOptions, 'url' | 'type'>>;

/**
 * get请求参数
 */
export interface ApiGetRequestOptions extends Partial<ApiRequestOptions> {
    request?: Omit<IApiRouteRequest, 'body'>;
}

/**
 * @todo 默认路由属性值 预留，未实现
 */
export interface ApiRouteRequestOptionsValue<T = any, K = any> {
    type: K & ClassType<T>;
    defaultValue?: any; // require为true时失效
    require?: boolean;
    validator?(value: any): Boolean | Promise<Boolean>;
    description?: string;
}

/**
 * 单个路由请求的属性值
 */
export type ApiRouteRequestOption<T = any, K = ClassType<T>> = Record<string, ApiRouteRequestOptionsValue<T, K> | ApiRouteRequestOptionsValue['type']>;

/**
 * 路由返回格式
 */
export type ApiRouteResponeseOption<T = any, K = ClassType<T>> = Record<string, Omit<ApiRouteRequestOptionsValue<T, K>, 'validator'> | ApiRouteRequestOptionsValue['type']>;

/**
 * 路由类参数
 */
export interface IApiRoutes extends IRouterOptions {
    routePrefix?: string;
    target?: ClassDecorator;
    attributes: ApiControllerAttributes;
    anonymous: boolean;
}

/**
 * 树路由结构
 */
export interface ApiRoutesTree {
    routePrefix?: string;
    attributes?: ApiControllerAttributes;
    anonymous?: boolean;
    path?: string;
    routes: Array<IApiRoute>;
    childRoutesTree?: Array<ApiRoutesTree>;
}

/**
 * 请求参数
 */
export interface IApiRouteRequest<T = any, K = ClassType<T>> {
    // TODO 请求头
    headers?: ApiRouteRequestOption<T, K>;

    // TODO 请求参数
    query?: ApiRouteRequestOption<T, K>;

    // TODO 请求主体
    body?: ApiRouteRequestOption<T, K>;
}

/**
 * 返回头部设置和返回类型注释
 */
export interface IApiRouteResponse<T = any, K = ClassType<T>> {
    // TODO 返回头
    headers?: ApiRouteResponeseOption<T, K>;

    // TODO 返回类型
    returns?: ApiRouteResponeseOption<T, K>;
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
     * @todo 可用于文档生成，预留，未实现，可自定义实现
     */
    response?: IApiRouteResponse;

    /**
     * 请求头参数
     * @todo 可用于数据校验，预留，未实现，可自定义实现
     */
    request?: IApiRouteRequest<T, K>;
}
