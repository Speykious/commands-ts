"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = (n, width, z = '0') => {
    n = n + '';
    if (n.length >= width)
        return n;
    else
        return new Array(width - n.length + 1).join(z) + n;
};
exports.shiftSpaces = (s) => {
    const match = s.match(/^\s+/);
    if (match)
        s = s.slice(match[0].length);
    return s;
};
//# sourceMappingURL=strUtils.js.map