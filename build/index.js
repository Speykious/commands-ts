"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("parsers-ts");
const ParserCreators_1 = require("parsers-ts/build/ParserCreators");
const colors_1 = require("./colors");
const ParserCombinators_1 = require("parsers-ts/build/ParserCombinators");
const Parser_1 = require("parsers-ts/build/Parser");
const colon = ParserCreators_1.str(':');
const parsers = new Map(Object.entries({
    timestamp: ParserCombinators_1.sequenceOf(ParserCreators_1.digits, colon, ParserCreators_1.digits, colon, ParserCreators_1.digits)
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
const getArgumentParser = (arg) => {
    return new Parser_1.Parser(inputState => {
        let nextState = parsers.get(arg.type)
            .map(result => ({ [arg.name]: result }))
            .mapError((targetString, index) => `Invalid \`${arg.name}\` argument at index ${index}`).transformer(inputState);
        if (!arg.default)
            return nextState;
        return { ...nextState, result: { [arg.name]: arg.default }, error: null };
    });
};
const getArgumentParsers = async (args) => {
    let argParsers = [];
    for (let arg of args) {
        if (parsers.has(arg.type))
            argParsers.push(getArgumentParser(arg));
        else
            return Promise.reject(`Type '${arg.type}' (from argument ${arg.name}) does not exist`);
    }
    return Promise.resolve(argParsers);
};
// some syntax: 'number:rolls, word:something=nothing, timestamp:meh'
// should fail because of a required arg after an optional one
// PS after code: will fail by means of the parser not parsing the entire syntax
// Get a parser out of it that will parse the arguments of the command
const getSyntaxParser = async (syntax) => {
    syntax = syntax + ' ';
    const reqse = ParserCombinators_1.sequenceOf(ParserCreators_1.word, colon, ParserCreators_1.word, ParserCreators_1.reg(/^[^=]/)).map(result => ({ type: result[0], name: result[2] }));
    const optse = reqse.chain(result => {
        if (parsers.has(result.type))
            return ParserCombinators_1.sequenceOf(ParserCreators_1.str('='), parsers.get(result.type))
                .map(value => ({ ...result, default: value[1] }));
    });
    const sep = ParserCombinators_1.choice(ParserCombinators_1.sequenceOf(ParserCreators_1.str(','), ParserCreators_1.spaces), ParserCreators_1.spaces);
    const syntaxers = { required: [], optional: [] };
    try {
        const requiredState = ParserCombinators_1.manyJoin(reqse, sep, 0, false).run(syntax);
        let optional;
        if (requiredState.result.length)
            optional = ParserCombinators_1.sequenceOf(sep, ParserCombinators_1.manyJoin(optse, sep, 0, false))
                .map(result => result[1]);
        else
            optional = ParserCombinators_1.manyJoin(optse, sep, 0, false);
        const optionalState = optional.transformer(requiredState);
        if (requiredState.error)
            throw 'requiredState ' + JSON.stringify(requiredState, null, '  ');
        if (optionalState.error)
            throw 'optionalState ' + JSON.stringify(optionalState, null, '  ');
        if (requiredState.result)
            syntaxers.required = await getArgumentParsers(requiredState.result);
        if (optionalState.result)
            syntaxers.optional = await getArgumentParsers(optionalState.result);
        return Promise.resolve(ParserCombinators_1.sequenceOf(...syntaxers.required)
            .chain(reqs => ParserCombinators_1.sequenceOf(...syntaxers.optional)
            .mapError(() => null)
            .map(opts => new Map([
            ...reqs.map(req => Object.entries(req)[0]),
            ...opts.map(opt => Object.entries(opt)[0])
        ]))));
    }
    catch (err) {
        return Promise.reject(err);
    }
};
/**
 * Each command has first the prefix, then the name, then required arguments, then optional arguments.
 * Here the command has 0 required and 1 optional.
 * The command interpreter should therefore first analyze the prefix: if it isn't correct, we don't interpret anything more.									--> DONE
 * Then, if the prefix is correct, it should analyze the name of the command, which will always be of type word.																--> DONE
 * That word will then be used to find the command requested.			 --> DONE
 * - If the name is not in the list of commands, we return an error: command doesn't exist.																										 --> DONE
 * - Else if the name is in the list, it points to a command that exists. The command interpreter should then use the syntax of that command to interpret the arguments (every syntax problem is gonna be managed by the command interpreter).
 * - For this, we generate a parser using the syntax and return errors when it is not written in right form.																				--> DONE
 * - Then, we parse the rest of the input to get the structured arguments for our command. They should fit the syntax, thus be successfully parsed by the newly generated parser. If they don't, the syntax parser would have returned the right nice error.
*/
const prefix = 'plz:';
const commands = new Map(Object.entries({
    play: {
        syntax: 'timestamp:start_at=00:00:00',
        description: 'hello I\'m a good command',
        run: (args) => {
            console.log(`Playing at timestamp ${args.get('timestamp')}`);
        }
    }
}));
// some syntax: 'number:rolls, word:something=nothing
const interpret = async (input) => {
    try {
        // Checking prefix
        if (!input.startsWith(prefix))
            return Promise.resolve();
        input = input.substring(prefix.length);
        // Checking if the command name entered is a word
        let nameParse = ParserCreators_1.word.run(input);
        if (nameParse.error)
            throw `Command name is not a word`;
        // Checking if the command exists
        let name = nameParse.result;
        if (!commands.has(name))
            throw `Command does not exist`;
        let cmd = commands.get(name);
        input = shiftSpaces(input.substring(name.length));
        // Parsing the arguments using the command's syntax
        // But first... Parse the command's syntax T-T
        // That's fucking done, I created a syntax parser generator <_<
        const argsState = (await getSyntaxParser(cmd.syntax)).run(input);
        if (argsState.error)
            throw 'from argsState: ' + argsState.error;
        if (argsState.index < input.length)
            throw `Too many arguments: '${input.substring(argsState.index)}' is remaining`;
        cmd.run(argsState.result);
        return Promise.resolve();
    }
    catch (err) {
        return Promise.reject(err);
    }
};
// Ready for the test...?? <_<
interpret(`plz:play [timestamp:start_at]`)
    .catch(err => console.log(`${colors_1.colors.FgRed}[ERROR]:${colors_1.colors.Reset} ${err.toString()}`));
//# sourceMappingURL=index.js.map