/**
 * 事件监听
 */
import { EventEmitter } from 'events';
import { ApiMiddlewareParams, IApiEvent, IApiEventType } from '../typings';
class ApiEvent {
    // 事件监听
    private $event: EventEmitter = new EventEmitter();

    // namespace
    private namespace?: string = '';

    // 设置namespace
    public setNamespace(namespace: string): void {
        this.namespace = namespace;
    }

    /**
     * 监听
     * @param key 事件名称
     * @param callback 回调
     */
    public on<T, K = ApiMiddlewareParams>(type: IApiEventType, callback: (content: IApiEvent<T>, options?: K) => void) {
        this.$event.on(type, callback);
        return this;
    }

    /**
     * 触发
     * @param key 事件名称
     */
    public emit(event: IApiEventType | { type?: IApiEventType; module?: string }, content: any, options?: ApiMiddlewareParams) {
        let type: IApiEventType = 'log';
        let module: string = 'default';
        if (typeof event === 'object') {
            type = event.type || 'log';
            module = event.module || 'default';
        } else {
            type = event;
        }
        return this.$event.emit(
            type,
            {
                type,
                module,
                namespace: this.namespace,
                content
            },
            options
        );
    }
}
const apiEvent = new ApiEvent();

export default apiEvent;
