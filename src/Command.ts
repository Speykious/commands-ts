import { ArgInfo, Arg, ArgResult, ArgParser } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { OptInfo, Opt, OptResult } from './Opt'
import { Parser, str, choice, ParserState, spaces } from 'parsers-ts'
import { stateContextual } from 'parsers-ts/lib/ParserCombinators'

export interface CommandResult {
	args: ArgResult<unknown>[]
	opts: OptResult<unknown[]>[]
	execute: (input: CommandResult) => void
}

/** A set of required and optional properties used to build a new Command object. */
export interface CommandInfo {
	/** The name of the command. */
	name: string
	/** The description of the argument. */
	description: string
	/** The arguments that the option requires. */
	arguments?: ArgInfo[]
	/** The options that the option requires. */
	options?: OptInfo[]
	/** The function that the command executes when parsed successfully. */
	execute: (input: CommandResult) => void
}

export class Command {
	/** The name of the command. */
	public name: string
	/** The description of the argument. */
	public description: string
	/** The types that the arguments can have. */
	public types: ArgTypeTuple<any[]>
	/** The arguments that the option requires. */
	public arguments?: Arg<unknown>[]
	/** The options that the option requires. */
	public options?: Opt<unknown[]>[]
	/** The function that the command executes when parsed successfully. */
	public execute: (input: CommandResult) => void
	/** The parser of the command.
	 * Only parses the arguments, we assume the name has already been parsed.
	 */
	public parser: Parser<CommandResult>
	/** The parser that returns the Command object if the name corresponds. */
	public nameParser: Parser<Command>

	/** Creates a Command object. */
	constructor(types: ArgTypeTuple<any[]>, info: CommandInfo) {
		this.name = info.name
		this.description = info.description
		this.types = types

		this.nameParser = str(this.name).map(() => this)
		this.execute = info.execute

		let argparsers: ArgParser<unknown>[] = []
		if (info.arguments) {
			this.arguments = info.arguments.map((argi) => new Arg(types, argi))
			argparsers = this.arguments.map((arg) => arg.parser)
		}

		let optparser: Parser<Opt<unknown[]>>
		if (info.options) {
			this.options = info.options.map((opti) => new Opt(types, opti))
			optparser = choice(...this.options.map((opt) => opt.nameParser))
		}

		const theName = this.name
		const theExecute = this.execute
		// Make the command parser according to the index.ts notes
		this.parser = stateContextual<unknown, CommandResult>(function* () {
			const final: CommandResult = { args: [], opts: [], execute: theExecute }

			const originalState: ParserState<any> = yield Parser.nothing
			let narg = 1
			let finalIndex = originalState.index
			for (const argparser of [...argparsers, null]) {
				if (optparser) {
					yield spaces.mapError(null)

					while (true) {
						// We break out of that loop whenever there aren't any options left
						const optState = (
							yield optparser.mapError(null)
						) as ParserState<Opt<unknown[]>>
						finalIndex = optState.index
						if (!optState.result) break

						yield spaces.mapError(null)

						const optResult = (
							yield optState.result.parser
						) as ParserState<OptResult<unknown[]>>
						finalIndex = optResult.index
						if (optResult.error)
							return optResult.errorify<CommandResult>(optResult.error)
						final.opts.push(optResult.result)
					}
				}

				if (argparser) {
					yield spaces.mapError(null)

					const argResult = (yield argparser) as ParserState<ArgResult<unknown>>
					finalIndex = argResult.index
					if (argResult.error)
						return argResult.errorify<CommandResult>(() => ({
							info: `Argument n°${narg} from command "${theName}" is invalid`,
							command: theName,
							narg,
							argInfo: argResult.error
						}))
					final.args.push(argResult.result)
				}

				narg++
			}

			return originalState.update(finalIndex, final)
		})
	}

	/** Command parser function. Only parses the command's arguments. */
	parse(targetString: string, index: number = 0) {
		return this.parser.transformer(new ParserState(targetString, index))
	}
}
