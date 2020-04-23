import { ArgInfo, Arg } from './Arg'
import { ArgTypeTuple } from './ArgType'
import { OptionInfo, Option } from './Option'
import { Parser, sequenceOf, tuple, choice } from 'parsers-ts'


/** A set of required and optional properties used to build a new Command object. */
export interface CommandInfo {
	/** The name of the command. */
	name: string
	/** The description of the argument. */
	description: string
	/** The arguments that the option requires. */
	arguments?: ArgInfo[]
	/** The options that the option requires. */
	options?: OptionInfo[]
	/** The function that the command executes when parsed successfully. */
	execute: (input: { [key: string]: any }) => void
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
	public options?: Option[]
	/** The function that the command executes when parsed successfully. */
	public execute: (input: { [key: string]: any }) => void
	/** The parser of the command.
	 * Only parses the arguments, we assume the name has already been parsed. */
	public parser: Parser<{ [key: string]: any }>

	/** Creates a Command object. */
	constructor(types: ArgTypeTuple<any[]>, info: CommandInfo) {
		this.name = info.name
		this.description = info.description
		this.types = types

		let argparsers: Parser<unknown>[]

		if (info.arguments) {
			this.arguments = info.arguments.map(argi => new Arg(types, argi))
			argparsers = this.arguments.map(arg => arg.type.parser)
		} else this.parser = Parser.void.map(() => ({}))

		if (info.options) {
			this.options = info.options.map(opti => new Option(types, opti))

			let optParser = choice(...this.options.map(opt => opt.parser))

			if (argparsers) {

			} else {

			}
		}
		
		this.execute = info.execute

		if (this.arguments) {
			this.parser = sequenceOf(argparsers)
		} else {
			
		}
	}
}