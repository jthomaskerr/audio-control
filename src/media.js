const util = require('util');
const execFile  = util.promisify(require('child_process').execFile);
const path = require('path');
const { decode,  encode, toASCII , toUnicode } = require('punycode');

    
module.exports = class MediaService {
    constructor() {
    }

    async _svv(cmd, ...opts) {
        const executable = path.join(__dirname, '..', 'SoundVolumeView.exe');
        const allOpts = [ '/' + cmd ].concat(opts);
        const {stdout, exitCode} = await execFile(executable, allOpts);
        console.log("Executed", executable, allOpts, ":", exitCode)
        if (exitCode) {
            return exitCode;
        } else {
            return stdout;
        }
    }

    async list() {
            const result = await this._svv('stab');
            if (typeof result === 'string') {
                
                const resultArray = result.substr(2).replace(/\u0000/g, "").split(/\n+/).map(
                    row => row.split("\t")
                );
                    
                const fields = resultArray.shift().map ( 
                    f => f.toLowerCase().trim().replace(/[-\s]+/g, "_")
                );
                
                const out = resultArray.map(row =>
                    Object.fromEntries(
                        row.map(
                            (value, index) => [fields[index], value]
                        )
                    )
                );
                return out;
            } else throw new Error("Failed to get device list");
        
    }

    async setOutput(value) {
        const result = await this._svv('SetDefault', value, 1);
        console.log(result);
        
        const devices = await this.list();
        const activeDevice = devices.find( device => device.default_multimedia === "Render" );
        return (activeDevice || UNKNOWN_DEVICE);
    }
}

const UNKNOWN_DEVICE = { name: "Unknown"};