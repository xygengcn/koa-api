export enum ApiErrorCode {
    notFound = 10404,
    serviceError = 10500,
    illegalBody = 10501,
    illegalMethod = 10502,
    unknown = 10503,
    originError = 10504 // 跨域错误
}

export enum ApiErrorCodeMessage {
    notFound = 'Not Found',
    illegalBody = 'Illegal body',
    illegalMethod = 'Illegal method',
    unknown = 'Unknown Error'
}
