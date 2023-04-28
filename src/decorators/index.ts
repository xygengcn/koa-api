import { API_INVERSIFY_KEY, API_METADATA_KEY } from '@/keys/inversify';
import container, { injectable } from '@/inversify';
import ApiLogger from '@/logger';
import { ApiRouteParamDecorator, Constructor } from '@/typings';
import { ApiClassMiddleware, ApiFunctionMiddleware } from '@/typings/middleware';
import { Enumerable } from '@/typings/type';
import { convertMiddleware } from '@/utils/middleware';

/**
 * 控制器装饰器
 */
export function Controller(path?: string) {
    return (target: Constructor) => {
        injectable()(target);
        container.bind(API_INVERSIFY_KEY.CONTROLLER_CLASS_KEY).to(target).whenTargetNamed(target.name);
        Reflect.defineMetadata(API_METADATA_KEY.CONTROLLER_PREFIX, path || '', target.prototype);
    };
}

/**
 * get请求方法装饰器
 * @param path
 */
export function Get(path?: string) {
    return (target: any, name: string) => {
        Register('GET', path)(target, name);
    };
}

/**
 * post请求方法装饰器
 * @param path
 */
export function Post(path?: string) {
    return (target: any, name: string) => {
        Register('POST', path)(target, name);
    };
}

/**
 * 注册方法
 * @param methods
 * @param path
 * @returns
 */
export function Register(methods: Enumerable<'POST' | 'GET' | 'HEAD' | 'OPTIONS'>, path?: string) {
    return (target: any, name: string) => {
        if (typeof methods === 'string') {
            methods = [methods];
        }
        let curMethods: 'POST' | 'GET' | 'HEAD' | 'OPTIONS'[] = Reflect.getMetadata(API_METADATA_KEY.ROUTER_PATH, target, name) || [];
        methods = methods.concat(curMethods);
        Reflect.defineMetadata(API_METADATA_KEY.ROUTER_PATH, path || name, target, name);
        Reflect.defineMetadata(API_METADATA_KEY.ROUTER_METHOD, methods, target, name);
    };
}

/**
 * 获取日志对象
 * @returns
 */
export const Logger = (prefix?: string) => {
    return (target: object, propertyKey: string) => {
        const logger: ApiLogger = container.get(API_INVERSIFY_KEY.API_LOGGER_KEY);
        const loggerProxy = new Proxy(
            {},
            {
                get(target, name) {
                    return (...args: any[]) => {
                        logger[name](prefix, ...args);
                    };
                }
            }
        );
        Reflect.set(target, propertyKey, prefix ? loggerProxy : logger);
    };
};

/**
 * 获取参数
 * @returns
 */
//
export const Param: ApiRouteParamDecorator = new Proxy({} as any, {
    get: (obj, name) => {
        return (key: string = '') => {
            return (target: Object, propertyKey: string, parameterIndex: number) => {
                const params: Array<{ key: string; index: number; name: symbol | string }> = Reflect.getMetadata(API_METADATA_KEY.ROUTER_PARAMS, target, propertyKey) || [];
                params.unshift({
                    name,
                    key,
                    index: parameterIndex
                });
                Reflect.defineMetadata(API_METADATA_KEY.ROUTER_PARAMS, params, target, propertyKey);
            };
        };
    }
});

/**
 * 中间件
 * @param name
 * @return
 */
export function Middleware(name?: string): (target: Constructor) => void;
export function Middleware(middleware: ApiClassMiddleware | ApiFunctionMiddleware): (target: any, name: string) => void;
export function Middleware(arg) {
    // 类装饰器  新建中间件
    if (!arg || typeof arg === 'string') {
        return (target: Constructor) => {
            injectable()(target);
            container.bind(API_INVERSIFY_KEY.MIDDLEWARE_CLASS_KEY).to(target).whenTargetNamed(target.name);
        };
    }
    // 方法装饰器 注入到路由
    if (arg) {
        const middleware = convertMiddleware(arg);
        if (middleware) {
            return (target: Constructor, name: string) => {
                const middlewares = Reflect.getMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, target, name) || [];
                middlewares.push(middleware);
                Reflect.defineMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, middlewares, target, name);
            };
        }
    }

    return () => {};
}
