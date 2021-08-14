/**
 * 事件监听
 */
import { ICustomContent, IResponse, IResponseContent } from '@core/typings/app';
import { EventEmitter } from 'events';
import { Context } from 'koa';
export class AppEvent {
    constructor(opts?: { prefix?: string }) {
        this.prefix = opts?.prefix || 'app';
        this.$event = new EventEmitter();
        this.listeners = new Set();
    }

    // 前缀
    private prefix: string;
    // 监听数量
    private listeners: Set<String>;

    // 监听对象
    private $event: EventEmitter;

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public $on(key: string, callback: Function) {
        key = `${this.prefix}-${key}`;
        this.$event.on(key, (...args: any[]) => {
            callback(...args);
        });
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public $emit(key: string, ...args: any[]) {
        key = `${this.prefix}-${key}`;
        this.listeners.add(key);
        if (this.listeners.size > this.$event.getMaxListeners()) {
            this.$event.setMaxListeners(this.listeners.size);
        }
        return this.$event.emit(key, ...args);
    }

    /**
     * 监听请求
     * @param callback
     */
    public onHttp(callback: (ctx: Context, content: IResponse) => void) {
        return this.$on('http', (ctx: Context, content: IResponse) => {
            if (content.type === 'error') {
                this.emitError(content.content, ctx);
            }
            callback(ctx, content);
        });
    }

    /**
     * 触发请求返回
     */
    public emitHttp(ctx: Context, content: IResponse) {
        return this.$emit('http', ctx, content);
    }

    /**
     *  系统日志事件
     * @param content
     * @returns
     */
    public emitLog(content: { type: string; content: any }) {
        return this.$emit('log', content);
    }

    /**
     * 监听日志
     * @param callback
     */
    public onLog(callback: (content: { type: string; content: ICustomContent }) => void) {
        return this.$on('log', (content) => {
            callback(content);
        });
    }

    /**
     * 监听报错
     * @param callback
     * @returns
     */
    public onError(callback: (content: IResponseContent, ctx: Context) => void) {
        return this.$on('error', callback);
    }

    /**
     * 触发报错
     * @param ctx
     * @param content
     * @returns
     */
    public emitError(content: IResponseContent, ctx?: Context) {
        return this.$emit('error', content, ctx);
    }
}

export default new AppEvent();
