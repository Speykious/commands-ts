import { ArgType, ArgTypeTuple } from './ArgType'
import { choice, ParserState, ErrorMsgProvider, Parser } from 'parsers-ts'
import { isOneOf } from './utils'

/** The result of an Arg's parsing. */
export interface ArgResult<T> {
	/** The result is of type 'arg'. */
	type: 'arg'
	/** The name of the argument. */
	name: string
	/** The value of the argument. */
	value: T
}

/** Parser of an argument. Has to return an ArgResult. */
export type ArgParser<T> = Parser<ArgResult<T>>

/** A set of required and optional properties used to build a new Arg object. */
export interface ArgInfo {
	/** The name of the argument. */
	name: string
	/** The label of the argument. */
	label?: string
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
	error?: ErrorMsgProvider
	/** Filters the parsed argument result. */
	filter?: {
		fn: (result: any) => boolean
		error: ErrorMsgProvider
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
	/** The name of the argument. */
	public name: string
	/** The label of the argument. */
	public label: string
	/** The description of the argument. */
	public description: string
	/** The type of the argument. */
	public type: ArgType<T>
	/** The parser of the argument. */
	public parser: ArgParser<T>
	/** The default value of the argument.
	 * The argument is required if there isn't one,
	 * and optional if there isn't. */
	public default?: T

	/** Creates an Arg<T> object. */
	constructor(types: ArgTypeTuple<any[]>, info: ArgInfo) {
		this.name = info.name
		this.label = info.label ? info.label : info.name
		this.description = info.description
		if (info.default) this.default = info.default

		let valParser: Parser<T>

		if (typeof info.type === 'string') {
			// Managing single types here
			this.type = types.getType(info.type)
			valParser = this.type.parser

			if (/^(word|text|int|float)$/.test(info.type)) {
				if (info.oneOf) {
					// Special facilitator: oneOf, to choose from different predetermined
					if (info.min || info.max) throw `min/max options are incompatible with oneOf`
					valParser = valParser.filter(
						fresult => isOneOf(fresult, info.oneOf),
						from => {
							const recieved = from.targetString.slice(from.index)
							return {
								info: `Argument has to be one of the following values: ${
									info.oneOf.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')
								}, recieved "${recieved}" instead`,
								oneOf: info.oneOf,
								input: recieved
							}
						}
					)
					
				} else {
					// Special facilitators: min and max, to make a range of values or character lengths
					if (info.min) {	// For minimum value
						if (/^(word|text)$/.test(info.type)) {
							valParser = valParser.filter(
								result => (result+'').length >= info.min,
								from => ({
									info: `Argument must have a minimum of ${info.min} characters`,
									min: info.min,
									arg: from.result,
									argLength: (from.result+'').length
								})
							)
						} else {
							valParser = valParser.filter(
								result => Number(result) >= info.min,
								from => ({
									info: `Argument must be equal to or greater than ${info.min}`,
									min: info.min,
									arg: from.result,
								})
							)
						}
					}
					if (info.max) {	// For maximum value
						if (/^(word|text)$/.test(info.type)) {
							valParser = valParser.filter(
								result => (result+'').length <= info.max,
								from => ({
									info: `Argument must have a maximum of ${info.max} characters`,
									max: info.max,
									arg: from.result,
									argLength: (from.result+'').length
								})	
							)
						} else {
							valParser = valParser.filter(
								result => Number(result) <= info.max,
								from => ({
									info: `Argument must be equal to or less than ${info.max}`,
									max: info.max,
									arg: from.result,
								})
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

			valParser = this.type.parser
		}

		// Managing error and filter options
		if (info.error)
			valParser = valParser.mapError(info.error)
		
		if (info.filter)
			valParser = valParser.filter(info.filter.fn, info.filter.error)
		
		
		
		this.parser = valParser.map(value => ({
			type: 'arg',
			name: this.name,
			value: value
		}))
	}

	/** Arg parser function. */
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