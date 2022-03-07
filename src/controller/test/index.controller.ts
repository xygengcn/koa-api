import { Controller, Get } from '@/core';

@Controller('/')
export default class TestController {
    @Get('/get')
    public get(ctx) {
        return 'test';
    }
}
