import { INimStatus } from './type';
const ws = require('ws');
const clients: any[] = [];

const send = (text: string) => {
    clients.forEach((ws: any) => {
        if (ws && ws.readyState === INimStatus.open) {
            ws.send(text);
            console.log('send success');
        }
    });
};

module.exports.ws = (server) => {
    const wss = new ws.Server({ server });
    wss.on('connection', function connection(ws: any) {
        clients.push(ws);
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
    });
};
module.exports.server = () => {
    return async function (ctx, next) {
        ctx.msg = (text) => {
            send(text);
        };
        await next();
    };
};
