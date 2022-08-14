export { default as KoaRouter, Layer } from 'koa-router';
export { default as Logger } from './base/api.event';
import Api from './lib/api';
export { default as ApiError } from './base/api.error';

export { ApiRoutesDecorator as Controller, GetRequestApiRouteDecorator as Get, PostRequestApiRouteDecorator as Post, RequestApiRouteDecorator as Request, RedirectRequestApiRouteDecorator as Redirect } from './lib/decorators/api.route.decorator';

export { Middleware } from './lib/decorators/api.middleware.decorator';

export { transformController } from './lib/utils/controller';

export * from './typings';

export default Api;
