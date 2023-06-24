import 'reflect-metadata';
import { API_INVERSIFY_KEY } from '@/keys/inversify';
import ApiLogger from '@/logger';
import { Container, injectable } from 'inversify';
import ApiOptions from '../app/api.options';
const container = new Container();

container.bind<ApiLogger>(API_INVERSIFY_KEY.API_LOGGER_KEY).to(ApiLogger).inSingletonScope();

container.bind<ApiOptions>(API_INVERSIFY_KEY.API_OPTIONS).to(ApiOptions).inSingletonScope();

export { injectable };

export default container;
