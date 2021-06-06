import App from '@core/type';
import { ILog, ILogTarget, ILogType } from '@core/type/log';
import AppLogCore from './app.logCore';
export class AppLog extends AppLogCore implements App.AppLog {
    constructor() {
        super();
    }

    /**
     * 写入日志
     * @param log 日志内容
     * @returns
     */
    public w(log: ILog, target?: ILogTarget[]): boolean {
        return super.w(log, target);
    }

    /**
     * 信息日志
     * @param content
     * @returns boolean
     */
    public info(content: ILog['content']): boolean {
        return this.w({
            type: ILogType.info,
            content,
        });
    }
    /**
     * 成功日志
     * @param content
     * @returns boolean
     */
    public success(content: ILog['content']): boolean {
        return this.w({
            type: ILogType.success,
            content,
        });
    }
    /**
     * 错误日志
     * @param content
     * @returns boolean
     */
    public error(content: ILog['content']): boolean {
        return this.w({
            type: ILogType.error,
            content,
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
            type: ILogType.info,
            content: {
                subType: 'sql',
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
    public console(str: ILog['content'], type: ILogType = ILogType.info): void {
        return super.console(str, type);
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
