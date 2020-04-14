import { ArgType, ArgTypeTuple } from './ArgType'
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
	oneOf?: any[]
	/** The min value of the length of the string if the type is 'word' or 'text'.
	 * The min value of the number if the type is 'int' or 'float'. */
	min?: number
	/** The max value of the length of the string if the type is 'word' or 'text'.
	 * The max value of the number if the type is 'int' or 'float'. */
	max?: number
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

	/** Creates an Arg<T> object. */
	constructor(types: ArgTypeTuple<any[]>, info: ArgInfo) {
		this.label = info.label
		this.description = info.description
		if (info.default) this.default = info.default

		if (typeof info.type === 'string') {
			// Managing single types here
			this.type = types.getType(info.type)

			if (/^(word|text|int|float)$/.test(info.type)) {
				if (info.oneOf) {
					// Special facilitator: oneOf, to choose from different predetermined
					if (info.min || info.max) throw `min/max options are incompatible with oneOf`
					this.type.parser = this.type.parser.filter(
						result => isOneOf(result, info.oneOf),
						() => `Argument has to be one of the following values: ${
							info.oneOf.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')
						}`
					)
				} else {
					// Special facilitators: min and max, to make a range of values or character lengths
					if (info.min) {	// For minimum value
						if (/^(word|text)$/.test(info.type)) {
							this.type.parser = this.type.parser.filter(
								result => (result+'').length >= info.min,
								() => `Argument must have a minimum of ${info.min} characters`
							)
						} else {
							this.type.parser = this.type.parser.filter(
								result => Number(result) >= info.min,
								() => `Argument must be equal to or greater than ${info.min}`
							)
						}
					}
					if (info.max) {	// For maximum value
						if (/^(word|text)$/.test(info.type)) {
							this.type.parser = this.type.parser.filter(
								result => (result+'').length <= info.max,
								() => `Argument must have a maximum of ${info.max} characters`
							)
						} else {
							this.type.parser = this.type.parser.filter(
								result => Number(result) <= info.max,
								() => `Argument must be equal to or less than ${info.max}`
							)
						}
					}
				} 
			}

		} else {
			// Managing union types here
			if (info.oneOf) throw `The oneOf option is incompatible with union types`
			if (info.min || info.max) throw `min/max options are incompatible with union types`

			const filtered: ArgTypeTuple<any[]> = new ArgTypeTuple()
			for (let name of info.type)
				filtered.push(types.getType(name))
			
			this.type = {
				name: info.type.join('-'),
				description: filtered.map(
					argt => `${argt.name} -> ${argt.description}`
				).join('\n'),
				label: info.type.join(' | '),
				parser: choice(...filtered.map(argt => argt.parser))
			}
		}

		// Managing error and filter options
		if (info.error)
			this.type.parser = this.type.parser.mapError(
				() => info.error
			)
		
		if (info.filter)
			this.type.parser = this.type.parser.filter(
				info.filter.fn, () => info.filter.error
			)
	}

	async parse(targetString: string) {
		try {
			return Promise.resolve(this.type.parser.run(targetString))
		} catch (err) {
			return Promise.reject(err)
		}
	}
}