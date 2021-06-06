import Koa from 'koa';
export default function Middleware(name?: string): (target: any) => any {
    return (target) => {
        const controllerMethod = Object.getOwnPropertyDescriptors(target.prototype);
        const controllerMethodName = Object.getOwnPropertyNames(controllerMethod);
        if (controllerMethodName.includes('init')) {
            const middleware = new target();
            middleware.name = name || target.name;
            return controllerMethod.init.value.bind(middleware);
        }
        const middleware = (ctx: Koa.Context, next: Koa.Next) => {};
        middleware.name = name || target.name;
        return middleware;
    };
}
