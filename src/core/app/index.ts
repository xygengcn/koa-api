/**
 * 控制器对外接口，对外接口暴露
 */
import { IAppControllerCoreAuthCallback } from './../type/controller';
import AppConfig from '@core/lib/app.config';
import Koa from 'koa';
import {
    IAppConfig,
    IAppControllerClass,
    IAppControllerCoreAuthContext,
    IAppControllerMethod,
    IAppControllerOptions,
    IAppControllerRequest,
} from '@core/type/controller';
import { AppControllerCore } from '@core/lib/app.controllerCore';
import AppLog from '@core/lib/app.log';
import AppDataBase from '@core/lib/app.database';
import { Sequelize } from 'sequelize/types';
import App from '@core/type';

/**
 * 抛出参数类型
 */
export type Context = Koa.Context;

export type Next = Koa.Next;

export type Params = Object | undefined | null;

export type AuthContext = IAppControllerCoreAuthContext;

export type AuthCallback = IAppControllerCoreAuthCallback;

/**
 * 控制器装饰器
 * @param prefix 路由前缀
 */
export function Controller(prefix: string = '/') {
    return AppControllerCore.setControllerClass(prefix) as IAppControllerClass;
}

/**
 * Get请求
 * @param option 请求参数
 */
export const GET = (option?: IAppControllerOptions) => {
    return Request(IAppControllerRequest.GET, option);
};

/**
 * Post请求
 * @param option 请求参数
 *
 */
export const POST = (option?: IAppControllerOptions) => {
    return Request(IAppControllerRequest.POST, option);
};

/**
 * http通用请求
 * @param method 请求方法
 * @param option 请求参数
 */

export const Request = function (method: IAppControllerRequest, option: IAppControllerOptions) {
    if (typeof option === 'string') {
        option = {
            url: option,
        };
    }
    return AppControllerCore.setControllerMethod(method, option) as IAppControllerMethod;
};

/**
 * 日志系统
 */
export const Log: App.AppLog = AppLog;

/**
 * 配置系统
 */
export const Config: IAppConfig = AppConfig;

/**
 * 控制继承类
 */
export default class AppController {
    protected name?: string;
    protected $log: App.AppLog = Log;
    protected $config: IAppConfig = Config;
}

/**
 * 模版类
 */
export const AppModel: Sequelize = AppDataBase;
