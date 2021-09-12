import { get } from 'lodash';
export default class ControllerMethodDoc {
    /**
     * 接口对象
     */
    private methodController: ControllerMethod;

    constructor(methodController: ControllerMethod) {
        this.methodController = methodController;
    }

    /**
     * 接口标题
     */
    private get title(): { h3: string } {
        return {
            h3: this.methodController.name || this.methodController.routeName
        };
    }

    /**
     * 接口描述
     */
    private get description(): { blockquote: string } {
        return {
            blockquote: this.methodController.description || ''
        };
    }
    /**
     * 接口url
     */
    private get url() {
        return [{ h4: '请求URL' }, { blockquote: this.methodController.url }];
    }

    /**
     * 请求方法
     */
    private get method() {
        return [{ h4: '请求方法' }, { blockquote: this.methodController.method }];
    }

    /**
     * 跨域范围
     */
    private get origins() {
        return [{ h4: '跨域范围' }, { blockquote: this.methodController?.origin?.join('、') || '默认范围' }];
    }

    /**
     * 请求头部
     */
    private get headers() {
        let rows: Array<any[]> = [['', '', '', '', '']];
        if (this.methodController.headers) {
            const rowKeys = Object.keys(this.methodController.headers);
            rows = rowKeys.map((key) => {
                const headerOption = get(this.methodController.headers, key);
                const name: string = key;
                const type: string = this.getType(headerOption?.type);
                const defaultValue: string = String(headerOption?.defaultValue || '');
                const require: string = String(!!headerOption?.require || false);
                const description: string = headerOption?.description || '';
                return [name, type, require, defaultValue, description];
            });
        }
        return [
            { h4: 'Headers参数' },
            {
                table: {
                    headers: ['参数名', '参数类型', '是否必须', '默认值', '参数描述'],
                    rows
                }
            }
        ];
    }
    /**
     * url参数
     */
    private get urlQuery() {
        let rows: Array<any[]> = [['', '', '', '', '']];
        if (this.methodController.query) {
            const rowKeys = Object.keys(this.methodController.query);
            rows = rowKeys.map((key) => {
                const headerOption = get(this.methodController.query, key);
                const name: string = key;
                const type: string = this.getType(headerOption?.type);
                const defaultValue: string = String(headerOption?.defaultValue || '');
                const require: string = String(!!headerOption?.require || false);
                const description: string = headerOption?.description || '';
                return [name, type, require, defaultValue, description];
            });
        }
        return [
            { h4: 'URL参数' },
            {
                table: {
                    headers: ['参数名', '参数类型', '是否必须', '默认值', '参数描述'],
                    rows
                }
            }
        ];
    }
    /**
     * Content参数
     */
    private get content() {
        if (!(this.methodController.method === 'POST' || this.methodController.method === 'ALL')) {
            return [];
        }
        let rows: Array<any[]> = [['', '', '', '', '']];
        if (this.methodController.content) {
            const rowKeys = Object.keys(this.methodController.content);
            rows = rowKeys.map((key) => {
                const headerOption = get(this.methodController.content, key);
                const name: string = key;
                const type: string = this.getType(headerOption?.type);
                const defaultValue: string = String(headerOption?.defaultValue || '');
                const require: string = String(!!headerOption?.require || false);
                const description: string = headerOption?.description || '';
                return [name, type, require, defaultValue, description];
            });
        }
        return [
            { h4: '请求体content参数' },
            {
                table: {
                    headers: ['参数名', '参数类型', '是否必须', '默认值', '参数描述'],
                    rows
                }
            }
        ];
    }
    /**
     * exts参数
     */
    private get exts() {
        if (!(this.methodController.method === 'POST' || this.methodController.method === 'ALL')) {
            return [];
        }
        let rows: Array<any[]> = [['', '', '', '', '']];
        if (this.methodController.exts) {
            const rowKeys = Object.keys(this.methodController.exts);
            rows = rowKeys.map((key) => {
                const headerOption = get(this.methodController.exts, key);
                const name: string = key;
                const type: string = this.getType(headerOption?.type);
                const defaultValue: string = String(headerOption?.defaultValue || '');
                const require: string = String(!!headerOption?.require || false);
                const description: string = headerOption?.description || '';
                return [name, type, require, defaultValue, description];
            });
        }
        return [
            { h4: '请求体exts参数' },
            {
                table: {
                    headers: ['参数名', '参数类型', '是否必须', '默认值', '参数描述'],
                    rows
                }
            }
        ];
    }
    /**
     * 返回数据
     */
    private get returns() {
        let rows: Array<any[]> = [['', '', '', '', '']];
        if (this.methodController.returns) {
            const rowKeys = Object.keys(this.methodController.returns);
            rows = rowKeys.map((key) => {
                const headerOption = get(this.methodController.returns, key);
                const name: string = key;
                const type: string = this.getType(headerOption?.type);
                const defaultValue: string = String(headerOption?.defaultValue || '');
                const require: string = String(!!headerOption?.require || false);
                const description: string = headerOption?.description || '';
                return [name, type, require, defaultValue, description];
            });
        }
        return [
            { h4: '返回类型' },
            {
                table: {
                    headers: ['参数名', '参数类型', '是否必须', '默认值', '参数描述'],
                    rows
                }
            }
        ];
    }

    /**
     * 获取类型
     */
    private getType(value: DefaultMethodValue['type'] | undefined): string {
        if (value) {
            if (value === Object) {
                return 'Object';
            }
            if (value === String) {
                return 'String';
            }
            if (value === Number) {
                return 'Number';
            }
            if (value === Boolean) {
                return 'Boolean';
            }
            if (value === Array) {
                return 'Array';
            }
            return String(value);
        }
        return '';
    }
    /**
     * 调出每一个接口的文档
     * @returns
     */
    public toJSON(): Array<Object> {
        return [this.title, this.description, ...this.url, ...this.method, ...this.origins, ...this.headers, ...this.urlQuery, ...this.content, ...this.exts, ...this.returns];
    }
}
