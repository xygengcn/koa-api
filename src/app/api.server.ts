import http from 'http';
import { IOptions } from '@/typings';
import { Logger } from '@/decorators';
import ApiLogger from '@/logger';
import { isFunction } from '@/utils';

export default class ApiServer {
    // 日志
    @Logger()
    protected readonly logger!: ApiLogger;
    /**
     * 构造函数
     * @param options
     */
    constructor(options: Partial<IOptions>) {
        Object.assign(this.options, options || {});
    }

    /**
     * 系统配置
     */
    protected options: Partial<IOptions> = {};

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
        server.on('error', this.onServerError.bind(this));
        // 监听
        server.on('listening', () => {
            this.logger.log('listening', { address: server.address() });
        });
        return server;
    }

    /**
     * 服务器，错误拦截
     * Event listener for HTTP server "error" event.
     */
    private onServerError(error: Error & { code: string }) {
        this.logger.log('error', error);
        switch (error.code) {
            case 'EACCES':
            case 'EADDRINUSE':
                this.httpServer = null;
                break;
            default:
                break;
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
     * 时间监听
     * @param event
     * @param listeners
     */
    public on(event: string, listeners: (...args: any[]) => void) {
        if (isFunction(listeners)) {
            this.logger.on(event, listeners);
        }
    }
}
