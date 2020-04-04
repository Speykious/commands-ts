"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strUtils_1 = require("./strUtils");
class Timestamp {
    constructor(hours, minutes, seconds) {
        this.hours = hours + Math.floor(minutes / 60);
        this.minutes = minutes % 60 + Math.floor(seconds / 60);
        this.seconds = seconds % 60;
    }
    get totalSeconds() {
        return this.hours * 3600
            + this.minutes * 60
            + this.seconds;
    }
    toString() {
        return `${strUtils_1.pad(this.hours, 2)}h${strUtils_1.pad(this.minutes, 2)}m${strUtils_1.pad(this.seconds, 2)}s`;
    }
}
exports.Timestamp = Timestamp;
//# sourceMappingURL=Timestamp.js.map