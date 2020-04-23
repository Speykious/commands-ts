import { ArgInfo, Arg } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { Parser, str, choice, spaces, ParserState, tuple, join } from 'parsers-ts'

/** Set of required and optional properties used to build a new Option object. */
export interface OptionInfo {
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
export class Option {
	/** The name of the option. */
	public name: string
	/** The description of the option. */
	public description: string
	/** The short name of the option. Has to be only one character. */
	public short?: string
	/** The arguments that the option requires. */
	public arguments?: Arg<unknown>[]
	/** The parser of the option.
	 * Only parses the arguments, we assume the name / short has already been parsed. */
	public parser: Parser<Arg<unknown>[]>
	public nameParser: Parser<true>

	/** Creates an Option object. */
	constructor(types: ArgTypeTuple<any[]>, info: OptionInfo) {
		this.name = info.name
		this.description = info.description
		if (info.short) this.short = info.short

		this.nameParser = choice(
			str(`--${this.name}`),
			str(`-${this.short}`)
		).map(() => true)

		if (info.arguments) {
			this.arguments = info.arguments.map(argi => new Arg(types, argi))
			this.parser = join(tuple(...this.arguments.map(arg => arg.type.parser)), spaces)
			.map(result => result.slice(1) as Arg<unknown>[])
			.mapError(from => ({
				info: `Argument n°${from.error.nparser + 1} from option "${this.name}" is invalid`,
				argInfo: from.error.info,
				narg: from.error.nparser,
				option: this.name
			}))
		} else this.parser = Parser.void.map(() => [])
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
}