/**
 * 控制器整理
 */

import { isDirectory, isFile, readDirSync } from './file';
import path from 'path';
import { IControllerPathTransformApiRoutes } from '@/core/typings';

export const Index_Controller_File_Name_Reg = /^index\.controller\.[t|j]s$/i;

export const Controller_File_Name_Reg = /([\d\w]+)(\.controller\.[t|j]s)$/i;

export const Controller_File_Path_Reg = /(.+)(\.controller\.[t|j]s)$/i;

/**
 * 数据转换
 * @param path
 * @returns
 */
export function controllerPathTransformApiRoutes(absolutePath: string, relativePath: string = '/'): IControllerPathTransformApiRoutes[] {
    // 判断为空
    if (!absolutePath) return [];

    // 判断是不是文件夹
    if (!isDirectory(absolutePath)) return [];

    // 读取文件下的所有文件和文件夹
    const controllerFiles = readDirSync(absolutePath);

    // 空目录
    if (controllerFiles.length === 0) return [];

    // 该文件夹下主路由
    let parent: IControllerPathTransformApiRoutes[] = [];

    controllerFiles.forEach((file) => {
        // 子文件绝对路径
        const childAbsolutePath = path.join(absolutePath, file);
        // 相对路径
        const childRelativePath = path.join(relativePath, file);
        // 单文件
        if (isFile(childAbsolutePath) && Controller_File_Name_Reg.test(file)) {
            parent.push({
                name: file,
                type: 'file',
                absolutePath: childAbsolutePath,
                relativePath: childRelativePath,
                controller: require(childAbsolutePath),
                children: []
            });
        } else if (isDirectory(childAbsolutePath)) {
            parent.push({
                name: file,
                type: 'dir',
                absolutePath: childAbsolutePath,
                relativePath: childRelativePath,
                controller: null,
                children: controllerPathTransformApiRoutes(childAbsolutePath, childRelativePath)
            });
        }
    });
    return parent;
}

/**
 * 控制器生成字符串
 * @param file
 * @param type
 * @param absolutePath
 * @param relativePath
 * @param controller
 * @param children
 * @returns
 */
function controllerFileString(file: string, type: string, absolutePath: string, relativePath: string, controller: string | null, children: string) {
    return `{ name:'${file}',type:'${type}',absolutePath:'${absolutePath}',relativePath:'${relativePath}',controller:${controller},children:${children}}`;
}

/**
 * ts 换成js
 * @param str
 * @returns
 */
// function tsFileTransformJs(str: string): string {
//     return str.replaceAll(/(.*)\.ts$/gi, '$1');
// }

/**
 * 引入文件
 * @param name
 * @param absolutePath
 * @returns
 */
function importFileString(name: string, absolutePath: string): string {
    return `const ${name} = require('${absolutePath}')`;
}

/**
 * 生产引入名字
 * @param relativePath
 * @param file
 * @returns
 */
function importName(childRelativePath: string): string {
    const name = childRelativePath.replaceAll(/[\.|\/-]/gi, '_');
    return name.toUpperCase();
}

function controllerPathTransformApiRoutesJsString(absolutePath: string, relativePath: string = '/'): { headers: string[]; content: string } {
    const headers: string[] = [];
    let content: string = '';
    // 判断为空
    if (!absolutePath) return { headers, content: `[${content}]` };

    // 判断是不是文件夹
    if (!isDirectory(absolutePath)) return { headers, content: `[${content}]` };

    // 读取文件下的所有文件和文件夹
    const controllerFiles = readDirSync(absolutePath);

    // 空目录
    if (controllerFiles.length === 0) return { headers, content: `[${content}]` };

    controllerFiles.forEach((file) => {
        // 子文件绝对路径
        const childAbsolutePath = path.join(absolutePath, file);
        // 相对路径
        const childRelativePath = path.join(relativePath, file);
        // 单文件
        if (isFile(childAbsolutePath) && Controller_File_Name_Reg.test(file)) {
            headers.push(importFileString(importName(childRelativePath), childAbsolutePath));
            content += controllerFileString(file, 'file', childAbsolutePath, childRelativePath, importName(childRelativePath), '[]') + ',';
        } else if (isDirectory(childAbsolutePath)) {
            const children = controllerPathTransformApiRoutesJsString(childAbsolutePath, childRelativePath);
            headers.push(...children.headers);
            content += controllerFileString(file, 'dir', childAbsolutePath, childRelativePath, null, children.content) + ',';
        }
    });
    return { headers, content: `[${content}]` };
}

/**
 * 动态生成js文件
 * @param path
 */
export function transformController(path: string): string {
    const transform = controllerPathTransformApiRoutesJsString(path);
    return `
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ${transform.headers.join('\n')}
    exports.default = ${transform.content};
    `;
}
