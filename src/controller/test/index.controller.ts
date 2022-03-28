import { Controller, Get, ApiRouteRequestOption, Post } from '@/core';

const headers: ApiRouteRequestOption = {
    token: String
};

const body: ApiRouteRequestOption = {
    userName: {
        type: String,
        default: 'admin',
        description: '用户名'
    },
    userId: {
        type: Number,
        default: 101,
        require: true,
        description: '用户id'
    }
};

@Controller('/', { name: '测试文档接口', description: '测试接口' })
export default class TestController {
    @Get('/get', { name: '测试嵌套路由1请求的接口' })
    public get() {
        return 'test';
    }

    @Post('/docs', { name: '测试文档的接口实例', description: '这是描述', origin: ['https://localhost:3000', 'https://localhost:3010'], request: { headers, body } })
    doc() {
        return {
            msg: '测试文档的接口'
        };
    }
}
