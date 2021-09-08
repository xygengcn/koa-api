import { ParameterizedContext } from 'koa';

declare module 'koa' {
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
        fail: (option: ResponseError) => any;
        controller: ControllerMethod | undefined;
        $event: AppEventBus;
    }
}
