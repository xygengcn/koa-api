import http from 'http';
import { ApiDefaultOptions } from '../../index';
import event from '../../base/api.event';

export default class ApiServer {
    /**
     * 构造函数
     * @param options
     */
    constructor(options?: ApiDefaultOptions) {
        if (options) {
            Object.assign(this.options, options);
        }
    }
    /**
     * 系统配置
     */
    protected options: ApiDefaultOptions = { port: 3000 };
    /**
     * http服务
     */
    protected httpServer: http.Server | null = null;

    /**
     * 创建http服务
     * Create HTTP server.
     */
    private createServer(callback: http.RequestListener): http.Server {
        const server = http.createServer(callback);
        server.on('error', this.onServerError);
        // 监听
        server.on('listening', () => {
            event.emitLog({
                subType: 'system',
                content: {
                    message: `Listening on Port: ${this.options.port || 3000}}`,
                    addr: server.address()
                }
            });
        });
        return server;
    }

    /**
     * 服务器，错误拦截
     * Event listener for HTTP server "error" event.
     */
    private onServerError(error) {
        switch (error.code) {
            case 'EACCES':
                event.emitError({
                    subType: 'system',
                    content: {
                        message: `Port requires elevated privileges`,
                        error
                    }
                });
                this.httpServer = null;
                break;
            case 'EADDRINUSE':
                event.emitError({
                    subType: 'system',
                    content: {
                        message: `Port: is already in use`,
                        error
                    }
                });
                this.httpServer = null;
                break;
            default:
                event.emitError({
                    subType: 'system',
                    content: {
                        error
                    }
                });
        }
        process.exit(1);
    }

    /**
     * 启动http服务
     */
    protected startServer(mainServer: http.RequestListener, callback: Array<(server: http.Server) => void>): ApiServer {
        if (!this.httpServer) {
            this.httpServer = this.createServer(mainServer);
        }
        if (this.httpServer) {
            this.httpServer.listen(this.options.port || 3000);
            callback.forEach((func) => {
                this.httpServer && func(this.httpServer);
            });
        }
        return this;
    }

    /**
     *  全部日志事件
     * @param content
     * @returns
     */
    public onLog = event.onLog.bind(event);

    /**
     * 监听错误日志
     * @param callback
     * @returns
     */
    public onError = event.onError.bind(event);
}
