import { isDirectory } from '@util/file';
import { get, isEmpty, isArray } from 'lodash';
import readLine from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { TimeFormat } from '@util/time';
import config from '@lib/config';
import { FileUtils, TimeUtils } from 'app';
import { join } from 'path';

/**
 * 日志系统
 *
 */

export interface ILogOptions {
    path: string; // 日志文件夹
    target?: Array<'console' | 'web' | 'local'>; // 日志对象
    format: string; // 日志文件名格式
    timer?: number; // 定时器时间
}

export default class AppLogCore {
    private logTimer: NodeJS.Timeout | null = null;
    /**
     * 日志缓存
     */
    private logCaches: { [subType: string]: string[] } = {};
    /**
     * 配置
     */
    private options: ILogOptions = {
        path: './logs',
        target: ['console', 'local'],
        timer: 1000,
        format: 'yyyy-MM-dd.log'
    };

    /**
     * 初始化
     * @param enble
     * @param target
     */
    constructor(options?: ILogOptions) {
        if (options) {
            this.options = {
                ...this.options,
                ...options
            };
        }
        // 定时器模式开启定时器
        if (this.options.timer) {
            this.startLogTimer();
        }
    }

    /**
     * 更新配置
     */
    protected updateOptions(options: ILogOptions) {
        if (options) {
            this.options = {
                ...this.options,
                ...options
            };
        }
    }

    /**
     * 写入日志
     * @param log 日志内容
     * @param target 日志记录方式
     * @returns
     */
    protected w(log: DefaultContent, target: Array<'console' | 'web' | 'local'> = ['local', 'console']): boolean {
        // 配置关闭则不写日志
        if (!log || !config.get('log.enble')) return false;

        //console输出
        if (target.includes('console') && this.options.target?.includes('console')) {
            this.console(log.content, log.type);
        }

        //写入文件日志
        if (target.includes('local') && this.options.target?.includes('local')) {
            const content = {
                time: new Date().getTime(),
                ...log
            };
            // 序列化写入文件
            const str: string = JSON.stringify(content);
            // 如果有定时器
            if (this.options.timer) {
                // 开始分类型
                if (log.subType) {
                    if (!this.logCaches[log.subType]) {
                        this.logCaches[log.subType] = [];
                    }
                    this.logCaches[log.subType].push(str);
                } else {
                    this.logCaches['log'].push(str);
                }
            } else {
                this.logToFile([str], log.subType);
            }
        }
        return true;
    }

    /**
     * 终端打印
     * @param args
     * @returns
     */
    protected console(content: any, type: keyof typeof console = 'info'): void {
        if (process.env.NODE_ENV === 'development') {
            const typeStr: {
                [key: string]: string;
            } = {
                log: `\u001b[32m[Success]:\u001b[0m `,
                error: `\u001b[31m[Error]:\u001b[0m `,
                info: `\u001b[2m[Info]:\u001b[0m `
            };
            return console.log(typeStr[type] || typeStr.log, content);
        }
    }

    /**
     * 读取某一天的日志
     * @param time
     * @param format
     * @returns
     */
    protected async readLogByDate<T>(time: number = new Date().getTime(), filters?: { [key: string]: any }): Promise<T[]> {
        const subType = filters?.subType || 'log';
        const fileName = this.getFilePath(subType, time);
        if (!TimeUtils.TimeFormatValid(fileName, this.options.format)) return Promise.resolve([]);
        if (!FileUtils.isFile(fileName)) return Promise.resolve([]);
        return FileUtils.readLine(fileName).then((logs) => {
            const logsArr = logs.map((log) => {
                return JSON.parse(log) as T;
            });
            if (!isEmpty(filters) && filters) {
                // 过滤符合的对象
                return logsArr.filter((log) => {
                    // 遍历条件，每个都符合则准确
                    return Object.entries(filters).every(([key, value]) => {
                        // 判断值是否相等
                        return get(log, key) === value;
                    });
                });
            } else {
                return logsArr;
            }
        });
    }

