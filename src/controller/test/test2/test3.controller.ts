import { Controller, Get } from '@/core';

@Controller()
export default class Test3Controller {
    @Get('/get', { name: '测试嵌套路由2请求的接口' })
    public get() {
        return 'test3';
    }
}
