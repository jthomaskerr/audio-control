import os from 'os';

export function interfaces(external = true) {
    return Object.entries(os.networkInterfaces())
        .flatMap(bindings => bindings)
        .filter( ([name, data]) => "IPv4" === data.family)
        .map( ([name, data]) => data.address)
}

export const hostname = os.hostname;
