import Api, { Controller, Get, Logger, Param, Post, ApiLogger } from '../../dist';

type User = {
    id: number;
    name: {
        firstName: string;
        lastname: string;
    };
};

@Controller()
export class GetController {
    @Get('/get')
    // 获取query参数
    public get(@Param.Query<User>('id') id: number) {
        if (id) {
            return {
                id
            };
        }
        return null;
    }
}

@Controller('/post')
export class PostController {
    // 定义日志
    @Logger()
    private logger!: ApiLogger;
    @Post('/')
    // 获取body参数
    public post(@Param.Body<User>('id') id: number, @Param.Body<User>('name.firstName') firstName: string) {
        this.logger.log('post测试:', { id, firstName });
        if (id && firstName) {
            return {
                id,
                firstName
            };
        }
        return null;
    }
}

// 创建实例
const api = new Api();

api.on('log', (...args) => {
    console.log('[log]', ...args);
});
api.on('start', () => {
    console.log('[start]');
});

api.on('error', (e) => {
    console.error('[error]', e);
});

// 启动
api.start();
