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
    const month = String(dates.getMonth() + 1).padStart(2, '0');
    const date = String(dates.getDate()).padStart(2, '0');
    const hour = String(dates.getHours()).padStart(2, '0');
    const min = String(dates.getMinutes()).padStart(2, '0');
    const ss = String(dates.getSeconds()).padStart(2, '0');
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
