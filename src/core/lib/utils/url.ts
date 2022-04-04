import { URL } from 'url';
export function isUrl(url: string): boolean {
    try {
        const uri = new URL(url);
        return !!uri;
    } catch (error) {
        return false;
    }
}
