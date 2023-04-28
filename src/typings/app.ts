import { FlattenObjectKeys } from '@/typings/type';
import { KoaOptions } from './koa';
import { KoaBodyMiddlewareOptions } from 'koa-body';
import { ErrorObject } from 'serialize-error';

/**
 * 总入口配置
 */
export interface IOptions extends KoaOptions {
    baseUrl?: string; // 控制器存放的位置
    port?: number; // 端口
    koaBody?: Partial<KoaBodyMiddlewareOptions>;
}

/**
 * 事件类型
 */
export type Events = { [key: string]: (...args: any) => void };

/**
 * 错误类型
 */
export interface IApiError extends ErrorObject {
    _code: number;
}

/**
 * 路由参数类型
 */
export enum ApiRouteParamName {
    query = 'Query',
    ctx = 'Context',
    body = 'Body',
    next = 'Next',
    file = 'Files'
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
