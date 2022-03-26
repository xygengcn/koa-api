/**
 * 事件监听
 */
import { ApiEventContent } from '../index';
import { EventEmitter } from 'events';
export class ApiEvent {
    // 事件监听
    private $event: EventEmitter = new EventEmitter();
    // 前缀
    private prefix?: string = 'api';

    // 构造函数
    constructor(opts?: { prefix?: string }) {
        if (opts?.prefix) {
            this.prefix = opts?.prefix;
        }
    }

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public on(key: string, callback: (...args: any[]) => void) {
        key = `${this.prefix}-${key}`;
        this.$event.on(key, callback);
        return this;
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public emit(key: string, ...args: any[]) {
        key = `${this.prefix}-${key}`;
        return this.$event.emit(key, ...args);
    }

    /**
     *  全部日志事件
     * @param content
     * @returns
     */
    public emitLog(content: ApiEventContent | string, options?: any) {
        if (typeof content !== 'object') {
            content = {
                type: 'log',
                content,
                module: this.prefix
            };
        } else {
            content = {
                module: this.prefix,
                ...content
            };
        }
        return this.emit('log', content, options);
    }

    /**
     * 监听日志
     * @param callback
     */
    public onLog<T = any>(callback: (content: ApiEventContent, options?: T) => void) {
        return this.on('log', callback);
    }

    /**
     * 监听错误日志
     * @param callback
     * @returns
     */
    public onError<T = any>(callback: (content: ApiEventContent, options?: T) => void) {
        return this.on('error', callback);
    }

    /**
     * 错误日志
     * @param ctx
     * @param content
     * @returns
     */
    public emitError<T = any>(content: ApiEventContent | string, options?: T) {
        // 错误写入日志
        if (typeof content !== 'object') {
            content = {
                type: 'error',
                content,
                module: this.prefix
            };
        } else {
            content = {
                module: this.prefix,
                ...content
            };
        }
        return this.emit('error', content, options || {});
    }
}
const apiEvent = new ApiEvent();

export const Log = apiEvent.emitLog.bind(apiEvent);

export const onLog = apiEvent.onLog.bind(apiEvent);

export default apiEvent;