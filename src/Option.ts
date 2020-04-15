import { ArgInfo, Arg } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { Parser } from 'parsers-ts'

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

class Option {
	/** The name of the option. */
	public name: string
	/** The description of the option. */
	public description: string
	/** The short name of the option. Has to be only one character. */
	public short?: string
	/** The arguments that the option requires. */
	public arguments?: Arg<undefined>[]
	/** The parser of the option. */
	public parser: Parser<undefined>

	/** Creates an Option object. */
	constructor(types: ArgTypeTuple<any[]>, info: OptionInfo) {
		this.name = info.name
		this.description = info.description
		if (info.short) this.short = info.short
		if (this.arguments) this.arguments = info.arguments.map(argi => new Arg(types, argi))
	}
}