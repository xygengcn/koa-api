/**
 * 控制器对外接口，对外接口暴露
 */
import AppConfig from '@lib/config';
import AppDatabaseCore from '@lib/database';
import Koa from 'koa';
import appEvent from '@lib/event/index';
import { GetDecorator, ControllerDecorator, PostDecorator, ReturnsDecorator, ResponseDecorator, CorsDecotator, NameDecorator, DescriptionDecorator, HeadersDecorator, ContentDecorator, ExtsDecorator, QueryDecorator, AuthDecorator, RequestDecorator } from '@lib/decorators';
import { getRootPath } from '@util/file';
/**
 * 抛出参数类型
 */
export type Context = Koa.Context;

export type Next = Koa.Next;

/**
 * 参数获取
 */
export type RequestParams = RequestContent;

// 类装饰器
export const Controller = ControllerDecorator;

// 请求装饰器
export const Http = RequestDecorator;

// get装饰器
export const Get = GetDecorator;

// post装饰器
export const Post = PostDecorator;

// 返回类型
export const Returns = ReturnsDecorator;

// 请求头部检验
export const Headers = HeadersDecorator;

// 返回配置
export const Response = ResponseDecorator;

// 跨域配置
export const Cors = CorsDecotator;

// 接口名字
export const Name = NameDecorator;

// 接口简介
export const Description = DescriptionDecorator;

// 参数content验证
export const Content = ContentDecorator;

// url参数验证
export const Query = QueryDecorator;

// 参数exts验证
export const Exts = ExtsDecorator;

// 验证
export const Auth = AuthDecorator;

// 配置获取
export const Config = AppConfig;

// 日志
export const Log = appEvent.emitLog;

// 数据库
export const AppDatabase = AppDatabaseCore;

// 文件工具库
export * as FileUtils from '@util/file';

// url工具库
export * as UrlUtils from '@util/url';

// 时间工具库
export * as TimeUtils from '@util/time';

// 对象工具库
export * as ObjectUtils from '@util/object';

/**
 * app.js 的根目录
 */
export const __ROOT__ = getRootPath();
