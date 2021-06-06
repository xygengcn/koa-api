import KoaRouter, { IRouterOptions } from 'koa-router';
import { Context, DefaultState, Next } from 'koa';
import { ILogTarget } from './log';

export interface IHttpErrorResponse {
    code: number;
    error: string;
    developMsg?: string | undefined | null;
}

export interface IAppControllerResponseOption {
    type?: 'html' | 'json';
    successCode?: number;
    failCode?: number;
    successMsg?: string;
    developMsg?: string | undefined | null;
}

export interface IAppControllerCoreAuthContext {
    ctx: Context;
    next: Next;
}

export interface IAppControllerCoreAuthCallback {
    (error: IHttpErrorResponse): any;
}

export interface IAppControllerCoreRequestOption extends IAppControllerResponseOption {
    url: string;
    auth?: (
        context: IAppControllerCoreAuthContext,
        callback: IAppControllerCoreAuthCallback
    ) => boolean | Promise<boolean>;
    log?: ILogTarget[];
    origin?: string[];
    content?: any;
}

export interface IAppControllerCore extends KoaRouter<DefaultState, Context> {
    path: string;
    opts?: IRouterOptions;
}

export type IAppControllerOptions = IAppControllerCoreRequestOption | string | undefined;

export enum IAppControllerRequest {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}

export enum IAppControllerResponseOptionType {
    _html = '.html',
    html = 'html',
    json = 'json',
    applicationJson = 'application/json',
    png = 'png',
}

export interface IAppControllerClass {
    (target?: any): any;
}

export interface IAppControllerMethod {
    (target, name: string, descriptor: any): void;
}

export interface IAppConfig {
    set(property: string, data: any, force?: boolean): Boolean;
    get(property?: string): any;
    reset(): void;
}

export interface IAppMiddleware {
    init: (option?: any) => (ctx: Context, next: Next) => any;
}

export interface IAppControllerExts {
    get: (path: string) => IAppControllerCoreRequestOption;
    set: (path: string, exts: IAppControllerExtsOptions) => void;
}
export interface IAppControllerExtsOptions {
    [target: string]:
        | {
              [target: string]: IAppControllerCoreRequestOption;
          }
        | IAppControllerCoreRequestOption;
}

export interface IAppMiddlewareOptions {
    origin?: string[];
    allowMethods?: string[];
}
