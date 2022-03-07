import { IMiddleware } from 'koa-router';
import { ApiRouteOptions, ApiRouteRequestType, IApiRoute } from '../../index';

/**
 * 单个路由接口
 */
export default class ApiRoute {
    // 函数名
    public methodName!: string;

    // 自定义名字
    public name!: string;

    // 函数体
    public value!: (_this: ClassDecorator) => IMiddleware;

    // 路由
    public url!: string;

    // 路由配置
    public routeOptions!: ApiRouteOptions;

    // 路由类型
    public type!: ApiRouteRequestType;

    // 构造函数
    constructor(target: IApiRoute) {
        Object.assign(this, target);
    }

    // 合并属性
    public options(target: Partial<Exclude<IApiRoute, 'routeOptions'>>, routeOptions: Partial<ApiRouteOptions>) {
        target && Object.assign(this, target);
        routeOptions && Object.assign(this.routeOptions, routeOptions);
    }
}
