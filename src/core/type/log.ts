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
        type: 'POST' | 'GET' | 'OPTIONS' | 'PUT' | 'HEAD' | 'DELETE'; // 请求请求类型
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
    success = 'success',
    info = 'info',
    error = 'error',
}
/**
 * 日志输出类型
 */
export enum ILogTarget {
    console = 'console', //console输入
    web = 'web', //在线即时看日志
    local = 'local', //日志文件
}
