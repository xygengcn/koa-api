import { AppEventCore } from '@core/lib/app.eventCore';
import {
    IAppControllerCoreRequestOption,
    IAppControllerMethod,
    IAppControllerOptions,
    IAppControllerRequest,
    IAppControllerResponseOption,
} from '@core/type/controller';
import KoaRouter from 'koa-router';
import { ILog, ILogType } from './log';
declare module 'koa' {
    interface DefaultState {
        stateProperty: boolean;
    }

    interface DefaultContext extends ParameterizedContext<any, KoaRouter.IRouterParamContext<any, {}>> {
        success: (
            data: string | number | object | undefined,
            msg?: string | object | undefined,
            option?: IAppControllerResponseOption
        ) => any;
        fail: (error: string | number | object | null, code: number, option?: IAppControllerResponseOption) => any;
        exts: () => IAppControllerCoreRequestOption;
        $event: AppEventCore;
    }
}

declare namespace App {
    interface AppRequest {
        Request: (method: IAppControllerRequest, option?: IAppControllerOptions) => IAppControllerMethod;
    }
    interface AppLog {
        w(log: ILog): boolean;
        info(content: ILog['content']): boolean;
        success(content: ILog['content']): boolean;
        error(content: ILog['content']): boolean;
        console(str: ILog['content'], type?: ILogType): void;
        read(time?: Date): Promise<ILog[]>;
    }
}

export = App;
