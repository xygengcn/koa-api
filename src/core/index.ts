import KoaRouter from 'koa-router';
import Api from './lib/api';
import { ApiRoutesDecorator, GetRequestApiRouteDecorator, PostRequestApiRouteDecorator, RequestApiRouteDecorator } from './lib/decorators/api.route.decorator';

export * from './typings';

export const Router = KoaRouter;

export const Controller = ApiRoutesDecorator;

export const Post = PostRequestApiRouteDecorator;

export const Get = GetRequestApiRouteDecorator;

export const Request = RequestApiRouteDecorator;

export default Api;
