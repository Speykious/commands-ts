"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("parsers-ts");
const ParserCreators_1 = require("parsers-ts/build/ParserCreators");
const colors_1 = require("./colors");
const ParserCombinators_1 = require("parsers-ts/build/ParserCombinators");
const Parser_1 = require("parsers-ts/build/Parser");
const ParserState_1 = require("parsers-ts/build/ParserState");
const colon = ParserCreators_1.str(':');
const parsers = new Map(Object.entries({
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
const getArgumentParser = (arg) => {
    return new Parser_1.Parser(inputState => {
        let nextState = parsers.get(arg.type)
            .map(result => ({ [arg.name]: result }))
            .mapError((targetString, index) => `Invalid \`${arg.name}\` argument at index ${index}`).transformer(inputState);
        if (!arg.default || !nextState.error)
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
    const reqse = ParserCombinators_1.sequenceOf([ParserCreators_1.word, colon, ParserCreators_1.word]).map(result => ({ type: result[0], name: result[2] }));
    const optse = ParserCombinators_1.between(ParserCreators_1.str('['), ParserCreators_1.str(']'))(reqse.chain(result => {
        if (parsers.has(result.type))
            return ParserCombinators_1.sequenceOf([ParserCreators_1.str('='), parsers.get(result.type)])
                .map(value => ({ ...result, default: value[1] }));
    }));
    const sep = ParserCombinators_1.sequenceOf([ParserCreators_1.str(','), ParserCreators_1.spaces], 1);
    const syntaxers = { required: [], optional: [] };
    try {
        const requiredState = ParserCombinators_1.manyJoin(reqse, sep, 0, false).run(syntax);
        console.log(requiredState);
        let optionaler = ParserCombinators_1.choice(ParserCombinators_1.manyJoin(optse, sep, 0, false), Parser_1.Parser.void);
        if (requiredState.result.length && requiredState.index < requiredState.targetString.length)
            optionaler = ParserCombinators_1.sequenceOf([sep, optionaler]).map(result => result[1]);
        const optionalState = optionaler.transformer(requiredState);
        console.log(optionalState);
        if (requiredState.error)
            throw `Required argument: ${requiredState.error}`;
        if (optionalState.error)
            throw `Optional argument: ${optionalState.error}`;
        if (requiredState.result)
            syntaxers.required = await getArgumentParsers(requiredState.result);
        if (optionalState.result)
            syntaxers.optional = await getArgumentParsers(optionalState.result);
        return Promise.resolve(new Parser_1.Parser(inputState => {
            const nextState = ParserCombinators_1.sequenceOf(syntaxers.required)
                .chain(reqs => ParserCombinators_1.sequenceOf(syntaxers.optional, 0)
                .map(opts => new Map([
                ...reqs.map(req => Object.entries(req)[0]),
                ...opts.map(opt => Object.entries(opt)[0])
            ]))).transformer(inputState);
            if (syntax.length < optionalState.targetString.length)
                return ParserState_1.ParserState.errorify(nextState, (targetString, index) => `The syntax wasn't fully parsed at index ${index} (remaining: '${syntax.substring(index)}')`);
            if (nextState.index < nextState.targetString.length)
                return ParserState_1.ParserState.errorify(nextState, (targetString, index) => `Too many arguments: '${shiftSpaces(targetString.substring(index))}' is remaining`);
            return nextState;
        }));
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
        syntax: '[timestamp:start_at=0:0:0]',
        description: 'hello I\'m a good command',
        run: (args) => {
            const sa = args.get('start_at');
            console.log(`Playing at timestamp ${sa.hours}h${sa.minutes}m${sa.seconds}s`);
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
        cmd.run(argsState.result);
        return Promise.resolve();
    }
    catch (err) {
        console.log(`${colors_1.colors.FgRed}[ERROR]:${colors_1.colors.Reset} ${err.toString()}`);
        // return Promise.reject(err);
        return Promise.resolve();
    }
};
// Ready for the test...?? <_<
interpret(`plz:play`);
interpret(`plz:play `);
interpret(`plz:play 1`);
interpret(`plz:play 13:24:59 something`);
interpret(`plz:play 1111:0984:5`);
interpret(`plz:play 0:0:123156516`);
//# sourceMappingURL=index.js.map