import { sequenceOf, between, choice } from "parsers-ts/build/ParserCombinators";
import { word, str, digits, spaces } from "parsers-ts/build/ParserCreators";
import { Parser } from "parsers-ts/build/Parser";

interface Command {
	syntax: string;
	description: string;
	run: (args: Map<string, any>) => void;
}

interface Arg {
	type: string;
	name: string;
	default?: any;
}

const colon = str(':');
const types: Map<string, Parser<any>> = new Map(Object.entries({
	timestamp: sequenceOf([digits, colon, digits, colon, digits])
		.map(result => ({
			hours: Number(result[0]),
			minutes: Number(result[2]),
			seconds: Number(result[4])
		}))
}));

const shiftSpaces = (s: string) => {
	let match = s.match(/^\s+/);
	if (match) s = s.substring(match[0].length);
	return s;
}

const reqse = sequenceOf([word, colon, word]).map(
	result => ({type: result[0], name: result[2]})
) as Parser<Arg>;

const optse = between(str('['), str(']'))(reqse.chain(result => {
	if (types.has(result.type))
		return sequenceOf([str('='), types.get(result.type)])
			.map(value => ({...result, default: value[1]}));
}));

const comma = sequenceOf([str(','), spaces], 1);