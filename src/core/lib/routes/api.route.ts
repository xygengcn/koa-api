import { ApiResponseType } from '@/core/typings';
import { IMiddleware } from 'koa-router';
import { ApiRequestType, IApiRoute } from '../../index';

/**
 * 单个路由接口
 */
export default class ApiRoute implements IApiRoute {
    // 函数名
    public methodName!: string;

    // 自定义名字
    public name!: string;

    // 函数体
    public value!: (_this: ClassDecorator) => IMiddleware;

    // 路由
    public url!: string;

    // 路由类型
    public type!: ApiRequestType;

    // 默认RESTFUL返回格式
    public responseType: ApiResponseType = ApiResponseType.RESTFUL;

    // 描述
    public description?: string;

    // 构造函数
    constructor(target: IApiRoute) {
        Object.assign(this, target);
    }

    // 合并属性
    public options(target: Partial<IApiRoute>) {
        target && Object.assign(this, target);
    }
}
