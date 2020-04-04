"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserCombinators_1 = require("parsers-ts/build/ParserCombinators");
const ParserCreators_1 = require("parsers-ts/build/ParserCreators");
const colon = ParserCreators_1.str(':');
const types = new Map(Object.entries({
    timestamp: ParserCombinators_1.sequenceOf([ParserCreators_1.digits, colon, ParserCreators_1.digits, colon, ParserCreators_1.digits])
        .map(result => ({
        hours: Number(result[0]),
        minutes: Number(result[2]),
        seconds: Number(result[4])
    }))
}));
const shiftSpaces = (s) => {
    let match = s.match(/^\s+/);
    if (match)
        s = s.substring(match[0].length);
    return s;
};
const reqse = ParserCombinators_1.sequenceOf([ParserCreators_1.word, colon, ParserCreators_1.word]).map(result => ({ type: result[0], name: result[2] }));
const optse = ParserCombinators_1.between(ParserCreators_1.str('['), ParserCreators_1.str(']'))(reqse.chain(result => {
    if (types.has(result.type))
        return ParserCombinators_1.sequenceOf([ParserCreators_1.str('='), types.get(result.type)])
            .map(value => ({ ...result, default: value[1] }));
}));
const comma = ParserCombinators_1.sequenceOf([ParserCreators_1.str(','), ParserCreators_1.spaces], 1);
//# sourceMappingURL=Command.js.map