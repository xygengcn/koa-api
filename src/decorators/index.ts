import container, { injectable } from '@/container';
import { API_INVERSIFY_KEY, API_METADATA_KEY } from '@/keys/inversify';
import ApiLogger from '@/logger';
import { ApiRouteParamDecorator, Constructor } from '@/typings';
import { ApiClassMiddleware, ApiFunctionMiddleware } from '@/typings/middleware';
import { Enumerable } from '@/typings/type';
import { isFunction } from '@/utils';
import { convertMiddleware } from '@/utils/middleware';
import { IncomingHttpHeaders } from 'http';
import ApiOptions from '@/app/api.options';

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
                get(target, name: string) {
                    return (...args: any[]) => {
                        if (prefix && name === 'log') {
                            logger.emit(prefix, ...args);
                        } else {
                            logger[name](...args);
                        }
                    };
                }
            }
        );
        Reflect.set(target, propertyKey, loggerProxy);
    };
};

/**
 * 设置返回头部
 * @param key
 * @returns
 */
export const Headers = (key: keyof IncomingHttpHeaders, value: Enumerable<string>) => {
    return (target: any, name: string) => {
        const headers = Reflect.getMetadata(API_METADATA_KEY.ROUTER_HEADERS, target, name) || { 'content-type': 'application/json' };
        Object.assign(headers, { [key]: value });
        Reflect.defineMetadata(API_METADATA_KEY.ROUTER_HEADERS, headers, target, name);
    };
};

/**
 * 这是Stream
 * @param key
 * @returns
 */
export const EventStream = () => {
    return (target: any, name: string) => {
        const headers = Reflect.getMetadata(API_METADATA_KEY.ROUTER_HEADERS, target, name) || { 'content-type': 'application/json' };
        Object.assign(headers, { 'Content-Type': 'text/event-stream;charset=utf-8', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        Reflect.defineMetadata(API_METADATA_KEY.ROUTER_HEADERS, headers, target, name);
        Reflect.defineMetadata(API_METADATA_KEY.EVENTSTREAM, true, target, name);
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
export function Middleware(name?: string): (target: Constructor) => void; // 定义中间件装饰器
export function Middleware(middleware: ApiClassMiddleware | ApiFunctionMiddleware): (target: Object, name?: string) => void; // 使用装饰器
export function Middleware(arg: any) {
    return (target: Constructor, name: string) => {
        const isController = container.isBoundNamed(API_INVERSIFY_KEY.CONTROLLER_CLASS_KEY, target.name);

        // 方法装饰器 注入中间件
        if (name) {
            const isRouter = Reflect.hasMetadata(API_METADATA_KEY.ROUTER_METHOD, target, name);
            // 不是路由
            if (!isRouter) return;
            const middleware = convertMiddleware(arg);
            if (middleware) {
                const middlewares = Reflect.getMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, target, name) || [];
                middlewares.push(middleware);
                Reflect.defineMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, middlewares, target, name);
            }
            return;
        }

        /**
         * 类装饰器中的 新建中间件
         *
         * 不传参数，或者参数是string
         */
        if ((!arg || typeof arg === 'string') && !name && !isController) {
            injectable()(target);
            container.bind(API_INVERSIFY_KEY.MIDDLEWARE_CLASS_KEY).to(target).whenTargetNamed(target.name);
            return;
        }

        /**
         * 控制器，注入中间件
         */

        if (isController && isFunction(arg)) {
            const middleware = convertMiddleware(arg);
            if (middleware) {
                const middlewares = Reflect.getMetadata(API_METADATA_KEY.CONTROLLER_MIDDLEWARE, target.prototype) || [];
                middlewares.push(middleware);
                Reflect.defineMetadata(API_METADATA_KEY.CONTROLLER_MIDDLEWARE, middlewares, target.prototype);
            }
            return;
        }
    };
}

/**
 * 返回配置
 * @param key
 * @returns
 */
export function Options() {
    return (target: Object, propertyKey: string) => {
        const options: ApiOptions = container.get(API_INVERSIFY_KEY.API_OPTIONS);
        Reflect.set(target, propertyKey, options || {});
    };
}
