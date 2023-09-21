import { EventStream, Get } from '@/decorators';
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
    public test(@Param.Stream() stream: PassThrough) {
        const time = setInterval(() => {
            stream.write(`data: ${new Date()}\n\n`);
            console.log('1111');
        }, 1000);
        stream.once('close', () => {
            clearInterval(time);
        });
    }
}
