import AppLogCore, { ILogOptions } from './app.core.log';
export class AppLog extends AppLogCore {
    constructor(options?: ILogOptions) {
        super(options);
    }

    /**
     * 更新配置
     * @param options
     * @returns
     */
    public option(options: ILogOptions) {
        return this.updateOptions(options);
    }

    /**
     * 写入日志
     * @param log 日志内容
     * @returns
     */
    public w(log: DefaultContent, target?: Array<'console' | 'web' | 'local'>): boolean {
        return super.w(log, target);
    }

    /**
     * 信息日志
     * @param content
     * @returns boolean
     */
    public info(content: Object | number | string, subType?: string): boolean {
        return this.w({
            type: 'info',
            subType,
            content
        });
    }
    /**
     * log日志
     * @param content
     * @returns boolean
     */
    public log(content: Object | number | string, subType?: string): boolean {
        return this.info(content, subType);
    }
    /**
     * 错误日志
     * @param content
     * @returns boolean
     */
    public error(content: Object | number | string, subType?: string): boolean {
        return this.w({
            type: 'error',
            subType,
            content
        });
    }

    /**
     * console日志，终端日志
     * @param str
     * @param type
     * @returns
     */
    public console(content: Object | number | string, type: keyof typeof console = 'log'): void {
        return super.console(content, type);
    }

    /**
     * 读取日志
     * @param time
     * @returns
     */
    public readByDate(time?: number, filter?: { [key: string]: any }) {
        return this.readLogByDate(time, filter);
    }

    /**
     * 删除日志
     * @param time
     * @returns
     */
    public delete(time: number) {
        return this.deleteExpiringLog(time);
    }
}

const Log = new AppLog();
export default Log;
