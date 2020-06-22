import * as path from 'path'
import * as win from 'node-windows'


const svc = new win.default.Service({
    name: 'audio-control',
    description: 'Windows audio device control server.',
    script: path.resolve('.', '..', 'audio-control.mjs')
});


export function install({port}) {
    svc.script = `${svc.script} run --port ${port}`
    svc.install();
}

function svcOp(op, ...args) {
    try {
        svc[op](...args);
        return true;
    } catch (err) {
        console.error(`${svc.name} ${op} FAILED: ${err}`)
        return false;
    }
}

export const start = svcOp.bind(svc, "start");
export const stop = svcOp.bind(svc, "stop");

