/**
 * 事件监听
 */
import { EventEmitter } from 'events';
import { ApiMiddlewareParams, IApiEvent, IApiEventLevel } from '../typings';
class ApiEvent {
    // 事件监听
    private $event: EventEmitter = new EventEmitter();
    // 前缀
    private module?: string = 'api';

    // 构造函数
    constructor(opts?: { module?: string }) {
        if (opts?.module) {
            this.module = opts?.module;
        }
    }

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public on<T, K = ApiMiddlewareParams>(level: IApiEventLevel, callback: (content: IApiEvent<T>, options?: K) => void) {
        this.$event.on(level, callback);
        return this;
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public emit(level: IApiEventLevel | { level?: IApiEventLevel; subType?: string }, content: any, options?: ApiMiddlewareParams) {
        let type: IApiEventLevel = 'log';
        let subType: string = 'default';
        if (typeof level === 'object') {
            type = level.level || 'log';
            subType = level.subType || '';
        } else {
            type = level;
        }
        return this.$event.emit(
            type,
            {
                type,
                subType,
                module: this.module,
                content
            },
            options
        );
    }
}
const apiEvent = new ApiEvent();

const Logger = (level: IApiEventLevel | { level?: IApiEventLevel; subType?: string }, content: Object | string | number | Error, options?: ApiMiddlewareParams) => {
    apiEvent.emit(level, content, options);
};

Logger.Log = (content: Object | string | number | Error, options?: any) => {
    apiEvent.emit('log', content, options);
};

Logger.on = <T, K = ApiMiddlewareParams>(level: IApiEventLevel, callback: (content: IApiEvent<T>, options?: K) => void) => {
    apiEvent.on(level, callback);
};

Logger.onError = <T, K = ApiMiddlewareParams>(callback: (content: IApiEvent<T>, options?: K) => void) => {
    apiEvent.on('error', callback);
};

export default Logger;
