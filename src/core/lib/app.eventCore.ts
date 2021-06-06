/**
 * 事件监听
 */

import { ILog } from '@core/type/log';
import { EventEmitter } from 'events';
import { Context } from 'koa';
export class AppEventCore {
    private event: EventEmitter;

    constructor() {
        this.event = new EventEmitter();
    }

    /**
     * 监听报错
     * @param callback
     */
    public onError(callback: Function) {
        if (this.event.listeners('http-error').length < 10) {
            this.event.on('http-error', (ctx: Context, log: ILog) => {
                callback(ctx, log);
            });
        }
    }

    /**
     * 触发报错
     */
    public emitError(ctx: Context, log: ILog) {
        this.event.emit('http-error', ctx, log);
    }
}

export default new AppEventCore();
