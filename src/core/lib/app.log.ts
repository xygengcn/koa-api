import { ICustomContent } from '@core/typings/app';
import { isString, isObject } from 'lodash';
import AppLogCore from './app.core.log';
export class AppLog extends AppLogCore {
    constructor() {
        super();
    }

    /**
     * 写入日志
     * @param log 日志内容
     * @returns
     */
    public w(
        log: {
            type: 'info' | 'success' | 'error' | 'warn';
            content: ICustomContent;
        },
        target?: Array<'console' | 'web' | 'local'>
    ): boolean {
        return super.w(log, target);
    }

    /**
     * 信息日志
     * @param content
     * @returns boolean
     */
    public info(content: ICustomContent | number | string | string, type: string = 'log'): boolean {
        return this.w({
            type: 'info',
            content: isObject(content) ? content : { type, content }
        });
    }
    /**
     * 成功日志
     * @param content
     * @returns boolean
     */
    public success(content: ICustomContent | number | string | string, type: string = 'log'): boolean {
        return this.w({
            type: 'success',
            content: isObject(content) ? content : { type, content }
        });
    }
    /**
     * 错误日志
     * @param content
     * @returns boolean
     */
    public error(content: ICustomContent | number | string | string, type: string = 'log'): boolean {
        return this.w({
            type: 'error',
            content: isObject(content) ? content : { type, content }
        });
    }

    /**
     * console日志，终端日志
     * @param str
     * @param type
     * @returns
     */
    public console(content: object | number | string | string, type: string = 'log'): void {
        return super.console(isString(content) ? { type: 'log', content } : content, type);
    }

    /**
     * 读取日志
     * @param time
     * @returns
     */
    public read(time?: Date, type?: string) {
        return this.readLog(time);
    }
}

export default new AppLog();
