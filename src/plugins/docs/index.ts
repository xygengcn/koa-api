import { ControllerDoc } from '@plugin/docs/contoller.doc';
import AppControllerClass from '@lib/class/app.controller.class';
import { writeFileSync } from '@util/file';
import json2md from 'json2md';
import path from 'path';
export class AppDocs {
    // 路由集合
    private controllers: { [key: string]: AppControllerClass } = {};

    // 导航栏
    private navbarController: AppControllerClass[] = [];

    constructor(controllers: { [key: string]: AppControllerClass }) {
        this.controllers = controllers;
    }

    /**
     * 获取所有接口的文档
     * @returns
     */
    private getControllersDoc(): Object[] {
        const classNames = Object.keys(this.controllers);
        return classNames.reduce((arr: Object[], className: string) => {
            const controller = this.controllers[className];
            // 置顶的导航栏
            if (controller.isTop) {
                this.navbarController.push(controller);
            }
            const controllerDoc = new ControllerDoc(controller);
            const mdList = controllerDoc.toJSON() || [];
            arr = arr.concat(...mdList);
            return arr;
        }, []);
    }

    /**
     * 转换md
     * @returns
     */
    private contentToMarkdown(): string {
        return json2md(this.getControllersDoc());
    }

    /**
     * 导航栏生成md
     * @returns
     */
    private navbarToMarkDown(): string {
        if (this.navbarController.length) {
            const list = this.navbarController.map((item) => {
                const link = json2md({ link: { title: item.name || item.className, source: `#${item.name || item.className}` } });
                return {
                    blockquote: link
                };
            });
            return json2md(...list);
        }
        return '';
    }

    /**
     * 主要内容文件
     * @param filename
     */
    private writeContentMd(filepath: string) {
        const filePath = path.join(filepath, 'README.md');
        writeFileSync(filePath, this.contentToMarkdown());
    }

    /**
     * 生成导航栏
     * @param filepath
     */
    private writeNavbar(filepath: string) {
        const filePath = path.join(filepath, '_navbar.md');
        writeFileSync(filePath, this.navbarToMarkDown());
    }

    /**
     * 生成文档
     * @param path
     */
    public write(path: string) {
        this.writeContentMd(path);
        this.writeNavbar(path);
    }
}
