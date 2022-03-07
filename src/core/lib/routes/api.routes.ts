import { ApiRoutesOptions } from '../../index';
import KoaRouter from 'koa-router';
import ApiRoute from './api.route';
import path from 'path';

interface IApiRoutes extends KoaRouter.IRouterOptions, ApiRoutesOptions {
    routePrefix?: string;
    target?: ClassDecorator;
}
export default class ApiRoutes extends KoaRouter {
    /**
     * 文件所在目录和文件名
     */
    private path!: string;

    /**
     * 路由前缀
     */
    private routePrefix!: string;

    /**
     * 执行类
     */
    private target!: ClassDecorator;

    /**
     * 自定义名字
     */
    private name!: string;

    /**
     * 子路由
     */
    private childRoutes: Array<ApiRoutes> = [];

    /**
     * 实现方法
     */
    private methodRoutes: Array<ApiRoute> = [];

    /**
     * 插入
     * @param apiRoutes
     */
    public pushChildRoutes(apiRoutes: ApiRoutes) {
        this.childRoutes.push(apiRoutes);
    }

    /**
     * 插入
     * @param apiRoutes
     */
    public pushMethodRoutes(apiRoutes: ApiRoute) {
        this.methodRoutes.push(apiRoutes);
    }

    /**
     * 设置前缀
     * @returns
     */
    private setPrefix(prefix?: string) {
        if (prefix) {
            prefix = prefix.indexOf('/') === 0 ? prefix : `/${prefix}`;
            this.prefix(prefix);
        }
    }

    /**
     * 设置文件目录
     * @returns
     */
    public setPath(path: string) {
        this.path = path;
    }

    /**
     * 构造函数
     * @param options
     */
    constructor(options: IApiRoutes) {
        super({
            ...options,
            prefix: options?.routePrefix
        });
        Object.assign(this, options);
    }

    public routes(): KoaRouter.IMiddleware<any, {}> {
        // 设置前缀
        if (!this.routePrefix || this.routePrefix === '/') {
            this.setPrefix(path.basename(this.path) || '/');
        } else {
            this.setPrefix(this.routePrefix);
        }
        // 循环当前路由
        if (this.methodRoutes.length && this.target) {
            this.methodRoutes.forEach((method) => {
                if (method.type?.toLocaleLowerCase()) {
                    // 赋值函数，单个路由执行
                    this[method.type.toLocaleLowerCase()](`${this.name}.${method.name}`, method.url, method.value(this.target));
                }
            });
        }
        // 循环子路由
        if (this.childRoutes.length) {
            this.childRoutes.forEach((route) => {
                this.use(route.routes());
            });
        }
        return super.routes();
    }
}
