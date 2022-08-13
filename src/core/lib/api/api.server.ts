import http from 'http';
import { ApiDefaultOptions } from '../../index';
import Logger from '../../base/api.event';

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
            this.logger(
                {
                    subType: 'system'
                },
                {
                    message: `Listening on Port: ${this.options.port || 3000}}`,
                    addr: server.address()
                }
            );
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
                this.logger({ subType: 'system', level: 'error' }, { message: `Port requires elevated privileges`, error });
                this.httpServer = null;
                break;
            case 'EADDRINUSE':
                this.logger({ subType: 'system', level: 'error' }, { message: `Port: is already in use`, error });
                this.httpServer = null;
                break;
            default:
                this.logger({ subType: 'system', level: 'error' }, error);
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
     * 监听日志
     * @returns
     */
    public logger = Logger;
}
