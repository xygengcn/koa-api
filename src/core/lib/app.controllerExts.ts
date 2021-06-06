/**
 * 拓展字段
 */

import { IAppControllerExts, IAppControllerExtsOptions, IAppControllerCoreRequestOption } from './../type/controller';
import { get, set } from 'lodash';
export class AppControllerExts implements IAppControllerExts {
    public get(path: string): IAppControllerCoreRequestOption {
        return get(this, path);
    }

    public set(path: string, exts: IAppControllerExtsOptions) {
        return set(this, path, exts);
    }
}
