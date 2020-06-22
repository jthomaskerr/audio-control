import server from 'server';
import MediaService  from './media.js';

const { get, post, error } = server.router;
const { status, redirect, json, header } = server.reply;

const media = new MediaService();

export function run({port}) {
    server({port: Number(port)}, [
        get('/devices', async ({query}) => json(await media.list())),
        get('/devices/set', async ({query}) => json(await media.setOutput(query.id))),
        get('/devices/get', async ({query}) => json(await media.getOutput())),
        get('/volume/set', async ({query}) => json(await media.setVolume(query.percent, query.id))),
        get('/volume/get', async ({query}) => json({volume: await media.getVolume(query.id)})),
        get('/mute/set', async ({query}) => json({mute: !!(await media.setMute(query.active, query.id))})),
        get('/mute/get', async ({query}) => json({mute: !!(await media.getMute(query.id))})),

        error(ctx => status(404))
    ]);
    return true;
}