import { ArgTypeTuple } from './ArgType'
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
		label: 'Word',
		description: `Any sequence of letters that doesn't contain separator characters.`,
		parser: word.mapError((from) => ({
			info: `Argument is not a word`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	},
	{
		name: 'text',
		label: 'Text',
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
		label: 'Int',
		description: `Any integer number.`,
		parser: sint.mapError((from) => ({
			info: `Argument is not an int`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	},
	{
		name: 'float',
		label: 'Float',
		description: `Any floating number.`,
		parser: sfloat.mapError((from) => ({
			info: `Argument is not a float`,
			targetArg: from.targetString.slice(from.index),
			index: from.index
		}))
	}
)
