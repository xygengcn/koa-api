import { ApiControllerAttributes, ApiRoutesTree, IApiRoute, IApiRoutes } from '../../index';
import KoaRouter, { Layer } from 'koa-router';
import ApiRoute from './api.route';
import path from 'path';

export default class ApiRoutes extends KoaRouter {
    /**
     * 配置属性
     */
    private attributes!: ApiControllerAttributes;
    /**
     * 文件所在目录和文件名
     */
    private path!: string;

    /**
     * 路由前缀
     */
    private routePrefix!: string;
    /**
     * 匿名控制器
     */
    private anonymous!: boolean;

    /**
     * 执行类
     */
    private target!: ClassDecorator;

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
            this.methodRoutes.forEach((route) => {
                if (route.method.length > 0) {
                    this.register(route.url, route.method, route.value(this.target), { name: route.name });
                } else {
                    this[route.method[0].toLocaleLowerCase() || 'get'](route.name, route.url, route.value(this.target));
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

    /**
     * 队列路由
     */
    public getQueue(stacks: Array<Layer> | undefined): Array<IApiRoute> {
        const routes: Array<IApiRoute> = [...this.methodRoutes] || [];
        if (this.childRoutes?.length) {
            this.childRoutes.forEach((route) => {
                const queue = route.getQueue(stacks);
                routes.push(...queue);
            });
        }
        return routes.map((route) => {
            const stack = stacks?.find((layer) => layer.name === route.name);
            return {
                ...route,
                url: stack?.path || route.url
            };
        });
    }

    /**
     * 树形路由
     */
    public getRouteTree(stacks: Array<Layer> | undefined): ApiRoutesTree {
        let routes: Array<IApiRoute> = [...this.methodRoutes] || [];
        routes = routes.map((route) => {
            const stack = stacks?.find((layer) => layer.name === route.name);
            return {
                ...route,
                url: stack?.path || route.url
            };
        });
        if (this.childRoutes?.length) {
            const childRoutesTree = this.childRoutes.map((route) => {
                const routeTree = route.getRouteTree(stacks);
                return routeTree;
            });
            return {
                path: this.path,
                routePrefix: this.routePrefix,
                anonymous: this.anonymous,
                attributes: this.attributes,
                routes,
                childRoutesTree
            };
        }
        return {
            path: this.path,
            routePrefix: this.routePrefix,
            anonymous: this.anonymous,
            attributes: this.attributes,
            routes
        };
    }
}
