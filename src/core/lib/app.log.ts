import { ILogTarget, IResponse, IResponseContent } from '@core/typings/app';
import { isString } from 'lodash';
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
    public w(log: IResponse, target?: ILogTarget[]): boolean {
        return super.w(log, target);
    }

    /**
     * 信息日志
     * @param content
     * @returns boolean
     */
    public info(content: IResponseContent | string, type: IResponseContent['type'] = 'log'): boolean {
        return this.w({
            type: 'info',
            content: isString(content) ? { type, content } : content,
        });
    }
    /**
     * 成功日志
     * @param content
     * @returns boolean
     */
    public success(content: IResponseContent | string, type: IResponseContent['type'] = 'log'): boolean {
        return this.w({
            type: 'success',
            content: isString(content) ? { type, content } : content,
        });
    }
    /**
     * 错误日志
     * @param content
     * @returns boolean
     */
    public error(content: IResponseContent | string, type: IResponseContent['type'] = 'log'): boolean {
        return this.w({
            type: 'error',
            content: isString(content) ? { type, content } : content,
        });
    }

    /**
     * 数据库日志
     * @param sql
     * @param timing
     * @returns
     */
    public sql(sql: string, timing?: number | undefined) {
        return this.w({
            type: 'info',
            content: {
                type: 'sql',
                content: {
                    sql,
                    timing,
                },
            },
        });
    }

    /**
     * console日志，终端日志
     * @param str
     * @param type
     * @returns
     */
    public console(content: IResponseContent | string, type: IResponse['type'] = 'info'): void {
        return super.console(isString(content) ? { type: 'log', content } : content, type);
    }

    /**
     * 读取日志
     * @param time
     * @returns
     */
    public read(time?: Date) {
        return this.readLog(time);
    }
}

export default new AppLog();
