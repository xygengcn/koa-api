import KoaRouter, { Layer } from 'koa-router';
import Logger from './base/api.logger';
import Api from './lib/api';
import ApiError from './base/api.error';

export { ApiRoutesDecorator as Controller, GetRequestApiRouteDecorator as Get, PostRequestApiRouteDecorator as Post, RequestApiRouteDecorator as Request, RedirectRequestApiRouteDecorator as Redirect } from './lib/decorators/api.route.decorator';

export { Middleware } from './lib/decorators/api.middleware.decorator';

export { transformController } from './lib/utils/controller';

export * from './typings';

export { Api, Logger, KoaRouter, Layer, ApiError };

export default Api;
