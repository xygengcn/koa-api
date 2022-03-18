import { IKoaBodyOptions } from 'koa-body';
import { IMiddleware, Layer, IRouterOptions } from 'koa-router';
import { Context as KoaContext, Middleware, Next as KoaNext, Request } from 'koa';

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
export interface ApiEventContent<T = Object | string | number> {
    type?: string;
    subType?: string;
    content?: T;
    module?: string;
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
    DEFAULT = 'DEFAULT',
    RESTFUL = 'RESTFUL' // 正确返回结果将会包一层默认结构
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
 * TODO 默认路由属性值
 */
interface ApiRouteOptionsValue<T = any, K = any> {
    type: K & ClassType<T>;
    defaultValue?: any; // require为true时失效
    require?: boolean;
    validator?(value: any): Boolean;
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

    // 路由类型
    type?: ApiRequestType;

    // 返回类型
    responseType?: ApiResponseType;

    // 描述
    description?: string;

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
    // TODO 限制跨域
    origin?: string[];

    // TODO 返回类型
    returns?: {
        [key: string]: ApiRouteOptionsValue<T, K>;
    };
}
