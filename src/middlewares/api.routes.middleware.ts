import { Middleware, Options } from '@/decorators';
import { IApiClassMiddleware } from '@/typings/middleware';
import { autoBindLoadControllers, convertControllerFileToControllerPath, isDir, removeTrailingSlash } from '@/utils/file';
import path from 'path';
import KoaRouter from 'koa-router';
import container from '@/container';
import { API_INVERSIFY_KEY, API_METADATA_KEY } from '@/keys/inversify';
import { Logger } from '@/decorators';
import ApiLogger from '@/logger';
import { Context, Next } from 'koa';
import { ApiRouteParam, ApiRouteParamName, IOptions } from '@/typings';
import { objectGet } from '@/utils';
import { IncomingHttpHeaders } from 'http';

@Middleware()
export default class ApiRoutesMiddleware implements IApiClassMiddleware {
    @Logger()
    private readonly logger!: ApiLogger;

    @Options()
    private readonly options!: IOptions;
    /**
     * 路由
     */
    private router!: KoaRouter;

    // 初始化
    public init(): void {
        if (this.options?.baseUrl && isDir(this.options?.baseUrl)) {
            const dir = path.join(this.options?.baseUrl);
            const controllers = convertControllerFileToControllerPath(dir);
            // 自动加载控制器
            autoBindLoadControllers(controllers);
        }

        // 创建路由
        this.router = new KoaRouter();

        // 获取控制器
        let list: object[] = [];
        try {
            list = container.getAll(API_INVERSIFY_KEY.CONTROLLER_CLASS_KEY) || [];
        } catch (error) {}

        // 循环加载路由
        list.forEach((target: object) => {
            const prefix = Reflect.getMetadata(API_METADATA_KEY.CONTROLLER_PREFIX, target);
            // 获取控制器文件读取到的数据
            const controllerFile: { file: string; path: string; prefix: string } = Reflect.getMetadata(API_METADATA_KEY.CONTROLLER_FILE_PATH, target);
            // 控制器所有方法
            const methodKeys: string[] = Reflect.ownKeys(target.constructor.prototype) as string[];
            // 控制器路由
            const controllerRoute = path.join(controllerFile?.path || '/', prefix || controllerFile?.prefix || '').toLocaleLowerCase() || '/';
            // 循环方法
            methodKeys.forEach((name: string) => {
                // 普通函数
                if (name && name !== 'constructor' && typeof target[name] === 'function') {
                    // 过滤普通函数
                    const isRoute = Reflect.hasMetadata(API_METADATA_KEY.ROUTER_METHOD, target, name);
                    if (isRoute) {
                        // 路由方法
                        const routeMethods = Reflect.getMetadata(API_METADATA_KEY.ROUTER_METHOD, target, name);
                        // 文件路由地址
                        const routePath = Reflect.getMetadata(API_METADATA_KEY.ROUTER_PATH, target, name) || '';

                        // 路由头部
                        const routeHeaders: IncomingHttpHeaders = Reflect.getMetadata(API_METADATA_KEY.ROUTER_HEADERS, target, name) || { 'content-type': 'application/json' };

                        // 路由参数
                        const routeParams: ApiRouteParam[] = Reflect.getMetadata(API_METADATA_KEY.ROUTER_PARAMS, target.constructor.prototype, name) || [];
                        // 合并控制器路由器
                        const route = removeTrailingSlash(path.join(controllerRoute, routePath));

                        this.logger.log('route', routeMethods, route);
                        // 方法实现
                        const routeMiddleware = async (ctx: Context, next: Next) => {
                            this.logger.log('http', ctx.method, ctx.path);

                            // 处理参数
                            const params = routeParams.map((param) => {
                                if (param.name === ApiRouteParamName.next) {
                                    return next;
                                }
                                // get请求参数
                                if (param.name === ApiRouteParamName.query) {
                                    const query = ctx.query || {};
                                    return param.key ? objectGet(query, param.key) : query;
                                }

                                // post请求参数
                                if (param.name === ApiRouteParamName.body) {
                                    const body = ctx.request?.body || {};
                                    return param.key ? objectGet(body, param.key) : body;
                                }

                                // 文件请求参数
                                if (param.name === ApiRouteParamName.file) {
                                    const files = ctx.request?.files || {};
                                    return files;
                                }

                                // 默认
                                if (param.name === ApiRouteParamName.ctx) {
                                    return param.key ? objectGet(ctx, param.key) : ctx;
                                }

                                return ctx;
                            });

                            // 处理头部
                            Object.entries(routeHeaders).forEach(([key, value]) => {
                                value && ctx.set(key, value);
                            });
                            ctx.body = await target[name].call(target, ...params, ctx, next);
                            await next();
                        };
                        // 路由中间件
                        const routeMiddlewares = Reflect.getMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, target, name) || [];
                        // 控制器中间件
                        const controllerMiddlewares = Reflect.getMetadata(API_METADATA_KEY.CONTROLLER_MIDDLEWARE, target) || [];
                        this.router.register(route, routeMethods, [...routeMiddlewares, ...controllerMiddlewares, routeMiddleware], { name });
                    }
                }
            });
        });
    }
    // 解析
    public resolve() {
        return this.router.routes();
    }
}
