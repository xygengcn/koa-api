import { API_INVERSIFY_KEY } from '@/keys/inversify';
import container from '@/container';
import { ApiFunctionMiddleware, IApiClassMiddleware } from '@/typings/middleware';
import { isClass, isFunction } from '@/utils';
import { Context, Next } from 'koa';

/**
 * 绑定中间件
 * @param middlewareInstance
 * @returns
 */
const convertClassToMiddleware = (middlewareInstance: IApiClassMiddleware): ApiFunctionMiddleware => {
    // 先初始化函数
    if (middlewareInstance?.init && isFunction(middlewareInstance?.init)) {
        middlewareInstance.init();
    }
    // 先执行，
    return async (context: Context, next: Next) => {
        // 是否有匹配的
        if (middlewareInstance?.match && isFunction(middlewareInstance?.match)) {
            if (!(await middlewareInstance.match(context))) {
                return next();
            }
        }

        // 是否有忽略的
        if (middlewareInstance?.ignore && isFunction(middlewareInstance?.ignore)) {
            if (await middlewareInstance.ignore(context)) {
                return next();
            }
        }

        // 执行
        if (middlewareInstance?.resolve && isFunction(middlewareInstance?.resolve)) {
            return middlewareInstance.resolve()(context, next);
        }

        // 正常执行
        next();
    };
};

/**
 * 转换中间件
 */
export function convertMiddleware(middleware: any): ApiFunctionMiddleware | null {
    if (isFunction(middleware)) {
        if (middleware.name && container && isClass(middleware)) {
            const middlewareClass: IApiClassMiddleware = container.getNamed(API_INVERSIFY_KEY.MIDDLEWARE_CLASS_KEY, middleware.name);
            if (middlewareClass) {
                return convertClassToMiddleware(middlewareClass);
            }
        }
        return middleware;
    }
    return null;
}
