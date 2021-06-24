import { URL } from "url"; //引入url模块
/**
 * 解析url
 * @param url
 * @returns
 */
export function urlParse(uri: string): URL | null {
    if (!uri.includes("http")) {
        return null;
    }
    return new URL(uri);
}
