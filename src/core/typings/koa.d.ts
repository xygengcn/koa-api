import { appEventBus, ResponseType } from './app';
declare module 'koa' {
    interface ResponseOptions {
        type?: ResponseType | string;
        successCode?: number;
        failCode?: number;
        error?: string;
        developMsg?: string | undefined | null;
        headers?: {
            [key: string]: string | string[];
        };
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
        origin?: string[];
        content?: any;
        [key: string]: any;
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
        success: (data: string | number | object | undefined, option?: ResponseOptions) => any;
        fail: (error: string | number | object | null, code: number, option?: ResponseOptions) => any;
        exts: RequestExts;
        $event: appEventBus;
    }
}
