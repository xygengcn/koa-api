import ControllerMethodDoc from './method.doc';
import AppControllerClass from '@lib/class/app.controller.class';
export class ControllerDoc {
    /**
     * 接口对象
     */
    private controller: AppControllerClass;

    constructor(controller: AppControllerClass) {
        this.controller = controller;
    }

    /**
     * 接口标题
     */
    private get title(): { h2: string } {
        return {
            h2: this.controller.name || this.controller.className
        };
    }

    /**
     * 接口描述
     */
    private get description(): { blockquote: string } {
        return {
            blockquote: this.controller.description || ''
        };
    }

    /**
     * 具体接口文档
     */
    private get childDoc() {
        const methodKeys = Object.keys(this.controller.controllers);
        let childDocs: Array<Object> = [];
        methodKeys.forEach((key) => {
            const methodController = this.controller.controllers[key];
            const methodControllerDoc = new ControllerMethodDoc(methodController);
            childDocs = childDocs.concat(...methodControllerDoc.toJSON());
        });
        return childDocs;
    }

    /**
     * 调出每一个接口的文档
     * @returns
     */
    public toJSON(): Array<Object> {
        return [this.title, this.description, ...this.childDoc];
    }
}
