import { Controller, Get } from '@/core';

@Controller('/test2')
export default class Test2Controller {
    @Get('/get')
    public get(ctx) {
        return 'test2';
    }
}
