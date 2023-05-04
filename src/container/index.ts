import { API_INVERSIFY_KEY } from '@/keys/inversify';
import ApiLogger from '@/logger';
import { Container, injectable } from 'inversify';
import 'reflect-metadata';
const container = new Container();

container.bind<ApiLogger>(API_INVERSIFY_KEY.API_LOGGER_KEY).to(ApiLogger).inSingletonScope();

export { injectable };

export default container;
