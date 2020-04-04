import 'parsers-ts';
import { word, spaces, str, digits } from 'parsers-ts/maps/ParserCreators';
import { colors } from './colors';
import { sequenceOf, choice, manyJoin } from 'parsers-ts/maps/ParserCombinators';
import { Parser } from 'parsers-ts/maps/Parser';
import { ParserState } from 'parsers-ts/maps/ParserState';


const cmd = `plz:play [timestamp:start_at]`;

/**
 * Each command has first the prefix, then the name, then required arguments, then optional arguments.
 * Here the command has 0 required and 1 optional.
 * The command interpreter should therefore first analyze the prefix: if it isn't correct, we don't interpret anything more.									--> DONE
 * Then, if the prefix is correct, it should analyze the name of the command, which will always be of type word.																--> DONE
 * That word will then be used to find the command requested.
 * - If the name is not in the list of commands, we return an error: command doesn't exist.
 * - Else if the name is in the list, it points to a command that exists. The command interpreter should then use the syntax of that command to interpret the arguments (every syntax problem is gonna be managed by the command interpreter).
*/


const prefix = 'plz:';

const colon = str(':');
const parsers: Map<string, Parser<any>> = new Map(Object.entries({
	timestamp: sequenceOf(digits, colon, digits, colon, digits)
		.map(result => ({
			hours: Number(result[0]),
			minutes: Number(result[2]),
			seconds: Number(result[4])
		}))
}));

const commands = new Map(Object.entries({
	play: {
		syntax: 'timestamp:start_at=00:00:00',
		run: (timestamp: {hours: number, minutes: number, seconds: number}) => console.log(`Playing at timestamp ${timestamp}`)
	}
}));

const shiftSpaces = (s: string) => {
	let match = s.match(/^\s+/);
	if (match) s = s.substring(match[0].length);
	return s;
}

interface Arg {
	type: string;
	name: string;
	default?: any;
}

const getArgumentParser = (arg: Arg) => {
	return new Parser(inputState => {
		let nextState = (parsers.get(arg.type)
			.map(result => ({[arg.name]: result})) as Parser<{[x: string]: any}>)
			.mapError((targetString, index) => `Invalid \`${arg.name}\` argument at index ${index}`).transformer(inputState);
		
		if (!arg.default) return nextState;
		
		return {...nextState, result: {[arg.name]: arg.default}, error: null};
	});
}

const getArgumentParsers = async (args: Arg[]) => {
	let argParsers: Parser<{[x: string]: any}>[] = [];
	for (let arg of args) {
		if (parsers.has(arg.type))
			argParsers.push(getArgumentParser(arg));
		else return Promise.reject(`Type '${arg.type}' (from argument ${arg.name}) does not exist`);
	}
	return Promise.resolve(argParsers);
}

// some syntax: 'number:rolls, word:something=nothing, timestamp:meh'
// should fail because of a required arg after an optional one
// PS after code: will fail by means of the parser not parsing the entire syntax
// Get a parser out of it that will parse the arguments of the command
const getSyntaxParser = async (syntax: string) => {
	const reqse = sequenceOf(word, colon, word).map(
		result => ({type: result[0], name: result[2]})
	) as Parser<Arg>;
	
	const optse = reqse.chain(result => {
			if (parsers.has(result.type))
				return sequenceOf(str('='), parsers.get(result.type))
					.map(value => ({...result, default: value[1]}));
		});
	
	const sep = choice(sequenceOf(str(','), spaces), spaces);
	

	const syntaxers: {required: Parser<{[x: string]: any}>[], optional: Parser<{[x: string]: any}>[]}
		= { required: [], optional: [] };

	try {
		const requiredState = manyJoin(reqse, sep, 0, false).run(syntax) as ParserState<Arg[]>;
		const optionalState = (sequenceOf(sep, manyJoin(optse, sep, 0, false))
			.map(result => result[1]) as Parser<Arg[]>).transformer(requiredState);
		
		if (requiredState.error) throw requiredState.error;
		if (optionalState.error) throw optionalState.error;

		syntaxers.required = await getArgumentParsers(requiredState.result);
		syntaxers.optional = await getArgumentParsers(optionalState.result);

		return Promise.resolve(
			(sequenceOf(...syntaxers.required) as Parser<{[x: string]: any}[]>)
				.chain(reqs =>
					(sequenceOf(...syntaxers.optional) as Parser<{[x: string]: any}[]>)
						.mapError(() => null)
						.map(opts => new Map([
							...reqs.map(req => Object.entries(req)[0]),
							...opts.map(opt => Object.entries(opt)[0])
						]))
				)
		);
		
	} catch (err) {
		return Promise.reject(err);
	}
}

const interpret = async (cmd: string) => {
	// Checking prefix
	if (!cmd.startsWith(prefix)) return Promise.resolve();
	cmd = cmd.substring(prefix.length);

	// Checking if the command name entered is a word
	let nameParse = word.run(cmd);
	if (nameParse.error)
		return Promise.reject(`Command name is not a word`);

	// Checking if the command exists
	let name = nameParse.result;
	if (!commands.has(name))
		return Promise.reject(`Command does not exist`);
	cmd = shiftSpaces(cmd.substring(name.length));
	
	// Parsing the arguments using the command's syntax
	// But first... Parse the command's syntax T-T
	// That's fucking done, I created a syntax parser generator <_<
}