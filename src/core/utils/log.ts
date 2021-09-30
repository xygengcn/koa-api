import appEvent from '@lib/event/index';
const UtilsLog = (content: DefaultContent | string) => {
    return appEvent.emitLog(content);
};

// error
UtilsLog.error = function (content: DefaultContent['content'], subType: string = 'log') {
    return appEvent.emitLog({
        type: 'error',
        content,
        subType
    });
};

export default UtilsLog as UtilsLog;
