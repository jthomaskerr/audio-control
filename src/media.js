const util = require('util');
const execFile  = util.promisify(require('child_process').execFile);
const path = require('path');
const { decode,  encode, toASCII , toUnicode } = require('punycode');
const { min, max } = Math;
    
module.exports = class MediaService {
    constructor() {
    }

    async _svv(cmd, ...opts) {
        const executable = path.join(__dirname, '..', 'SoundVolumeView.exe');
        const allOpts = [ '/' + cmd ].concat(opts);
        try {
            const {stdout, exitCode} = await execFile(executable, allOpts);
            console.log("Executed", executable, allOpts, ":", exitCode)
            if (exitCode) {
                return exitCode;
            } else {
                return stdout;
            }
        } catch(err) {
            return err.code;
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

    async getOutput() {
        const devices = await this.list();
        const activeDevice = devices.find( device => device.default_multimedia === "Render" );
        return (activeDevice || UNKNOWN_DEVICE);
    }
    
    async setOutput(value) {
        const result = await this._svv('SetDefault', value, 1);
        return await getOutput();
    }
    
    async _idOrActive(id) {
        id = id || (await this.getOutput()).command_line_friendly_id;
        if (! id) throw new Error("No device found");
        
        return id;
    }
    
    async setVolume(percent, deviceId = null) {
        const id = await this._idOrActive(deviceId);
        await this._svv("SetVolume", id, max(0, min(100, value)));
        return await this.getVolume(id);
    }
    
    async getVolume(deviceId = null) {
        const id = await this._idOrActive(deviceId);
        return (await this._svv("GetPercent", id)) / 10;
    }
    
    async setMute(active, deviceId = null) {
        const id = await this._idOrActive(deviceId);
        await this._svv( active ? "Mute" : "Unmute", id);
        return this.getMute(id);
    }
    
    async getMute(active, deviceId = null) {
        const id = await this._idOrActive(deviceId); 
        return await this._svv("GetMute", id);
    }
}

const UNKNOWN_DEVICE = { name: "Unknown"};