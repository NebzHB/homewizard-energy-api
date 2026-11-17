"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBufferArray = exports.bufferArrayToJSON = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bufferArrayToJSON(buffers) {
    return buffers.reduce((prev, buffer) => {
        const [key, value] = buffer.toString().split('=');
        prev[key] = value;
        return prev;
    }, {});
}
exports.bufferArrayToJSON = bufferArrayToJSON;
function isBufferArray(value) {
    if (!Array.isArray(value))
        return false;
    return value.every(v => Buffer.isBuffer(v));
}
exports.isBufferArray = isBufferArray;
//# sourceMappingURL=buffer.js.map