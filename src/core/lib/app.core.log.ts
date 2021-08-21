import { TimeFormat } from '@util/time';
import config from '@core/lib/app.config';
import { appendFileSync, getFilePath, readLine } from '@core/utils/file';
import { ICustomContent } from '@core/typings/app';

/**
 * 日志系统
 *
 */

export default class AppLogCore {
    /**
     * 日志文件存放地址
     */
    private logPath: string = config.get('log.path');

    /**
     * 是否开启日志系统
     */
    private logEnble: boolean = false;

    /**
     * 保存和显示对象
     */
    private logTarget: Array<'console' | 'web' | 'local'> = ['console', 'local'];

    /**
     * 初始化
     * @param enble
     * @param target
     */
    constructor() {
        this.logEnble = config.get('log.enble');
        this.logTarget = config.get('log.target') || [];
    }

    /**
     * 写入日志
     * @param log 日志内容
     * @param target 日志记录方式
     * @returns
     */
    protected w(
        log: {
            type: 'info' | 'success' | 'error' | 'warn';
            content: ICustomContent;
        },
        target: Array<'console' | 'web' | 'local'> = ['local', 'console']
    ): boolean {
        // 配置关闭则不写日志
        if (!log || !this.logEnble) return false;

        //console输出
        if (target.includes('console') && this.logTarget.includes('console')) {
            this.console(log.content, log.type);
        }

        //写入文件日志
        if (target.includes('local') && this.logTarget.includes('local')) {
            const content = {
                time: new Date().getTime(),
                ...log
            };
            const str: string = JSON.stringify(content);
            this.logToFile(str, log.type);
        }
        return true;
    }

    /**
     * 终端打印
     * @param args
     * @returns
     */
    protected console(content: any, type: string = 'info'): void {
        if (process.env.NODE_ENV === 'development') {
            const typeStr = {
                success: `\u001b[32m[Success]:\u001b[0m `,
                error: `\u001b[31m[Error]:\u001b[0m `,
                info: `\u001b[2m[Info]:\u001b[0m `
            };
            return console.log(typeStr[type] || typeStr.info, content);
        }
    }

    /**
     * 读取日志
     * @param time
     * @param format
     * @returns
     */
    protected async readLog<T>(time: Date = new Date(), type: string = 'info', format: string = 'yyyy-MM-dd.log'): Promise<T[]> {
        const fileName = getFilePath(this.logPath, type, TimeFormat(time, format));
        return readLine(fileName).then((strArr) => {
            return strArr.map((item) => {
                return JSON.parse(item);
            });
        });
    }

    /**
     * 写入文件系统
     * 默认文件名为：2021-03-07.log
     *
     * @param fileName 文件名+目录
     * @param str 追加字符串
     */
    private logToFile(str: string, type: string = 'info', format: string = 'yyyy-MM-dd.log'): void {
        const fileName = getFilePath(this.logPath, type, TimeFormat(new Date().getTime(), format));
        return appendFileSync(fileName, str + '\n');
    }
}
