import { Controller, Get } from '@/core';

@Controller('/', { name: '测试接口3', description: '测试接口' })
export default class Test3Controller {
    @Get('/get', { name: '测试嵌套路由3请求的接口' })
    public get() {
        return 'test3';
    }
}
