import appEvent from '@lib/event/index';
export default function (content: DefaultContent | string) {
    appEvent.emitLog(content);
}
