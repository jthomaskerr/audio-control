/*jshint bitwise: false, onevar: false */
var Bytes, toBytes, toUTF8Bytes, fromUTF8Bytes, readFromBytes, assert;

assert = function (test, message) {
    if (!test) throw new Error(message);
};

Bytes = function Bytes (){};
Bytes.fromString = function (str, format) {
    switch (format) {
        case 'ascii':
            return Bytes.fromStringAscii(str);

        case 'utf8':
            return Bytes.fromStringUTF8(str);

        default:
            throw new TypeError('bad format ' + format);
    }
};

Bytes.prototype.toString = function (format) {
    switch (format) {
        case 'ascii':
            return this.asciiBytesToString();

        case 'utf-8':
            return this.utf8BytesToString();

        default:
            throw new TypeError('Bad format ' + format);
    }
};

Bytes.fromStringUTF8 = function (source) {
    var data = [], max = source.length, i, ch;

    for (i = 0; i < max; i++) {
        ch = source.charCodeAt(i);
        [].push.apply( data, toUTF8Bytes(i) );
    }

    return new Bytes(data);
};

Bytes.prototype.utf8BytesToString = function () {
    throw "Not Implemented";
};

var toBytes = function (n, l) {
    var result = [];

    do {
        result.unshift( n % 256 );
        n = n >>> 8;
    } while (n > 0);

    while (result.length < l) {
        result.unshift(0);
    }

    return result;
};

var toUTF8Bytes = function (char) {
    var bytes = [];

    if (char <= 0x007F) {
        return [ char ];
    }

    if (char <= 0x07FF) {
        bytes = toBytes(char, 2);
        return [
            0xc0 | bytes[0] << 2 | bytes[1] >>> 6,
            0x80 | (bytes[1] & 0x3f)
        ];
    }

    if (char <= 0xFFFF) {
        bytes = toBytes(char, 2);
        return [
            0xe0 | bytes[0] >>> 4,
            0x80 | ((bytes[0] << 2 | bytes[1] >>> 6) & 0x3f),
            0x80 | (bytes[1] & 0x3f)
        ];
    }

    if (char <= 0x10FFFF) {
        bytes = toBytes(char, 3);
        return [
            0xf0 | (bytes[0] >>> 2),
            0x80 | ((bytes[0] << 4 | bytes[1] >>> 4) & 0x3f),
            0x80 | ((bytes[1] << 2 | bytes[2] >>> 6) & 0x3f),
            0x80 | (bytes[2] & 0x3f)
        ];
    }

    throw new TypeError('Invalid Codepoint: ' + char.toString(16));
};

fromUTF8Bytes = function (bytes) {
    var max = bytes.length, i = 0, chars = [], add;

    add = function (cp) {
        chars.push(cp);
    };

    while (i < max) {
        i += readFromBytes(bytes, i, add);
    }

    return String.fromCharCode.apply(null, chars);
};

// Reads a single character and calls emit with that character-point,
// returns the number of bytes consumed
readFromBytes = function (bytes, i, emit) {
    var byte, slice, w, x, y, z;

    byte = bytes.charCodeAt(i);
    if (byte == 0xc0 || byte == 0xc1 || byte > 0xf4) {
        throw new Error("Illegal byte: " + byte);
    }

    if (byte <= 0x7f) {
        emit(byte);
        return 1;
    }

    if ((byte & 0xe0) === 0xc0) {
        slice = bytes.slice(i, i + 2);
        assert(slice.length === 2, 'unexpected end of input');

        emit((slice[0] & 0x1f) << 6 |
            (slice[1] & 0x3f));

        return 2;
    }

    if ((byte & 0xf0) === 0xe0) {
        slice = bytes.slice(i, i + 3);
        assert(slice.length === 3, 'unexpected end of input');

        z = slice[0] & 0xf;
        y = slice[1] & 0x3f;
        x = slice[2] & 0x3f;

        emit( z << 12 | y << 6 | x );
        return 3;
    }

    if ((byte & 0xf8) === 0xf0) {
        slice = bytes.slice(i, i + 4);
        assert(slice.length === 4, 'unexpected end of input');

        w = slice[0] & 0x7;
        x = slice[1] & 0x3f;
        y = slice[2] & 0x3f;
        z = slice[3] & 0x3f;

        emit(w << 18 | x << 12 | y << 6 | z);
        return 4;
    }

    throw new TypeError("Illegal Byte: " + byte);
};

if (typeof exports != 'undefined') {
    exports.toBytes = toBytes;
    exports.toUTF8Bytes = toUTF8Bytes;
    exports.fromUTF8Bytes = fromUTF8Bytes;
}