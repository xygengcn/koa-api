import { isObject } from 'lodash';
import { RequestMethod } from '@typings/enum';
import { Next, Context } from 'koa';
import AppControllerClass from '../class/app.controller.class';
import AppControllerMethod from '../class/app.controller.method.class';

/**
 * 类接口构造器
 * @param prefix
 * @param options
 * @returns
 */
export function DecoratorController(path: string, options?: ControllerOptions): (target?: any) => any {
    return (target): AppControllerClass => {
        // 新建一个接口，并初始化
        const controller = new AppControllerClass({
            className: target.name,
            name: target.name,
            path,
            ...(options || {})
        });

        // 通过原型，获取类里面所有方法
        const controllerMethods: {
            [key: string]: PropertyDescriptor;
        } = Object.getOwnPropertyDescriptors(target.prototype);

        // 遍历方法名，提取接口
        Object.getOwnPropertyNames(controllerMethods).forEach((methodName) => {
            // 过滤构造函数
            if (methodName !== 'constructor') {
                // 获取改造后的函数或未改造的函数
                const methodFunction = controllerMethods[methodName];

                // 获取返回对象
                const controllerMethod = methodFunction?.value();

                // 过滤普通函数
                if (controllerMethod instanceof AppControllerMethod) {
                    // 请求方法
                    const requestMethod = controllerMethod.method || RequestMethod.GET;
                    // 写入路由
                    controller[requestMethod.toLocaleLowerCase()](controllerMethod.routeName, controllerMethod.url, async (ctx: Context, next: Next) => {
                        // 获取预设参数
                        const controllerParams = ctx.controller || {};

                        // url请求参数
                        const requestQuery: Object = Object.assign({}, ctx.query || {});

                        // content请求参数
                        const requestDataContent: Object = Object.assign({}, ctx.request?.body?.content || {});

                        // exts请求参数
                        const requestDataExts: Object = Object.assign({}, ctx.request?.body?.exts || {});

                        // 设置默认参数
                        if (controllerParams.query && isObject(controllerParams.query)) {
                            Object.entries(controllerParams.query).forEach(([key, value]) => {
                                if (!requestQuery.hasOwnProperty(key) && value.hasOwnProperty('defaultValue')) {
                                    requestQuery[key] = value.defaultValue;
                                }
                            });
                        }
                        // 设置默认参数
                        if (controllerParams.content && isObject(controllerParams.content)) {
                            Object.entries(controllerParams.content).forEach(([key, value]) => {
                                if (!requestDataContent.hasOwnProperty(key) && value.hasOwnProperty('defaultValue')) {
                                    requestDataContent[key] = value.defaultValue;
                                }
                            });
                        }
                        // 设置默认参数
                        if (controllerParams.exts && isObject(controllerParams.exts)) {
                            Object.entries(controllerParams.exts).forEach(([key, value]) => {
                                if (!requestDataExts.hasOwnProperty(key) && value.hasOwnProperty('defaultValue')) {
                                    requestDataExts[key] = value.defaultValue;
                                }
                            });
                        }

                        // 调用原始方法
                        const res = await controllerMethod.value.call(new target(), ctx, next, {
                            query: requestQuery,
                            data: {
                                ...(ctx.request?.body || {}),
                                content: requestDataContent,
                                exts: requestDataExts
                            }
                        } as RequestContent);
                        // 返回接口最终值
                        ctx.success(res, controllerMethod.response);
                        return res;
                    });
                    // 每一个接口的自定义配置挂到总接口上
                    controller.setController(methodName, controllerMethod);
                }
            }
        });

        return controller;
    };
}

/**
 *
 * 具体接口实现构造器
 */
export function DecoratorMethod(options: RequestOptions) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        // 函数原型
        const methodFunction = descriptor.value;

        // 接口路由
        const url: string = (options && options.url) || `/${name}`;

        // 改造路由
        descriptor.value = function () {
            // 新建接口
            const method = new AppControllerMethod({
                // 路由名字，由类名.函数名组成
                routeName: `${target.constructor.name}.${name}`,
                value: methodFunction,
                ...options,
                url
            });
            return method;
        };
        return descriptor;
    };
}

export function DecoratorMethodExtends<T>(key: keyof ControllerMethod, options: T) {
    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        // 函数原型
        const methodFunction: AppControllerMethod = descriptor.value(target.constructor.name);
        // 改造路由
        descriptor.value = function () {
            const obj = new Object();
            obj[key] = options;
            methodFunction.merge(obj);
            return methodFunction;
        };
        return descriptor;
    };
}
