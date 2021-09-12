/**
 * 系统配置
 */
declare interface AppOptions {
    origin?: string[];
    allowMethods?: string[];
}

/**
 * 通用content
 */
declare interface DefaultContent {
    type: keyof typeof console;
    subType?: string;
    content: Object | string | number | HttpContent | SystemContent | SqlContent;
}

declare interface RequestOptions extends ControllerMethod {
    url: string;
    method?: 'GET' | 'POST' | 'ALL' | 'DELETE' | 'PUT' | 'HEAD';
    header?: Object; // 返回请求头
}

declare interface ControllerOptions {
    name?: string;
    description?: string;
    isTop?: boolean;
}

/**
 * 返回用户配置
 */
declare interface ResponseOptions {
    headers?: {
        [key: string]: any;
    };
}

// 接口错误返回体

interface ResponseError extends ResponseOptions {
    code: number;
    error?: string;
    developMsg?: string | undefined | null;
}

/**
 * 请求返回体
 */
declare interface HttpContent {
    type: string; // 请求请求类型
    name: string; // 路由名字
    code: number; // 代码
    status: string | number;
    time: number; // 耗时
    request: { params: any; header: any; query: any }; // 请求参数
    response: Object; // 返回数据
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
declare interface SystemContent {
    controller: string; // 控制器
    method?: string; // 模块
    error?: Error | string;
    content?: any;
    developMsg?: string; // 开发信息
    updateTime?: number; // 请求时间
}

/**
 * 数据库返回体
 */
declare interface SqlContent {
    sql: string;
    timing?: number | undefined;
    content?: any;
    developMsg?: string; // 开发信息
}

/**
 * 请求体,严格按照content+exts组合
 */
declare interface RequestContent {
    query?: any;
    data?: {
        content?: any;
        exts?: any;
    };
}

/**
 * 事件类
 */
declare interface AppEventBus {
    onHttp: (cb: (content: DefaultContent, ctx: any) => void) => void;
    emitHttp: (content: DefaultContent, ctx: any) => void;
    onError: (cb: (content: DefaultContent, ctx?: any) => void) => void;
    emitError: (content: DefaultContent, ctx?: any) => void;
    emitLog: (content: DefaultContent) => void;
    onLog: (cb: (content: DefaultContent) => void) => void;
}

/**
 * 日志类
 */
declare interface AppLog {
    w(log: DefaultContent): boolean;
    info(content: DefaultContent['content']): boolean;
    success(content: DefaultContent['content']): boolean;
    error(content: DefaultContent['content']): boolean;
    console(str: DefaultContent): void;
    read(time?: Date, type?: string): Promise<DefaultContent[]>;
}

/**
 * 配置类
 */
declare interface AppConfig {
    set(property: string, data: any, force?: boolean): Boolean;
    get(property?: string): any;
    reset(): void;
}

/**
 * 中间件
 */
declare interface AppMiddleware {
    init: (option?: any) => (ctx: any, next: any) => any;
}

// 类型
declare type Type<T> = { (): T } | { new (...args: never[]): T & object } | { new (...args: string[]): Function };

// 自定义配置
interface DefaultMethodValue<T = any, K = any> {
    type: K & Type<T>;
    defaultValue?: any; // require为true时失效
    require?: boolean;
    validator?(value: any): Boolean;
    description?: string;
}

declare interface ControllerMethod<T = any, K = Type<T>> {
    // 来源请求头
    headers?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    query?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    content?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    exts?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    auth?: (
        context: {
            ctx: any;
            next: any;
        },
        callback: (error: ResponseError) => any
    ) => boolean | Promise<boolean>;

    origin?: string[];

    returns?: {
        [key: string]: DefaultMethodValue<T, K>;
    };

    method?: 'GET' | 'POST' | 'ALL' | 'DELETE' | 'PUT' | 'HEAD';

    description?: string;

    response?: ResponseOptions;

    [key: string]: any;
}
