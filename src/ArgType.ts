import { Parser } from "parsers-ts"

export interface ArgType<T> {
	/** The name of the argument type, which is what to enter in any ArgInfo type. */
	name: string
	/** The label of the argument type. */
	label: string
	/** The description of the argument type. */
	description: string
	/** The parser of the argument type. */
	parser: Parser<T>
}