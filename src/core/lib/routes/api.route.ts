import { ApiResponseType, ApiRequestMethod, IApiRoute, ApiFunctionMiddleware } from '@/core/typings';
import { IMiddleware } from 'koa-router';

/**
 * 单个路由接口
 */
export default class ApiRoute implements IApiRoute {
    // 函数名，路由形式
    public routeName!: string;

    // 自定义名字
    public name!: string;

    // 函数体
    public value!: (_this: ClassDecorator) => IMiddleware;

    // 路由
    public url!: string;

    // 路由类型
    public method!: ApiRequestMethod[];

    // 默认RESTFUL返回格式
    public responseType: ApiResponseType = ApiResponseType.RESTFUL;

    // 描述
    public description?: string;

    /**
     * 中间件
     */
    public middlewares: ApiFunctionMiddleware[] = [];

    // 构造函数
    constructor(options: IApiRoute) {
        Object.assign(this, options);
    }

    // 合并属性
    public options(options: Partial<IApiRoute>) {
        options && Object.assign(this, options);
    }
}
