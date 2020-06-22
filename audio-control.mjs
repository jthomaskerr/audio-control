#!/usr/bin/node --experimental-modules
import * as os from 'os'

if (os.platform().indexOf('win32') === -1) {
    console.error("ERROR: audio-control is Windows-only.")
    process.exit(2)
}

import * as server from './src/server.mjs'
import * as service from './src/service.mjs'
import cli from './src/cli.mjs'
import {hostname, interfaces} from "./src/net.mjs";

function onRun(port) {
    const urls = interfaces().concat(hostname()).map(host => `http://${host}:${port}`)
    console.log(`SUCCESS: audio-control server running at\n    ${urls.join("\n    ")}`)
    return true
}

const COMMANDS = {
    start: {
        exec: (args) => service.start(args) && onRun(),
        description: "Start the audio-control service (must be installed first)"
    },
    stop: {
        exec: service.stop,
        description: "Stop the audio-control service"
    },
    restart: {
        exec: () => service.stop() && service.start(),
        description: "Restart the audio-control service"
    },
    install: {
        exec: service.install,
        description: "Install audio-control as a windows service",
        options: ["port"]//, "interface"]
    },
    run: {
        exec: (args) => server.run(args) && onRun(args.port),
        description: "Run the audio-control service as a standalone binary",
        options: ["port"]//, "interface"]
    }
}

const OPTIONS = {
    port: {
        description: `The port on which the audio-control service should listen`,
        default: 5637,
        hasValue: true
    }, 
    // not supported by serverjs
    /*interface: {
        description: `The interface on which the audio-control service should listen`,
        default: '0.0.0.0',
        hasValue: true
    }*/
}

cli(COMMANDS, OPTIONS)
