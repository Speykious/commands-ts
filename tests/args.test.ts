import {} from '../src/Arg'
import { ArgTypeTuple } from '../src/ArgType'
import { Parser, word, choice, between, str } from 'parsers-ts'

const myTypes = new ArgTypeTuple(
	{
		name: 'word',
		label: name,
		description: `Any sequence of letters that doesn't contain separator characters.`,
		parser: word.mapError((targetString, index) => `Argument is not a word at index ${index}`)
	},
	{
		name: 'text',
		label: name,
		description: `Either a string between quotes \`"\`, single-quotes \`'\` or backticks \`\`\`, or if none, will take the rest of all the command instruction.`,
		parser: choice(
			between(str(`'`), str(`'`))(Parser.void),
			between(str(`"`), str(`"`))(Parser.void),
			between(str('`'), str('`'))(Parser.void),
			Parser.void
		).mapError(() => `Argument is not a text (how is that even possible???)`)
	},
	{
		name: 'int',
		label: name,
		description: `Any integer number.`,
		parser: Parser.newStandard(/^[+-]?\d+/,
			matchString => Number(matchString),
			(targetString, index) => `Argument is not an integer at index ${index}`
		)
	},
	{
		name: 'float',
		label: name,
		description: `Any floating number.`,
		parser: Parser.newStandard(/^[+-]?\d+(\.\d+)?/,
			matchString => Number(matchString),
			(targetString, index) => `Argument is not a float at index ${index}`
		)
	}
)

test('ArgTypeTuple construction', () => {
	expect(myTypes[0].name).toBe('word')
	expect(myTypes[1].name).toBe('text')
	expect(myTypes[2].name).toBe('int')
	expect(myTypes[3].name).toBe('float')
})

test('Get types from ArgTypeTuple', () => {
	expect(myTypes.getType('word')).toBe(myTypes[0])
	expect(myTypes.getType('text')).toBe(myTypes[1])
	expect(myTypes.getType('int')).toBe(myTypes[2])
	expect(myTypes.getType('float')).toBe(myTypes[3])
})
