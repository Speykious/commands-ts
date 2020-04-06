import {
	Parser,
	str, spaces,
	sequenceOf,
	uint
} from 'parsers-ts';
import { Timestamp } from './Timestamp';
import { tuple } from 'parsers-ts';

interface Command {
	description: string;
	syntax: string;
	run: (args: Map<string, any>) => void;
}

interface Arg {
	type: string;
	name: string;
	default?: any;
}

const colon = str(':');
const comma = sequenceOf(tuple(str(','), spaces), 1);

// Example of types object
const types: Map<string, Parser<any>> = new Map(
	Object.entries({
		timestamp: sequenceOf(tuple(uint, colon, uint, colon, uint))
			.map((result) => new Timestamp(result[0], result[2], result[4]))
			.mapError(
				(targetString, index) => `Invalid timestamp format at index ${index}: got '${targetString.slice(index)}', should be hh:mm:ss`
			)
	})
);

/**
 * syntax: `T1, T2, [T3]`;
 *
 * Syntax Parser Generator:
 * getArgParser => word.map(result => types.get(result))
 * manyJoin(getArgParser, comma).run(syntax) => [pT1, pT2, pT3] (argParsers)
 * join([pT1, pT2, pT3], spaces)
 */
