import { IOptions } from '@/typings';
import { isFunction } from '@/utils';
import { injectable } from 'inversify';
import { KoaBodyMiddlewareOptions } from 'koa-body';

/**
 * 配置中心
 */
@injectable()
export default class ApiOptions implements IOptions {
    public baseUrl?: string | undefined;

    public koaBody?: Partial<KoaBodyMiddlewareOptions> | undefined;

    public port?: number | undefined;

    // 构造函数
    constructor() {}

    /**
     * 合并
     */
    public merge(options: IOptions) {
        Object.entries(options).forEach(([key, value]) => {
            if (!isFunction(value)) {
                Reflect.set(this, key, value);
            }
        });
    }
}
