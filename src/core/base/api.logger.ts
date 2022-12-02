import { IApiEventType, ApiMiddlewareParams, IApiEvent } from '../typings';
import apiEvent from './api.event';

const Logger = (event: IApiEventType | { type?: IApiEventType; module?: string }, content: Object | string | number | Error, options?: ApiMiddlewareParams) => {
    apiEvent.emit(event, content, options);
};

Logger.Log = (content: Object | string | number | Error, options?: any) => {
    apiEvent.emit('log', content, options);
};

Logger.on = <T, K = ApiMiddlewareParams>(type: IApiEventType, callback: (content: IApiEvent<T>, options?: K) => void) => {
    apiEvent.on(type, callback);
};

Logger.onError = <T, K = ApiMiddlewareParams>(callback: (content: IApiEvent<T>, options?: K) => void) => {
    apiEvent.on('error', callback);
};

export default Logger;
