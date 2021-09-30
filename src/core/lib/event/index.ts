/**
 * 事件监听
 */
import { EventEmitter } from 'events';
import { Context } from 'koa';
class AppEvent {
    // 前缀
    private prefix: string = 'app';
    // 监听数量
    private listeners: Set<String>;

    // 监听对象
    private $event: EventEmitter;

    constructor(opts?: { prefix?: string }) {
        if (opts?.prefix) {
            this.prefix = opts?.prefix;
        }
        this.$event = new EventEmitter();
        this.listeners = new Set();
    }

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
    public onHttp(callback: (content: DefaultContent, ctx: Context) => void) {
        return this.$on('http', (content: DefaultContent, ctx: Context) => {
            callback(content, ctx);
        });
    }

    /**
     * 触发请求返回
     */
    public emitHttp(content: DefaultContent, ctx: Context) {
        return this.$emit('http', content, ctx);
    }

    /**
     *  系统日志事件
     * @param content
     * @returns
     */
    public emitLog(content: DefaultContent | string, options?: any) {
        if (typeof content === 'string') {
            content = {
                type: 'log',
                content
            };
        }
        return this.$emit('log', content, options);
    }

    /**
     * 监听日志
     * @param callback
     */
    public onLog(callback: (content: DefaultContent, options?: any) => void) {
        return this.$on('log', (content, options) => {
            callback(content, options);
        });
    }

    /**
     * 监听报错
     * @param callback
     * @returns
     */
    public onError(callback: (content: DefaultContent, ctx: Context) => void) {
        return this.$on('error', callback);
    }

    /**
     * 触发报错
     * @param ctx
     * @param content
     * @returns
     */
    public emitError(content: DefaultContent, ctx?: Context) {
        return this.$emit('error', content, ctx);
    }
}

export default new AppEvent();
