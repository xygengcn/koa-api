import { Controller, Get } from '@/core';

@Controller('/')
export default class TestController {
    @Get('/get', { name: '测试嵌套路由1请求的接口' })
    public get() {
        return 'test';
    }
}
