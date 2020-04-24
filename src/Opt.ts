import { ArgInfo, Arg, ArgResult } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { Parser, str, choice, spaces, ParserState, tuple, join, succeed, reg } from 'parsers-ts'
import { stateContextual, many } from 'parsers-ts/lib/ParserCombinators'

/** The result of an Arg's parsing. */
export interface OptResult<T extends any[]> {
	/** The result is of type 'opt'. */
	type: 'opt'
	/** The name of the option. */
	name: string
	/** The argument parsed results. */
	argsResults: ArgResult<T[number]>[]
}

/** Parser of an argument. Has to return an ArgResult. */
export type OptParser<T extends any[]> = Parser<OptResult<T>>

/** Set of required and optional properties used to build a new Option object. */
export interface OptInfo {
	/** The name of the option. */
	name: string
	/** The description of the option. */
	description: string
	/** The short name of the option. Has to be only one character. */
	short?: string
	/** The arguments that the option requires. */
	arguments?: ArgInfo[]
}

/** An option for a Command. */
export class Opt<T extends any[]> {
	/** The name of the option. */
	public name: string
	/** The description of the option. */
	public description: string
	/** The short name of the option. Has to be only one character. */
	public short?: string
	/** The arguments that the option requires. */
	public arguments?: Arg<T[number]>[]
	/** The parser of the option.
	 * Only parses the arguments, we assume the name / short has already been parsed. */
	public parser: OptParser<T>
	/** The parser that returns the Option object if the name corresponds. */
	public nameParser: Parser<Opt<T>>

	/** Creates an Option object. */
	constructor(types: ArgTypeTuple<unknown[]>, info: OptInfo) {
		this.name = info.name
		this.description = info.description
		if (info.short) this.short = info.short

		this.nameParser = choice(
			str(`--${this.name}`),
			str(`-${this.short}`)
		).map(() => this)

		let argsParser: Parser<ArgResult<T[number]>[]>

		if (info.arguments) {
			this.arguments = info.arguments.map(argi => new Arg(types, argi))
			argsParser = join(tuple(...this.arguments.map(arg => arg.parser)), spaces)
			.mapError(from => ({
				info: `Argument n°${from.error.nparser + 1} from option "${this.name}" is invalid`,
				argInfo: from.error.info,
				narg: from.error.nparser,
				option: this.name
			}))
		} else argsParser = succeed([])

		this.parser = argsParser.map(argsResults => ({
			type: 'opt',
			name: this.name,
			argsResults: argsResults
		}))
	}

	/** Option parser function. */
	async parse(targetString: string, index: number = 0) {
		try {
			return Promise.resolve(
				this.parser.transformer(
					new ParserState(targetString, index)
				)
			)
		} catch (err) {
			return Promise.reject(err)
		}
	}

	async fullParse(targetString: string, index: number = 0) {
		try {
			const theNameParser = this.nameParser
			const theParser = this.parser
			return Promise.resolve(
				stateContextual<Opt<T> | OptResult<T>, OptResult<T>>(function* () {
					const nameState = (yield theNameParser) as ParserState<Opt<T>>
					if (nameState.error)
						return nameState.errorify(nameState.error) as ParserState<OptResult<T>>

					yield many(spaces).map(() => null)

					return (yield theParser) as ParserState<OptResult<T>>
				}).transformer(new ParserState(targetString, index))
			)
		} catch (err) {
			return Promise.reject(err)
		}
	}
}