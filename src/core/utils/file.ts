/**
 * 文件操作工具集合
 */

import * as fs from 'fs';
import { MakeDirectoryOptions } from 'fs';
import * as Path from 'path';
import readline from 'readline';

/**
 * 返回一行一行读取数组
 * @returns
 */

export function readLine(path: string): Promise<string[]> {
    if (!isFile(path)) return Promise.resolve([]);
    return new Promise((resolve) => {
        let arr: Array<string> = [];
        var readObj = readline.createInterface({
            input: fs.createReadStream(path),
        });
        // 一行一行地读取文件
        readObj.on('line', function (line) {
            arr.push(line);
        });
        // 读取完成后,将arr作为参数传给回调函数
        readObj.on('close', function () {
            resolve(arr);
        });
    });
}

/**
 * 返回packge.json文件
 * @returns
 */
export function getPackage(): any {
    return readJson(getFilePath('../package.json'));
}

/**
 * 返回文件夹目录
 * @param path 在主目录的位置
 * @returns
 */
export function getFilePath(path: string): string {
    return Path.join(getRootPath(), path);
}
/**
 * 获取主目录地址
 */
export function getRootPath(): string {
    return Path.join(__dirname, '../../');
}

/**
 * 判断文件存在
 * @param path
 * @returns
 */
export function isFile(path: string) {
    const stat = getFileInfo(path);
    return stat && stat.isFile();
}
/**
 * 判断是不是index文件
 * @param ext 后缀
 */
export function isIndexFile(file: string, ext: string = '.json') {
    return getFileName(file, ext).toLocaleLowerCase() === 'index';
}

/**
 * 判断是不是json文件
 * @param file
 * @returns
 */
export function isJsonFile(file: string): boolean {
    return Path.extname(file) === '.json';
}
/**
 * 写入json，同步
 * @param params 对象
 * @param path 路径
 * @returns
 */
export function writeJson(path: string, params: Object): void {
    const data: string = (params && JSON.stringify(params, null, '\t')) || '';
    return writeFileSync(path, data);
}

/**
 * 读取json
 * @param path
 * @returns
 */
export function readJson(path: string): Object {
    const data = readFileSync(path) as any;
    try {
        if (data) {
            return JSON.parse(data);
        }
        return {};
    } catch (error) {
        return {};
    }
}

/**
 * 获取文件名
 * @param filePath
 * @param ext 去除后缀
 * @returns
 */
export function getFileName(filePath: string, ext?: string): string {
    return Path.basename(filePath, ext);
}

/**
 * 读取目录，同步
 * @param path 目录
 * @returns
 */
export function readDirSync(path: string): string[] {
    return fs.readdirSync(path);
}

/**
 * 追加文本
 * @param path 目录
 * @param data
 * @returns
 */
export function appendFileSync(path: string, data: string) {
    mkdir(Path.dirname(path));
    return fs.appendFileSync(path, data);
}

/**
 * 写入文件，同步
 * @param path 目录
 * @param data 数据
 * @returns
 */
export function writeFileSync(path: string, data: string): void {
    mkdir(Path.dirname(path));
    return fs.writeFileSync(path, data);
}

/**
 * 读取文件
 * @param path 路径
 * @returns
 */
export function readFileSync(path: string): Buffer {
    return fs.readFileSync(path);
}

/**
 * 获取文件信息
 * @param path 路径
 * @returns
 */
export function getFileInfo(path: string) {
    let fileInfo: fs.Stats;
    try {
        fileInfo = fs.lstatSync(path);
    } catch (error) {
        return null;
    }
    return fileInfo;
}

/**
 * 是否是文件夹
 * @param path 路径
 * @returns
 */
export function isDirectory(path: string): boolean {
    const stat = getFileInfo(path);
    return !!stat && stat.isDirectory();
}

/**
 * 创建多级目录，默认递归
 * @param path 路径
 * @param option 属性
 * @returns
 */
export function mkdir(path: string, option: MakeDirectoryOptions & { recursive: true } = { recursive: true }) {
    return fs.mkdirSync(path, option);
}

/**
 * 清空文件夹
 * @param dir
 * @returns
 */
export function rmdir(path: string): boolean {
    if (!path || !fs.existsSync(path)) return false;
    // 读取目录中文件夹
    const files = fs.readdirSync(path);
    files.forEach((file) => {
        const filePath = Path.resolve(path, file);
        const stat = fs.lstatSync(filePath);
        // 如果是directory, 就递归
        if (stat.isDirectory()) {
            rmdir(filePath);
            return;
        }
        // 如果是文件 就删除
        if (stat.isFile()) {
            fs.unlinkSync(filePath);
        }
    });
    // 删除空目录
    fs.rmdirSync(path);
    return true;
}
