import { RequestMethod } from '@typings/enum';
import { DecoratorController, DecoratorMethod, DecoratorMethodExtends } from './controller';

// 类装饰器
export function ControllerDecorator(path: string = '/', options?: ControllerOptions) {
    return DecoratorController(path, options);
}

// 函数装饰器
export function RequestDecorator(options: RequestOptions) {
    return DecoratorMethod(options);
}

// get请求
export function GetDecorator(options?: RequestOptions | string) {
    let option: RequestOptions = options as RequestOptions;
    if (typeof options === 'string') {
        option = {
            url: options
        };
    }
    return RequestDecorator({
        ...(option || {}),
        method: RequestMethod.GET
    });
}

// post请求
export function PostDecorator(url: string, options?: RequestOptions) {
    let option: RequestOptions = options as RequestOptions;
    if (typeof options === 'string') {
        option = {
            url: options
        };
    }
    return RequestDecorator({
        ...(option || {}),
        url,
        method: RequestMethod.POST
    });
}

// 返回类型配置
export function ResponseDecorator(options: ResponseOptions) {
    return DecoratorMethodExtends('response', options);
}

// 跨域配置
export function CorsDecotator(options: string[]) {
    return DecoratorMethodExtends('origin', options);
}

//接口名字
export function NameDecorator(name: string) {
    return DecoratorMethodExtends('name', name);
}
//接口描述
export function DescriptionDecorator(name: string) {
    return DecoratorMethodExtends('description', name);
}

// 返回类型提示
export function ReturnsDecorator(options: { [key: string]: DefaultMethodValue | DefaultMethodValue['type'] }) {
    Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'function') {
            options[key] = {
                type: value
            };
        }
    });
    return DecoratorMethodExtends('returns', options);
}

// 请求头校验
export function HeadersDecorator(options: { [key: string]: DefaultMethodValue | DefaultMethodValue['type'] }) {
    Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'function') {
            options[key] = {
                type: value
            };
        }
    });
    return DecoratorMethodExtends('headers', options);
}

// Post content参数检验
export function ContentDecorator(options: { [key: string]: DefaultMethodValue | DefaultMethodValue['type'] }) {
    Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'function') {
            options[key] = {
                type: value
            };
        }
    });
    return DecoratorMethodExtends('content', options);
}

// url参数检验
export function QueryDecorator(options: { [key: string]: DefaultMethodValue | DefaultMethodValue['type'] }) {
    Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'function') {
            options[key] = {
                type: value
            };
        }
    });
    return DecoratorMethodExtends('query', options);
}

// exts参数校验
export function ExtsDecorator(options: { [key: string]: DefaultMethodValue | DefaultMethodValue['type'] }) {
    Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'function') {
            options[key] = {
                type: value
            };
        }
    });
    return DecoratorMethodExtends('exts', options);
}

// auth校验
export function AuthDecorator(options: RequestOptions['auth']) {
    return DecoratorMethodExtends<RequestOptions['auth']>('auth', options);
}
