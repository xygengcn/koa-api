import Cluster from 'cluster';
import OS from 'os';
import http from 'http';
import Koa, { Context, RequestExts } from 'koa';
import debug from 'debug';
import AppMiddlewareCore from './app.core.middleware';
import appEventCore from './app.core.event';
import { AppMiddlewareOpts, IResponse, IResponseContent } from '@core/typings/app';
import { Log } from '@core/app';

/**
 * 主要启动程序，继承于Koa
 */
class App {
    constructor() {
        this.koa = new Koa();
        this.middleware = new AppMiddlewareCore();
        this.initMiddleware();
    }

    /**
     * 初始化koa对象
     */
    private koa: Koa;

    /**
     * 中间件对象
     */
    private middleware: AppMiddlewareCore;

    /**
     * http服务
     */
    private server: http.Server | null = null;

    /**
     * 默认端口
     */
    private port: string | number = 3000;

    /**
     * 启动处理额外的中间件
     */
    private initMiddleware(): void {
        this.middleware.init((middlewares) => {
            middlewares.forEach((middleware) => {
                this.koa.use(middleware);
            });
        });
    }

    /**
     * 服务器，错误拦截
     * Event listener for HTTP server "error" event.
     */
    private onServerError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                appEventCore.emitError({ type: 'system', content: `Port: ${this.port}: requires elevated privileges` });
                process.exit(1);
            case 'EADDRINUSE':
                appEventCore.emitError({ type: 'system', content: `${this.port}: is already in use` });
                process.exit(1);
            default:
                throw error;
        }
    }

    /**
     * 监听
     * Event listener for HTTP server "listening" event.
     */
    private onListening() {
        if (!this.server) return null;
        debug(`Listening on Port: ${this.port}, Addr: ${this.server.address()}`);
    }

    /**
     * 创建http服务
     * Create HTTP server.
     */
    private createServer() {
        this.server = http.createServer(this.koa.callback());
        this.server.listen(this.port);
        this.server.on('error', this.onServerError);
        this.server.on('listening', this.onListening);
    }
    /**
     * 监听请求返回
     * @param callback
     * @returns
     */
    public onHttp(callback: (ctx: Context, content: IResponse) => any): void {
        return appEventCore.onHttp((ctx, content) => {
            callback(ctx, content);
        });
    }

    /**
     * 插入路由前中间件
     * @param middleware 中间件
     */
    public use(middleware: Koa.Middleware) {
        return this.beforeRouteUse(middleware);
    }

    /**
     * 插入路由前中间件
     * @param middleware 中间件
     */
    public beforeRouteUse(middleware: Koa.Middleware): void {
        this.middleware.beforeRouteUse(middleware);
    }

    /**
     * 插入路由后中间件
     * @param middleware 中间件
     */
    public afterRouteUse(middleware: Koa.Middleware): void {
        this.middleware.afterRouteUse(middleware);
    }

    /**
     * 请求预警回调
     * @param callback
     */
    public onError(callback: (content: IResponseContent, ctx?: Context) => void): void {
        return appEventCore.onError((content, ctx) => {
            callback(content, ctx);
        });
    }

    /**
     * 设置跨域配置
     */
    public cors(options: AppMiddlewareOpts) {
        this.middleware.option(options);
    }

    /**
     * 启动程序
     */
    private startApp(): void {
        this.createServer();
        // 内置日志系统
        this.onHttp((ctx, content) => {
            if (process.env.NODE_ENV === 'development') {
                console.error('日志系统', ctx);
            }
            const exts: RequestExts = ctx.exts();
            Log.w(content, exts.log);
        });
    }
    /**
     * 集群
     * @param enable 是否开启
     * @param callback
     * @returns
     */
    private cluster(enable: boolean = false, callback: Function) {
        if (process.env.NODE_ENV === 'development' || !enable) {
            return callback();
        }
        if (Cluster.isMaster) {
            const numCPUs = OS.cpus().length;
            for (let i = 0; i < numCPUs; i++) {
                Cluster.fork();
            }
            // 监听worker
            Cluster.on('listening', function (worker, address) {
                Log.w({
                    type: 'info',
                    content: {
                        type: 'system',
                        content: {
                            controller: 'system',
                            content: {
                                workerId: worker.process.pid,
                                address: address,
                            },
                            developMsg: '监听worker',
                            updateTime: new Date().getTime(),
                        },
                    },
                });
            });
            // 监听worker退出事件，code进程非正常退出的错误code，signal导致进程被杀死的信号名称
            Cluster.on('exit', function (worker, code, signal) {
                Log.w({
                    type: 'error',
                    content: {
                        type: 'system',
                        content: {
                            controller: 'system',
                            content: {
                                workerId: worker.process.pid,
                                signal,
                                code,
                            },
                            error: '进程异常退出',
                            updateTime: new Date().getTime(),
                        },
                    },
                });
                Cluster.fork();
            });
        } else {
            callback();
        }
    }
    /**
     * 启动程序
     * @param port 端口
     */
    public start(port: number = 3000, configs?: { cluster?: boolean }): void {
        this.port = port;
        this.cluster(configs?.cluster, () => {
            this.startApp();
        });
    }
}
export default new App();
