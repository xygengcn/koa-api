export interface IApiError {
    code: Omit<number | string, 200>;
    error?: string | Object | Error; // 错误堆栈
    userMsg: string; // 给用户提示用的
}

export enum ApiErrorCode {
    notFound = 10404, // 未找到接口
    serviceError = 10500, // 服务器问题
    illegalBody = 10501, // 非法返回数据
    illegalMethod = 10502, //非法函数
    unknown = 10503, // 未知
    originError = 10504, // 跨域错误
    parseResponseError = 10505 // 错误处理返回格式失败
}

export enum ApiErrorCodeMessage {
    notFound = 'Not Found',
    illegalBody = 'Illegal body',
    illegalMethod = 'Illegal method',
    unknown = 'Unknown Error'
}
