import { ApiControllerAttributes, ApiRoutesBase, ApiRoutesTree, IApiRoute, IApiRoutes } from '../../index';
import KoaRouter, { Layer } from 'koa-router';
import ApiRoute from './api.route';
import path from 'path';

export default class ApiRoutes extends KoaRouter {
    /**
     * 控制器类名 路由形式
     */
    private controllerName!: string;
    /**
     * 配置属性
     */
    private attributes!: ApiControllerAttributes;
    /**
     * 文件所在目录和文件名
     */
    private path!: string;

    /**
     * 路由前缀,此变量是控制传参，并非最后prefix
     */
    private readonly routePrefix!: string;
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
        const routes: Array<IApiRoute> = this.methodRoutes.map((route) => {
            return {
                ...route,
                routeName: (this.controllerName && `${this.controllerName}.${route.routeName}`) || route.routeName
            };
        });
        // 有子节点
        if (this.childRoutes?.length) {
            this.childRoutes.forEach((route) => {
                const queueList = route.getQueue(stacks).map((q) => {
                    return {
                        ...q,
                        routeName: (this.controllerName && `${this.controllerName}.${q.routeName}`) || q.routeName
                    };
                });
                routes.push(...queueList);
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
    public getRouteTree(stacks: Array<Layer> | undefined, parentName: string = ''): ApiRoutesTree {
        const routes: Array<IApiRoute> = this.methodRoutes.map((route) => {
            const stack = stacks?.find((layer) => layer.name === route.name);
            return {
                ...route,
                routeName: `${this.controllerName}.${route.routeName}` || route.routeName,
                url: stack?.path || route.url
            };
        });
        // 有子节点
        if (this.childRoutes?.length) {
            // 获取子树
            const childRoutesTree: Array<ApiRoutesTree> = this.childRoutes.map((route) => {
                // 继承父级名字
                const _parentName = parentName ? `${parentName}.${this.controllerName}` : this.controllerName;
                const routeTree = route.getRouteTree(stacks, _parentName);
                // 修改路由名
                const childRoutes = routeTree.routes.map((r) => {
                    return {
                        ...r,
                        routeName: `${parentName && parentName + '.'}${this.controllerName}.${r.routeName}` || r.routeName
                    };
                });
                return {
                    ...routeTree,
                    routes: childRoutes
                };
            });
            return {
                controllerName: this.controllerName,
                path: this.path,
                routePrefix: this.routePrefix,
                anonymous: this.anonymous,
                attributes: this.attributes,
                routes,
                childRoutesTree
            };
        }
        // 没有子节点
        return {
            controllerName: this.controllerName,
            path: this.path,
            routePrefix: this.routePrefix,
            anonymous: this.anonymous,
            attributes: this.attributes,
            routes
        };
    }

    /**
     * 控制器集合
     */
    public getControllerQueue(queue: Array<ApiRoutesBase> = []): Array<ApiRoutesBase> {
        // 插入本身
        queue.push({ controllerName: this.controllerName, path: this.path, routePrefix: this.routePrefix, anonymous: this.anonymous, attributes: this.attributes });
        // 有子节点
        if (this.childRoutes?.length) {
            this.childRoutes.forEach((child) => {
                child.getControllerQueue(queue);
            });
        }
        return queue;
    }
}
