import { Log } from 'app';
import axios, { AxiosRequestConfig } from 'axios';
import { createWriteStream } from 'fs';
import path from 'path';
import { mkdir, writeFileSync } from './file';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36';

/**
 * 下载文件
 * @param options
 * @returns
 */
export default function download(options: { url: string; path: string; name: string; headers?: any; onProgress?: (progressEvent) => void }, type: 'arraybuffer' | 'stream' = 'stream'): Promise<{ localPath: string; url: string }> {
    const localPath = path.join(options.path, options.name);
    const headers = Object.assign({ accept: '*/*', 'user-agent': UA }, options.headers || {});
    return new Promise((resolve, reject) => {
        const axiosConfigs: AxiosRequestConfig = { method: 'GET', url: options.url, responseType: type, onDownloadProgress: options?.onProgress, headers };
        axios(axiosConfigs)
            .then((res) => {
                if (res?.data) {
                    if (type === 'stream') {
                        mkdir(options.path);
                        const writer = createWriteStream(localPath);
                        res.data.pipe(writer);
                        writer.on('finish', () => {
                            resolve({ localPath, url: options.url });
                        });
                        writer.on('error', (e) => {
                            reject(e);
                        });
                    }
                    if (type === 'arraybuffer') {
                        writeFileSync(localPath, res.data);
                        resolve({ localPath, url: options.url });
                    }
                } else {
                    reject({ error: '下载失败' });
                    Log({
                        type: 'error',
                        subType: 'download',
                        content: {
                            error: '下载失败',
                            options
                        }
                    });
                }
            })
            .catch((e) => {
                Log({
                    type: 'error',
                    subType: 'download',
                    content: {
                        error: '下载失败',
                        options,
                        developMsg: e
                    }
                });
                reject({ error: '下载失败', developMsg: e });
            });
    });
}
