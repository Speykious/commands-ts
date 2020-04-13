import { ArgType } from './ArgType'
import { choice } from 'parsers-ts'

/** A set of required and optional properties used to build a new Argument object. */
export interface ArgInfo {
	/** The label of the argument. */
	label: string
	/** The type of the argument. Must be the name of one of the
	 * registered argument types, or several registered argument
	 * type names in order of priority to build a union type. */
	type: string | string[]
	/** The description of the argument. */
	description: string
	/** The default value of the argument.
	 * The argument is required if there isn't one,
	 * and optional if there isn't.
	 * Cannot be null if defined. */
	default?: any
	/** The error text to show when the argument is invalid. */
	error?: string
	/** Filters the parsed argument result. */
	filter?: {
		fn: (result: any) => boolean
		error: string
	}
	/** If the type is 'word', 'text', 'int' or 'float',
	 * this option will restrain you to a set of predetermined values. */
	oneOf?: (string|number)[]
	/** The min value of the length of the string if the type is 'word' or 'text'.
	 * The min value of the number if the type is 'int' or 'float'. */
	min?: number
	/** The max value of the length of the string if the type is 'word' or 'text'.
	 * The max value of the number if the type is 'int' or 'float'. */
	max?: number
}

const getType = (types: ArgType<any>[], name: string) => {
	const filtered = types.filter(type => type.name === name)
	if (filtered.length > 1)
		throw `Two or more argument types have the same name: '${name}'`
	else if (filtered.length < 1)
		throw `No argument with name '${name}' has been found`
	
	return filtered[0]
}

/** A class that represents an argument that is gonna be used in commands. */
export class Arg<T> {
	/** The label of the argument. */
	public label: string
	/** The description of the argument. */
	public description: string
	/** The type of the argument. */
	public type: ArgType<T>
	/** The default value of the argument.
	 * The argument is required if there isn't one,
	 * and optional if there isn't. */
	public default?: T

	constructor(types: ArgType<any>[], info: ArgInfo) {
		this.label = info.label
		this.description = info.description
		if (info.default) this.default = info.default

		if (typeof info.type === 'string') {
			this.type = getType(types, info.type)

			// Code for info.oneOf, info.min and info.max
		} else {
			const filtered: ArgType<any>[] = [];
			for (let name of info.type)
				filtered.push(getType(types, name))
			
			this.type = {
				name: info.type.join('|'),
				description: filtered.map(
					argt => `${argt.name} -> ${argt.description}`
				).join('\n'),
				label: info.type.join(' | '),
				parser: choice(...filtered.map(argt => argt.parser))
			}
		}

		// Code for info.error and info.filter
	}
}