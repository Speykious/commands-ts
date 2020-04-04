"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserCombinators_1 = require("parsers-ts/build/ParserCombinators");
const ParserCreators_1 = require("parsers-ts/build/ParserCreators");
const Timestamp_1 = require("./Timestamp");
const colon = ParserCreators_1.str(':');
// Example of types object
const types = new Map(Object.entries({
    timestamp: ParserCombinators_1.sequenceOf([ParserCreators_1.digits, colon, ParserCreators_1.digits, colon, ParserCreators_1.digits])
        .map(result => new Timestamp_1.Timestamp(result[0], result[2], result[4]))
        .mapError((targetString, index) => `Invalid timestamp format at index ${index}: got '${targetString.slice(index)}', should be hh:mm:ss`)
}));
const comma = ParserCombinators_1.sequenceOf([ParserCreators_1.str(','), ParserCreators_1.spaces], 1);
//# sourceMappingURL=Command.js.map