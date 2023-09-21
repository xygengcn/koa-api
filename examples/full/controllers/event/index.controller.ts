import { EventStream, Get, Post } from '@/decorators';
import { PassThrough } from 'stream';
import { Controller, Param } from '../../../../src';

@Controller()
export default class EventStreamController {
    /**
     * 支持text/event-stream数据流
     *
     * 类似chatGPT返回
     *
     * @param stream
     */
    @EventStream()
    @Get()
    public get(@Param.Stream() stream: PassThrough, @Param.Query('userId') userId: string) {
        const time = setInterval(() => {
            stream.write(`data: ${userId}\n\n`);
            console.log('[event-get]');
        }, 1000);
        stream.once('close', () => {
            console.log('[event-get] close');
            clearInterval(time);
        });
    }

    /**
     * 支持text/event-stream数据流
     *
     * 类似chatGPT返回
     *
     * @param stream
     */
    @EventStream()
    @Post()
    public post(@Param.Stream() stream: PassThrough, @Param.Body('userId') userId: string) {
        const time = setInterval(() => {
            stream.write(`data: ${userId}\n\n`);
            console.log('[event-post]');
        }, 1000);
        stream.once('close', () => {
            console.log('[event-post] close');
            clearInterval(time);
        });
    }

    /**
     * 支持text/event-stream数据流
     *
     * 类似chatGPT返回
     *
     * @param stream
     */
    @EventStream()
    @Post()
    public error(@Param.Stream() stream: PassThrough, @Param.Body('userId') userId: string) {
        throw Error('测试错误');
    }
}