    /**
     * 采集一天内某一个时间段的日志
     * @param start
     * @param end
     * @returns
     */
    protected async readLogByTime<T>(start: number, end: number, filters?: { [key: string]: any }): Promise<T[]> {
        const subType = filters?.subType || 'log';
        const fileName = this.getFilePath(subType, start);
        if (!TimeUtils.TimeFormatValid(fileName, this.options.format)) return Promise.resolve([]);
        if (!FileUtils.isFile(fileName)) return Promise.resolve([]);
        return new Promise((resolve) => {
            const arr: Array<T> = [];
            const readObj = readLine.createInterface({
                input: createReadStream(fileName),
                terminal: true
            });
            readObj.on('line', function (line) {
                const log = JSON.parse(line);
                // 取时间段的数据
                if (log.time >= start && log.time <= end) {
                    // 判断过滤条件
                    if (filters && !isEmpty(filters)) {
                        const isFilter = Object.entries(filters).every(([key, value]) => {
                            // 判断值是否相等
                            return get(log, key) === value;
                        });
                        if (isFilter) {
                            arr.push(log);
                        }
                    } else {
                        arr.push(log);
                    }
                }
                // 超过则停止
                if (log.time > end) {
                    readObj.close();
                }
            });
            readObj.on('close', function () {
                resolve(arr);
            });
        });
    }

    /**
     * 获取文件名字
     * @returns
     */
    private getFilePath(subType: string = 'log', time: number = new Date().getTime()): string {
        return join(this.options.path, subType, TimeFormat(new Date(time), this.options.format));
    }

    /**
     * 写入文件系统
     * 默认文件名为：2021-03-07.log
     *
     * @param fileName 文件名+目录
     * @param str 追加字符串
     */
    private logToFile(strs: string[], subType: string = 'log'): void {
        const filePath = join(this.options.path, subType);
        // 新建文件夹
        if (!FileUtils.exists(filePath)) {
            FileUtils.mkdir(filePath);
        }
        const logStream = createWriteStream(this.getFilePath(subType), { flags: 'a', encoding: 'utf8' });
        const logger = new console.Console(logStream);
        strs.forEach((item) => {
            logger.log(item);
        });
        logStream.close();
    }

    /**
     * 删除过期文件
     * @param expireTime 过期时间
     */
    protected deleteExpiringLog(expiration: number) {
        const files = FileUtils.readDirSync(this.options.path, 'utf8');
        const expireTime = new Date().getTime() - expiration;
        files.forEach((dir) => {
            // 遍历文件夹
            if (isDirectory(dir)) {
                // 遍历文件夹的文件
                const dirFiles = FileUtils.readDirSync(join(this.options.path, dir), 'utf8');
                dirFiles.forEach((file) => {
                    const fileTime = FileUtils.getFileName(file, '.log');
                    if (TimeUtils.TimeFormatValid(fileTime, this.options.format) && new Date(fileTime).getTime() < expireTime) {
                        FileUtils.remove(join(this.options.path, dir, file));
                    }
                });
            }
        });
    }

    /**
     * 定时器
     */
    private startLogTimer(timer?: number) {
        this.stopLogTimer();
        if (timer || this.options.timer) {
            this.logTimer = setInterval(() => {
                if (!isEmpty(this.logCaches)) {
                    Object.entries(this.logCaches).forEach(([key, value]) => {
                        if (isArray(value) && value.length) {
                            const arr = this.logCaches[key].splice(0, 100);
                            this.logToFile(arr, key);
                        }
                    });
                }
            }, timer || this.options.timer);
        }
    }

    /**
     * 停止计时器
     */
    private stopLogTimer() {
        if (this.logTimer) {
            clearInterval(this.logTimer);
            this.logTimer = null;
        }
    }
}
