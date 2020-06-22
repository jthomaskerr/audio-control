#!/usr/bin/node --experimental-modules

import server from 'server';
import MediaService  from './src/media.js';

const { get, post, error } = server.router;
const { status, redirect, json, header } = server.reply;

const media = new MediaService();
// Launch server
server({ port: 3000 }, [
    get('/', async ctx => json(await media.list())),
    get('/set', async ({query}) => await media.setOutput(query.id)),
    error(ctx => status(404))
]);
