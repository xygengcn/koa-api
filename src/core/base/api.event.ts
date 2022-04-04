/**
 * 事件监听
 */
import { ApiLogEventContent, ApiErrorEventContent, ApiEventContent } from '../index';
import { EventEmitter } from 'events';
import { ApiMiddlewareParams } from '../typings';
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
    public emitLog(content: ApiLogEventContent | string, options?: any) {
        let eventContent: ApiEventContent;
        if (typeof content !== 'object') {
            eventContent = {
                type: 'log',
                content,
                module: this.prefix
            };
        } else {
            eventContent = {
                ...content,
                type: 'log',
                module: this.prefix
            };
        }
        return this.emit('log', eventContent, options);
    }

    /**
     * 监听日志
     * @param callback
     */
    public onLog<T = any>(callback: (content: ApiLogEventContent, options?: T) => void) {
        return this.on('log', callback);
    }

    /**
     * 监听错误日志
     * @param callback
     * @returns
     */
    public onError<T = ApiMiddlewareParams>(callback: (content: ApiErrorEventContent, options?: T) => void) {
        return this.on('error', callback);
    }

    /**
     * 错误日志
     * @param ctx
     * @param content
     * @returns
     */
    public emitError<T = any>(content: ApiErrorEventContent | string, options?: T) {
        let eventContent: ApiEventContent;
        // 错误写入日志
        if (typeof content !== 'object') {
            eventContent = {
                type: 'error',
                content,
                module: this.prefix
            };
        } else {
            eventContent = {
                ...content,
                type: 'error',
                module: this.prefix
            };
        }
        return this.emit('error', eventContent, options || {});
    }
}
const apiEvent = new ApiEvent();

export const Log = apiEvent.emitLog.bind(apiEvent);

export const onLog = apiEvent.onLog.bind(apiEvent);

export default apiEvent;
