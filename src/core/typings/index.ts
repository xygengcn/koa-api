import { IKoaBodyOptions } from 'koa-body';
import { IMiddleware } from 'koa-router';
import { Context as KoaContext, Middleware, Next as KoaNext } from 'koa';

export type Context = KoaContext;

export type Next = KoaNext;

// 默认中间件
export type ApiMiddleware<T = any, K = any> = IMiddleware<T, K> | Middleware;

// 自定义中间件
export type ApiClassMiddleware = new (...args: any[]) => IApiClassMiddleware;

export interface IApiClassMiddleware {
    init?: (options: ApiDefaultOptions) => void;
    resolve: (options: ApiDefaultOptions) => ApiMiddleware;
    match?: (ctx?: Context) => boolean;
    ignore?: (ctx?: Context) => boolean;
}

/**
 * 默认主体
 */
export interface DefaultContent {
    type?: string;
    subType?: string;
    content?: Object | string | number;
}

// 类型
type Type<T> = { (): T } | { new (...args: never[]): T & object } | { new (...args: string[]): Function };

// 接口错误返回体

interface ResponseError {
    code: number;
    error?: string;
    developMsg?: string | undefined | null;
}
/**
 * 默认路由属性值
 */
interface DefaultMethodValue<T = any, K = any> {
    type: K & Type<T>;
    defaultValue?: any; // require为true时失效
    require?: boolean;
    validator?(value: any): Boolean;
    description?: string;
}

/**
 * 路由参数
 */
export interface ApiRouteParams {
    query: any;
    body: any;
    ctx: Context;
    next: Next;
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
}

/**
 * 请求类型
 */
export enum ApiRouteRequestType {
    GET = 'GET',
    POST = 'POST',
    ALL = 'ALL',
    DELETE = 'DELETE',
    PUT = 'PUT',
    HEAD = 'HEAD'
}
/**
 * 路由类参数
 */
export interface ApiRoutesOptions {
    name?: string;
    // 描述
    description?: string;
}

/**
 * 路由函数参数
 */
export interface IApiRoute {
    // 函数名
    methodName: string;

    // 自定义名字
    name: string;

    // 函数体
    value: (_this: ClassDecorator) => IMiddleware;

    // 路由
    url: string;

    // 路由配置
    routeOptions: ApiRouteOptions;

    // 路由类型
    type: ApiRouteRequestType;
}

/**
 * 路由属性
 */
export interface ApiRouteOptions<T = any, K = Type<T>> {
    // 来源请求头
    headers?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    // get请求参数
    query?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    // 请求主体
    content?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    // 参数
    exts?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    // 校验
    auth?: (
        context: {
            ctx: any;
            next: any;
        },
        callback: (error: ResponseError) => any
    ) => boolean | Promise<boolean>;

    // 限制跨域
    origin?: string[];

    // 返回类型
    returns?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    // 描述
    description?: string;
}
