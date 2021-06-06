/**
 *
 * 时间操作集合
 *
 */

/**
 *
 * @param time 时间戳
 * @param format yyyy-MM-dd HH:mm:ss DD 格式
 */
export function TimeFormat(time?: string | number | Date, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const dates = time ? new Date(time) : new Date();
    const year = dates.getFullYear();
    const month = dates.getMonth() + 1 > 9 ? dates.getMonth() + 1 : '0' + (dates.getMonth() + 1);
    const date = dates.getDate() > 9 ? dates.getDate() : '0' + dates.getDate();
    const hour = dates.getHours() > 9 ? dates.getHours() : '0' + dates.getHours();
    const min = dates.getMinutes() > 9 ? dates.getMinutes() : '0' + dates.getMinutes();
    const ss = dates.getSeconds() > 9 ? dates.getSeconds() : '0' + dates.getSeconds();
    // 获取星期
    const dow = dates.getDay();
    const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const day = week[dow];
    return format
        .replace('yyyy', year + '')
        .replace('MM', month + '')
        .replace('dd', date + '')
        .replace('HH', hour + '')
        .replace('mm', min + '')
        .replace('ss', ss + '')
        .replace('DD', day + '');
}
