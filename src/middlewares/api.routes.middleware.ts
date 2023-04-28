import { Middleware } from '@/decorators';
import { IApiClassMiddleware } from '@/typings/middleware';
import { autoBindLoadControllers, convertControllerFileToControllerPath, removeTrailingSlash } from '@/utils/file';
import path from 'path';
import KoaRouter from 'koa-router';
import container from '@/inversify';
import { API_INVERSIFY_KEY, API_METADATA_KEY } from '@/keys/inversify';
import { Logger } from '@/decorators';
import ApiLogger from '@/logger';
import { Context, Next } from 'koa';
import { ApiRouteParam, ApiRouteParamName } from '@/typings';
import { objectGet } from '@/utils';

@Middleware()
export default class ApiRoutesMiddleware implements IApiClassMiddleware {
    @Logger()
    private readonly logger!: ApiLogger;
    /**
     * 路由
     */
    private router!: KoaRouter;

    // 初始化
    public init(): void {
        const dir = path.join(require.main?.path || '', './controllers');

        const controllers = convertControllerFileToControllerPath(dir);

        // 加载控制器
        autoBindLoadControllers(controllers);

        this.router = new KoaRouter();

        // 获取控制器
        const list: object[] = container.getAll(API_INVERSIFY_KEY.CONTROLLER_CLASS_KEY) || [];

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

                        // 路由参数
                        const routeParams: ApiRouteParam[] = Reflect.getMetadata(API_METADATA_KEY.ROUTER_PARAMS, target.constructor.prototype, name) || [];
                        // 合并控制器路由器
                        const route = removeTrailingSlash(path.join(controllerRoute, routePath));

                        this.logger.log('route', routeMethods, route);
                        // 方法实现
                        const routeMiddleware = async (ctx: Context, next: Next) => {
                            this.logger.log('http', ctx.method, ctx.url);

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

                                if (param.name === ApiRouteParamName.ctx) {
                                    return param.key ? objectGet(ctx, param.key) : ctx;
                                }

                                return ctx;
                            });
                            ctx.body = await target[name].call(target, ...params, ctx, next);
                            await next();
                        };
                        const middlewares = Reflect.getMetadata(API_METADATA_KEY.ROUTRE_MIDDLEWARE, target, name) || [];
                        this.router.register(route, routeMethods, [...middlewares, routeMiddleware], { name });
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
