import { ArgInfo, Arg } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { Parser, str, choice, spaces, ParserState, tuple, join } from 'parsers-ts'

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
	/** The parser of the option. */
	public parser: Parser<boolean | Arg<unknown>[]>

	/** Creates an Option object. */
	constructor(types: ArgTypeTuple<any[]>, info: OptionInfo) {
		this.name = info.name
		this.description = info.description
		if (info.short) this.short = info.short

		this.parser = choice(
			str(`--${this.name}`),
			str(`-${this.short}`)
		).map(() => true)

		if (info.arguments) {
			this.arguments = info.arguments.map(argi => new Arg(types, argi))
			this.parser = join(tuple(
				this.parser,
				...this.arguments.map(arg => arg.type.parser)
			), spaces).map(result => result.slice(1) as Arg<unknown>[])
			.mapError(from => {
				if (from.error.nparser === 0)
					return {
						info: `Option "${this.name}" parsing failed`,
						option: this.name
					}
				else return {
					info: `Argument n°${from.error.nparser} from option "${this.name}" is invalid`,
					narg: from.error.nparser,
					option: this.name
				}
			})
		} else {
			this.parser = this.parser
			.mapError({
				info: `Option "${this.name}" parsing failed`,
				option: this.name
			})
		}
	}

	/** Option parser function. */
	parse(targetString: string, index: number = 0) {
		return this.parser.transformer(new ParserState(targetString, index))
	}
}