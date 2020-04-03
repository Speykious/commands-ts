import 'parsers-ts';
import { word, spaces, str, digits } from 'parsers-ts/maps/ParserCreators';
import { colors } from './colors';
import { sequenceOf } from 'parsers-ts/maps/ParserCombinators';
import { promises } from 'dns';


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

const p_colon = str(':');
const parsers = new Map(Object.entries({
	timestamp: sequenceOf(digits, p_colon, digits, p_colon, digits)
		.map(result => ({hours: result[0], minutes: result[2], seconds: result[4]}))
}));

const commands = new Map(Object.entries({
	play: {
		syntax: '[timestamp:start_at=00:00:00]',
		run: (timestamp: string) => console.log(`Playing at timestamp ${timestamp}`)
	}
}));

const shiftSpaces = (s: string) => {
	let match = s.match(/^\s+/);
	if (match) s = s.substring(match[0].length);
	return s;
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
	
}