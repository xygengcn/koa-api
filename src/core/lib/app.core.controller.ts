import { set } from "lodash";
import {
    getFileName,
    getFilePath,
    isDirectory,
    isFile,
    isIndexFile,
    readDirSync,
} from "@core/utils/file";
import * as Path from "path";
import AppController from "./app.controller";

/**
 * 控制器处理基础类
 */
export class AppControllerCore {
    public instance: AppController;

    /**
     * 控制器文件夹路径
     */
    private path: string = "";

    constructor() {
        this.path = getFilePath("./controller");
        this.instance = new AppController();
        this.getAllControllers(this.path);
    }

    /**
     * 获取前缀
     * @param controller
     * @param file
     * @param filepath
     * @returns
     */
    private getPrefix(
        controller: AppController,
        file: string,
        filepath: string
    ): string {
        const prefix: string =
            (controller.opts && controller.opts.prefix) || "";
        if (!prefix) {
            if (!isIndexFile(filepath, ".js")) {
                return `/${getFileName(filepath)}`;
            } else if (isDirectory(filepath) || !isIndexFile(filepath, ".js")) {
                return `/${file}`;
            }
        }
        return prefix;
    }

    /**
     * 读取所有控制器数据
     * @param path 控制器目录
     */
    private getAllControllers(path: string): void {
        const controllerFiles = readDirSync(path);
        controllerFiles.forEach((file) => {
            const filepath = Path.join(path, file);
            if (isFile(filepath) || isDirectory(filepath)) {
                const controller: AppController = require(filepath).default;
                if (
                    !!controller &&
                    controller.isController &&
                    controller.isController()
                ) {
                    const prefix = this.getPrefix(controller, file, filepath);
                    if (!controller.opts || !controller.opts.prefix) {
                        controller.prefix(prefix);
                    }
                    set(this.instance.exts, controller.name, controller.exts);
                    this.instance.use(controller.routes());
                }
            }
        });
    }
}

export default new AppControllerCore();
