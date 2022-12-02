import http from 'http';
import { ApiDefaultOptions } from '../../index';
import Logger from '../../base/api.logger';
import apiEvent from '../../base/api.event';

export default class ApiServer {
    /**
     * 构造函数
     * @param options
     */
    constructor(options?: ApiDefaultOptions) {
        if (options && typeof options === 'object') {
            Object.assign(this.options, options);
        }
        // 设置namespace
        if (options?.namespace) {
            apiEvent.setNamespace(options.namespace);
        }
    }
    /**
     * 系统配置
     */
    protected options: Partial<ApiDefaultOptions> = {};
    /**
     * http服务
     */
    protected httpServer: http.Server | null = null;

    /**
     * 监听日志
     * @returns
     */
    public logger = Logger;

    /**
     * 创建http服务
     * Create HTTP server.
     */
    private createServer(callback: http.RequestListener): http.Server {
        const server = http.createServer(callback);
        server.on('error', this.onServerError.bind(this));
        // 监听
        server.on('listening', () => {
            this.logger(
                {
                    module: 'system'
                },
                {
                    message: `Listening on Port: ${this.options?.port || 3000}}`,
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
            case 'EADDRINUSE':
                this.logger({ module: 'system', type: 'error' }, { code: error.code, message: error.message });
                this.httpServer = null;
                break;
            default:
                this.logger({ module: 'system', type: 'error' }, error);
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
            this.httpServer.listen(this.options?.port || 3000);
            callback.forEach((func) => {
                this.httpServer && func(this.httpServer);
            });
        }
        return this;
    }
}
