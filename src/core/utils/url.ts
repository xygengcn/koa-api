/**
 * 解析url
 * @param url
 * @returns
 */
export function urlParse(url: string): URL | null {
    if (!url.includes('http')) {
        return null;
    }
    return new URL(url);
}
