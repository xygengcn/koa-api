import { Context, Next, RequestExts } from "koa";

export enum RequestType {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
}
export enum ResponseType {
    html = "text/html",
    json = "application/json",
}

/**
 * 日志格式
 */
export interface ILog {
    type: ILogType; //日志类型
    content: string | ILogContent | ILogHttpContent;
}

/**
 * 日志内容: 通用
 */
export interface ILogContent {
    subType: string; // 日志类型 get、post等
    content?: string | object; // 具体内容
}

/**
 * 日志内容：请求日志
 */
export interface ILogHttpContent extends ILogContent {
    developMsg?: string; // 开发信息
    content: {
        name: string; // 路由名字
        code: number; // 代码
        type: "POST" | "GET" | "OPTIONS" | "PUT" | "HEAD" | "DELETE"; // 请求请求类型
        time: number; // 耗时
        request: object; // 请求参数
        respone: object; // 返回数据
        path: string; // 路由
        clientIP: string; // 客户端ip
        updateTime: number; // 请求时间
        referer: string; // 来源
        content?: any;
    };
}

/**
 * 日志类型
 */
export enum ILogType {
    success = "success",
    info = "info",
    error = "error",
}
/**
 * 日志输出类型
 */
export enum ILogTarget {
    console = "console", //console输入
    web = "web", //在线即时看日志
    local = "local", //日志文件
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
    onError: (cb: Function) => void;
    emitError: (ctx: Context, log: any) => void;
}

/**
 * 日志类
 */
export interface AppLog {
    w(log: ILog): boolean;
    info(content: ILog["content"]): boolean;
    success(content: ILog["content"]): boolean;
    error(content: ILog["content"]): boolean;
    console(str: ILog["content"], type?: ILogType): void;
    read(time?: Date): Promise<ILog[]>;
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
