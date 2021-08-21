/**
 * 控制器对外接口，对外接口暴露
 */
import AppConfig from '@core/lib/app.config';
import Koa, { RequestExts } from 'koa';
import AppLog from '@core/lib/app.log';
import AppDataBase from '@core/lib/app.database';
import { Sequelize } from 'sequelize/types';
import { ControllerDecorator, MethodDecorator } from '@core/lib/app.decorator';
import { RequestType } from '@core/typings/app';
import { ParsedUrlQuery } from 'querystring';
/**
 * 抛出参数类型
 */
export type Context = Koa.Context;

export type Next = Koa.Next;

export interface Params {
    query: ParsedUrlQuery;
    param: any;
}

/**
 * 控制器装饰器
 * @param prefix 路由前缀
 */
export function Controller(prefix: string = '/') {
    return ControllerDecorator(prefix);
}

/**
 * Get请求
 * @param option 请求参数
 */
export const GET = (option?: RequestExts | string) => {
    return Request(RequestType.GET, option);
};

/**
 * Post请求
 * @param option 请求参数
 *
 */
export const POST = (option?: RequestExts | string) => {
    return Request(RequestType.POST, option);
};

/**
 * http通用请求
 * @param method 请求方法
 * @param option 请求参数
 */

export const Request = function (method: RequestType, option: RequestExts | undefined | string) {
    if (typeof option === 'string') {
        option = {
            url: option
        };
    }
    return MethodDecorator(method, option);
};

/**
 * 日志系统
 */
export const Log = AppLog;

/**
 * 配置系统
 */
export const Config = AppConfig;

/**
 * 控制继承类
 */
export default class AppController {
    protected name;
    protected $log = Log;
    protected $config = Config;
}

/**
 * 模版类
 */
export const AppModel: Sequelize = AppDataBase;
