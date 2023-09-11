import isDirectory from 'is-directory';
import path from 'path';
import readdirSync from 'klaw-sync';
import { CONTROLLER_FILE_NAME_REG } from '@/utils/reg';
import fs from 'fs';
import container from '@/container';
import { API_INVERSIFY_KEY, API_METADATA_KEY } from '@/keys/inversify';
import { isString } from '.';

/**
 * 去掉末尾的斜杠
 * @param str
 * @returns
 */
export function removeTrailingSlash(str: string) {
    if (str === '/') {
        return str;
    }
    return str.replace('/\\/ig', '/').replace(/\/$/, '');
}

/**
 * 是不是文件夹
 * @param rootDir
 * @returns
 */
export function isDir(rootDir: unknown): boolean {
    if (rootDir && isString(rootDir)) {
        return isDirectory.sync(rootDir);
    }

    return false;
}

/**
 * 把控制器文件路径转换成控制器路由
 */
export function convertControllerFileToControllerPath(rootDir: string): { file: string; path: string; prefix: string }[] {
    if (isDir(rootDir)) {
        // 读取目录
        const dirFiles = readdirSync(rootDir, {
            traverseAll: true,
            nodir: true,
            filter: (item) => {
                const basename = path.basename(item.path);
                return CONTROLLER_FILE_NAME_REG.test(basename);
            }
        });
        // 空目录
        if (!dirFiles.length) return [];
        return dirFiles.map((item) => {
            const dirPath = path.dirname(item.path);
            const fileName = path.basename(item.path);
            const relativePath = path.relative(rootDir, dirPath);
            // 取文件正则
            const match = fileName.match(CONTROLLER_FILE_NAME_REG);
            let controllerName = match ? match[1] : '/';
            if (controllerName === 'index') {
                controllerName = '/';
            }
            const controllerPath = removeTrailingSlash(path.join('/', relativePath)).toLocaleLowerCase();
            return {
                file: item.path,
                path: controllerPath,
                prefix: controllerName.toLocaleLowerCase()
            };
        });
    }

    return [];
}

/**
 * 文件
 * @param path
 * @returns
 */
export function isFileSync(path: string) {
    try {
        const stat = fs.statSync(path);
        return stat.isFile();
    } catch {
        // 如果文件不存在或者无法访问，则视为非正常文件
        return false;
    }
}

/**
 * 加载控制器
 */
export function autoBindLoadControllers(dirs: { file: string; path: string; prefix: string }[]) {
    if (!dirs.length) return;
    dirs.forEach((controllerModule) => {
        if (isFileSync(controllerModule.file)) {
            try {
                const controller = require(controllerModule.file)?.default;
                const isBound = controller && container.isBoundNamed(API_INVERSIFY_KEY.CONTROLLER_CLASS_KEY, controller.name);
                if (isBound) {
                    // 绑定文件路径
                    Reflect.defineMetadata(API_METADATA_KEY.CONTROLLER_FILE_PATH, controllerModule, controller.prototype);
                }
            } catch (error) {
                throw error;
            }
        }
        return;
    });
}
