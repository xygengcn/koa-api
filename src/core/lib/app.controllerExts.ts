/**
 * 拓展字段
 */
import { get, set } from 'lodash';
import { RequestExts } from 'koa';
export class AppControllerExts {
    public get(path: string): RequestExts {
        return get(this, path);
    }

    public set(path: string, exts: RequestExts) {
        return set(this, path, exts);
    }
}
