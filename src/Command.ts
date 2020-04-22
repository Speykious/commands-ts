import { ArgInfo } from './Arg'
import {} from 'parsers-ts'
import {} from './utils'
import { OptionInfo } from './Option'

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