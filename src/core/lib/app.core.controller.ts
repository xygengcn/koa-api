import { set } from 'lodash';
import { getFilePath, isDirectory, isFile, isIndexFile, readDirSync, getFileName } from '@core/utils/file';
import * as Path from 'path';
import AppController from './app.controller';

/**
 * 控制器处理基础类
 */
export class AppControllerCore {
    public instance: AppController;

    /**
     * 控制器文件夹路径
     */
    private path: string = '';

    constructor() {
        this.path = getFilePath('./controller');
        this.instance = new AppController();
        this.getAllControllers(this.path);
    }

    /**
     * 获取前缀
     * @param file 文件名
     * @returns
     */
    private getPrefix(fileName: string): string {
        if (isIndexFile(fileName, '.js')) {
            return '/';
        }
        return getFileName(fileName, '.js');
    }

    /**
     * 获取控制器文件
     * @param file 文件名
     * @param filepath 完整的文件目录
     * @returns
     */
    private getController(file: string, filepath: string): AppController | false {
        const controller: AppController = require(filepath).default;
        if (!!controller && controller.isController && controller.isController()) {
            if (!(controller.opts && controller.opts.prefix)) {
                const prefix = this.getPrefix(file);
                controller.setPrefix(prefix);
            }
            set(this.instance.exts, controller.name, controller.exts);
            return controller;
        }
        return false;
    }

    /**
     * 读取所有控制器数据
     * @param path 控制器目录
     */
    private getAllControllers(path: string, dir: string = '/'): void {
        const controllerFiles = readDirSync(path);
        const appController = new AppController('AppController', dir);
        controllerFiles.forEach((file) => {
            const filepath = Path.join(path, file);
            if (isFile(filepath)) {
                const controller = this.getController(file, filepath);
                controller && appController.use(controller.routes());
            } else if (isDirectory(filepath)) {
                this.getAllControllers(filepath, file);
            }
        });
        this.instance.use(appController.routes());
    }
}

export default new AppControllerCore();
