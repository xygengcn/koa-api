/**
 * 事件监听
 */
import { IResponse, IResponseContent } from '@core/typings/app';
import { EventEmitter } from 'events';
import { Context } from 'koa';
export class AppEventCore {
    // 监听数量
    private listeners: Set<String>;

    // 监听对象
    private $event: EventEmitter;

    constructor() {
        this.$event = new EventEmitter();
        this.listeners = new Set();
    }

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public $on(key: string, callback: Function) {
        this.$event.on(key, (...args: any[]) => {
            callback(...args);
        });
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public $emit(key: string, ...args: any[]) {
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
        return this.$on('app-http', (ctx: Context, content: IResponse) => {
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
        return this.$emit('app-http', ctx, content);
    }

    /**
     * 监听报错
     * @param callback
     * @returns
     */
    public onError(callback: (content: IResponseContent, ctx: Context) => void) {
        return this.$on('app-error', callback);
    }

    /**
     * 触发报错
     * @param ctx
     * @param content
     * @returns
     */
    public emitError(content: IResponseContent, ctx?: Context) {
        return this.$emit('app-error', content, ctx);
    }
}

export default new AppEventCore();
