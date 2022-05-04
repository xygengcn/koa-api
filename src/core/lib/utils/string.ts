/**
 * 首字母大写
 * @param string
 * @returns
 */
export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
