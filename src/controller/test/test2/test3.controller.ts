import { Controller, Get } from '@/core';

@Controller()
export default class Test3Controller {
    @Get('/get')
    public get(ctx) {
        return 'test3';
    }
}
