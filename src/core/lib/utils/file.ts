/**
 * 文件操作工具集合
 */

import * as fs from 'fs';

/**
 * 判断文件存在
 * @param path
 * @returns
 */
export function isFile(path: string): boolean {
    const stat = getFileInfo(path);
    return !!stat && stat.isFile();
}

/**
 * 读取目录，同步
 * @param path 目录
 * @returns
 */
export function readDirSync(path: string, encoding: BufferEncoding = 'utf8'): string[] {
    return fs.readdirSync(path, encoding);
}

/**
 * 获取文件信息
 * @param path 路径
 * @returns
 */
export function getFileInfo(path: string) {
    if (!fs.existsSync(path)) {
        return null;
    }
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
