import { Context, Next, RequestExts } from 'koa';

export enum RequestType {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
}
export enum ResponseType {
    html = 'text/html',
    json = 'application/json',
}

/**
 * 返回体
 */
export interface IResponse {
    type: 'info' | 'success' | 'error';
    content: IResponseContent;
}
/**
 * 返回主体
 */
export interface IResponseContent {
    type: 'system' | 'http' | 'sql' | 'log';
    content: string | IHttpContent | ISystemContent | ISqlContent;
}

/**
 * 请求返回体
 */
export interface IHttpContent {
    type: string; // 请求请求类型
    name: string; // 路由名字
    code: number; // 代码
    status: string | number;
    time: number; // 耗时
    request: Object; // 请求参数
    respone: Object; // 返回数据
    path: string; // 路由
    clientIP: string | string[]; // 客户端ip
    updateTime: number; // 请求时间
    referer: string | string[]; // 来源
    error?: any;
    developMsg?: string; // 开发信息
}

/**
 * 系统返回体
 */
export interface ISystemContent {
    controller: string; // 控制器
    method?: string; // 模块
    error?: Error | string;
    content?: any;
    developMsg?: string; // 开发信息
}

export interface ISqlContent {
    sql: string;
    timing?: number | undefined;
    content?: any;
    developMsg?: string; // 开发信息
}

/**
 * 日志输出类型
 */
export enum ILogTarget {
    console = 'console', //console输入
    web = 'web', //在线即时看日志
    local = 'local', //日志文件
}

/**
 * 中间件传参
 */
export interface AppMiddlewareOpts {
    origin?: string[];
    allowMethods?: string[];
}

/**
 * 事件类
 */
export interface AppEventCore {
    onHttp: (cb: (ctx: Context, content: IResponse) => void) => void;
    emitHttp: (ctx: Context, content: IResponse) => void;
    onError: (cb: (content: IResponseContent, ctx?: Context) => void) => void;
    emitError: (content: IResponseContent, ctx?: Context) => void;
}

/**
 * 日志类
 */
export interface AppLog {
    w(log: IResponseContent): boolean;
    info(content: IResponseContent['content']): boolean;
    success(content: IResponseContent['content']): boolean;
    error(content: IResponseContent['content']): boolean;
    console(str: IResponseContent): void;
    read(time?: Date): Promise<IResponseContent[]>;
}
/**
 * 中间件
 */
export interface AppMiddleware {
    init: (option?: any) => (ctx: Context, next: Next) => any;
}
/**
 * 参数扩展类
 */
export interface AppControllerExts {
    get: (path: string) => RequestExts;
    set: (path: string, exts: RequestExts) => void;
}

/**
 * 配置类
 */
export interface AppConfig {
    set(property: string, data: any, force?: boolean): Boolean;
    get(property?: string): any;
    reset(): void;
}
