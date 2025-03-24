import { FlattenObjectKeys } from '@/typings/type';
import { KoaOptions } from './koa';
import { Context, Next } from 'koa';
import { KoaBodyMiddlewareOptions } from 'koa-body';

/**
 * 总入口配置
 */
export interface IOptions extends KoaOptions {
    baseUrl?: string; // 控制器存放的位置
    prefix?: string | RegExp; // 路由api前缀，只做判断不做拼接
    port?: number; // 端口
    koaBody?: Partial<Omit<KoaBodyMiddlewareOptions, 'onError'>> & { onError?: (error: Error, ctx: Context, next: Next) => void };
    responseOptions?: {
        // 允许返回错误的status code
        allowErrorStatusCode?: boolean;
        // 错误处理
        handler?: (ctx: Context, error: Error) => void;
    };
}

/**
 * 事件类型
 */
export type Events = { [key: string]: (...args: any) => void };

/**
 * 路由参数类型
 */
export enum ApiRouteParamName {
    query = 'Query',
    ctx = 'Context',
    body = 'Body',
    next = 'Next',
    file = 'Files',
    stream = 'Stream'
}

/**
 * 路由参数类型
 */
export type ApiRouteParam = { key: string; index: number; name: symbol | string };

/**
 * 参数装饰器
 */

export type ApiRouteParamDecorator<T extends ApiRouteParamName = ApiRouteParamName> = Record<
    T,
    <K extends Record<string | number | symbol, unknown>>(key?: FlattenObjectKeys<K>) => ParameterDecorator
>;
