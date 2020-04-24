import { ArgTypeTuple } from '../src/ArgType'
import {
	Parser,
	word,
	choice,
	between,
	str,
	reg,
	sint,
	sfloat
} from 'parsers-ts'

const betweenQuotes = (qc: string) =>
	between(str(qc), str(qc))(reg(new RegExp(`^[^${qc}]*`)))

export const defaultTypes = new ArgTypeTuple(
	{
		name: 'word',
		label: name,
		description: `Any sequence of letters that doesn't contain separator characters.`,
		parser: word.mapError((from) => ({
			info: `Argument is not a word`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	},
	{
		name: 'text',
		label: name,
		description: `Either a string between quotes \`"\`, single-quotes \`'\` or backticks \`\`\`, or if none, will take the rest of all the command instruction.`,
		parser: choice(
			betweenQuotes("'"),
			betweenQuotes('"'),
			betweenQuotes('`'),
			Parser.void
		).mapError(`Argument is not a text (how is that even possible???)`)
	},
	{
		name: 'int',
		label: name,
		description: `Any integer number.`,
		parser: sint.mapError((from) => ({
			info: `Argument is not an int`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	},
	{
		name: 'float',
		label: name,
		description: `Any floating number.`,
		parser: sfloat.mapError((from) => ({
			info: `Argument is not a float`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	}
)
