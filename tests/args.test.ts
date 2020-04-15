import { Arg } from '../src/Arg'
import { ArgTypeTuple } from '../src/ArgType'
import { Parser, word, choice, between, str, reg } from 'parsers-ts'
import { isOneOf } from '../src/utils'

const betweenQuotes = (qc: string) =>
	between(str(qc), str(qc))(
		reg(new RegExp(`^((.*?)[^\\\\])?(?=${qc})`))
	)

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
			betweenQuotes(`'`),
			betweenQuotes(`"`),
			betweenQuotes('`'),
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

// Make different tests, each with a separate Arg object to expect things out of

test('Argument object: simple-word', async () => {
	const arg = new Arg<string>(myTypes, {
		label: 'simple-word',
		description: `Just a simple word`,
		type: 'word'
	})

	expect(arg.default).toBe(undefined)
	expect(arg.label).toBe('simple-word')
	expect(arg.type).toBe(myTypes[0])

	const yes = await arg.parse('yes-yes no')
	expect(yes.result).toBe('yes')
	expect(yes.error).toBe(null)

	const wut = await arg.parse('yes-yes no', 3)
	expect(wut.result).toBe(null)
})

test('Argument object: integers', async () => {
	const arg = new Arg<string>(myTypes, {
		label: 'simple-integer',
		description: `Just a simple integer`,
		type: 'int',
		default: 3
	})

	expect(arg.default).toBe(3)
	expect(arg.label).toBe('simple-integer')
	expect(arg.type).toBe(myTypes[2])

	const n1 = await arg.parse('123 456')
	const n2 = await arg.parse('+4069')
	const n3 = await arg.parse('-666')

	expect(n1.error).toBe(null)
	expect(n2.error).toBe(null)
	expect(n3.error).toBe(null)

	expect(n1.result).toBe(123)
	expect(n2.result).toBe(4069)
	expect(n3.result).toBe(-666)
})

test('Argument object: ranged integers', async () => {
	const arg = new Arg<string>(myTypes, {
		label: 'ranged-integer',
		description: `A ranged integer this time`,
		type: 'int',
		min: -30,
		max: 50
	})

	expect(arg.label).toBe('ranged-integer')
	expect(arg.type).toBe(myTypes[2])

	const n1 = await arg.parse('123')
	const n2 = await arg.parse('-654')
	const n3 = await arg.parse('18')
	const n4 = await arg.parse('+0')
	const n5 = await arg.parse('-2')

	expect(n1.error).toBe(`Argument must be equal to or less than 50`)
	expect(n2.error).toBe(`Argument must be equal to or greater than -30`)
	expect(n3.error).toBe(null)
	expect(n4.error).toBe(null)
	expect(n5.error).toBe(null)

	expect(n1.result).toBe(null)
	expect(n2.result).toBe(null)
	expect(n3.result).toBe(18)
	expect(n4.result).toBe(0)
	expect(n5.result).toBe(-2)
})

test('Argument object: ranged length of characters', async () => {
	const arg = new Arg<string>(myTypes, {
		label: 'limited-text',
		description: `A ranged integer this time`,
		type: 'text',
		min: 10,
		max: 50
	})

	expect(arg.label).toBe('limited-text')
	expect(arg.type).toBe(myTypes[1])

	const n1 = await arg.parse('abc')
	const n2 = await arg.parse('"abc"')
	const n3 = await arg.parse('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
	const n4 = await arg.parse('Hello world!')
	const n5 = await arg.parse('"Omae wa mou shindeiru."')

	expect(n1.error).toBe(`Argument must have a minimum of 10 characters`)
	expect(n2.error).toBe(`Argument must have a minimum of 10 characters`)
	expect(n3.error).toBe(`Argument must have a maximum of 50 characters`)
	expect(n4.error).toBe(null)
	expect(n5.error).toBe(null)

	expect(n1.result).toBe(null)
	expect(n2.result).toBe(null)
	expect(n3.result).toBe(null)
	expect(n4.result).toBe('Hello world!')
	expect(n5.result).toBe('Omae wa mou shindeiru.')
})

test('Argument object: one of several texts to choose from', async () => {
	const arg = new Arg<string>(myTypes, {
		label: 'hello-text',
		description: `Is it hello or world?`,
		type: 'text',
		oneOf: ['hello!', 'hello world!', 'ZA WARUDO', 'shindeiru.']
	})

	expect(arg.label).toBe('hello-text')
	expect(arg.type).toBe(myTypes[1])

	const guess1 = await arg.parse('hello!...')
	const guess2 = await arg.parse('"hello!"...')
	const guess3 = await arg.parse('ZA WARUDO')
	const guess4 = await arg.parse('`shindeiru.` \'other unrelated thing\'')

	console.log(guess1)
	expect(guess1.error).toBe(`Argument has to be one of the following values: "hello!", "hello world!", "ZA WARUDO", "shindeiru.", recieved "hello!..." instead`)
	

	expect(guess2.error).toBe(null)
	expect(guess3.error).toBe(null)
	expect(guess4.error).toBe(null)

	expect(guess1.result).toBe(null)
	expect(guess2.result).toBe('hello!')
	expect(guess3.result).toBe('ZA WARUDO')
	expect(guess4.result).toBe('shindeiru.')
})

test('Argument object: incompatibility between oneOf and min/max', async () => {
	try {
		new Arg<string>(myTypes, {
			label: 'impossible',
			description: `This argument cannot exist.`,
			type: 'word',
			min: 3,
			oneOf: ['what', 'the', '...']
		})
	} catch (err) {
		expect(err).toBe(`min/max options are incompatible with oneOf`)
	}

	try {
		new Arg<string>(myTypes, {
			label: 'impossible2',
			description: `This second argument cannot exist.`,
			type: 'word',
			max: 10,
			oneOf: ['what', 'the', '???']
		})
	} catch (err) {
		expect(err).toBe(`min/max options are incompatible with oneOf`)
	}
})