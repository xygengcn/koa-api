import { AppEventCore, ILogTarget, ResponseType } from "./app";
declare module "koa" {
    interface ResponseOptions {
        type?: ResponseType;
        successCode?: number;
        failCode?: number;
        successMsg?: string;
        developMsg?: string | undefined | null;
    }

    interface ResponseError {
        code: number;
        error: string;
        developMsg?: string | undefined | null;
    }

    interface RequestExts extends ResponseOptions {
        url: string;
        auth?: (
            context: {
                ctx: Context;
                next: Next;
            },
            callback: (error: ResponseError) => any
        ) => boolean | Promise<boolean>;
        log?: ILogTarget[];
        origin?: string[];
        content?: any;
    }

    interface DefaultContext extends ParameterizedContext<any, any> {
        body:
            | string
            | {
                  code: number;
                  error?: any;
                  developMsg?: string | undefined | null;
                  updateTime: number;
                  data?: any;
                  msg?: any;
              };
        success: (
            data: string | number | object | undefined,
            msg?: string | object | undefined,
            option?: ResponseOptions
        ) => any;
        fail: (
            error: string | number | object | null,
            code: number,
            option?: ResponseOptions
        ) => any;
        exts: () => RequestExts;
        $event: AppEventCore;
    }
}
