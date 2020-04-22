import { Arg } from '../src/Arg'
import { defaultTypes } from '../src/defaultTypes'

test('ArgTypeTuple construction', () => {
	expect(defaultTypes[0].name).toBe('word')
	expect(defaultTypes[1].name).toBe('text')
	expect(defaultTypes[2].name).toBe('int')
	expect(defaultTypes[3].name).toBe('float')
})

test('Get types from ArgTypeTuple', () => {
	expect(defaultTypes.getType('word')).toBe(defaultTypes[0])
	expect(defaultTypes.getType('text')).toBe(defaultTypes[1])
	expect(defaultTypes.getType('int')).toBe(defaultTypes[2])
	expect(defaultTypes.getType('float')).toBe(defaultTypes[3])
})

// Make different tests, each with a separate Arg object to expect things out of

test('Argument object: simple-word', async () => {
	const arg = new Arg<string>(defaultTypes, {
		label: 'simple-word',
		description: `Just a simple word`,
		type: 'word'
	})

	expect(arg.default).toBe(undefined)
	expect(arg.label).toBe('simple-word')
	expect(arg.type).toBe(defaultTypes[0])

	const yes = await arg.parse('yes-yes no')
	expect(yes.result).toBe('yes')
	expect(yes.error).toBe(null)

	const wut = await arg.parse('yes-yes no', 3)
	expect(wut.result).toBe(null)
})

test('Argument object: integers', async () => {
	const arg = new Arg<string>(defaultTypes, {
		label: 'simple-integer',
		description: `Just a simple integer`,
		type: 'int',
		default: 3
	})

	expect(arg.default).toBe(3)
	expect(arg.label).toBe('simple-integer')
	expect(arg.type).toBe(defaultTypes[2])

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
	const arg = new Arg<string>(defaultTypes, {
		label: 'ranged-integer',
		description: `A ranged integer this time`,
		type: 'int',
		min: -30,
		max: 50
	})

	expect(arg.label).toBe('ranged-integer')
	expect(arg.type.name).toBe(defaultTypes[2].name)
	expect(arg.type.description).toBe(defaultTypes[2].description)
	expect(arg.type.label).toBe(defaultTypes[2].label)

	const n1 = await arg.parse('123')
	const n2 = await arg.parse('-654')
	const n3 = await arg.parse('18')
	const n4 = await arg.parse('+0')
	const n5 = await arg.parse('-2')

	expect(n1.error.info).toBe(`Argument must be equal to or less than 50`)
	expect(n2.error.info).toBe(`Argument must be equal to or greater than -30`)
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
	const arg = new Arg<string>(defaultTypes, {
		label: 'limited-text',
		description: `A ranged integer this time`,
		type: 'text',
		min: 10,
		max: 50
	})

	expect(arg.label).toBe('limited-text')
	expect(arg.type.name).toBe(defaultTypes[1].name)
	expect(arg.type.description).toBe(defaultTypes[1].description)
	expect(arg.type.label).toBe(defaultTypes[1].label)

	const n1 = await arg.parse('abc')
	const n2 = await arg.parse('"hello!" and then more characters')
	const n3 = await arg.parse('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
	const n4 = await arg.parse('Hello world!')
	const n5 = await arg.parse('"Omae wa mou shindeiru."')

	expect(n1.error.info).toBe(`Argument must have a minimum of 10 characters`)
	expect(n2.error.info).toBe(`Argument must have a minimum of 10 characters`)
	expect(n3.error.info).toBe(`Argument must have a maximum of 50 characters`)
	expect(n4.error).toBe(null)
	expect(n5.error).toBe(null)

	expect(n1.result).toBe(null)
	expect(n2.result).toBe(null)
	expect(n3.result).toBe(null)
	expect(n4.result).toBe('Hello world!')
	expect(n5.result).toBe('Omae wa mou shindeiru.')
})


test('Argument object: one of several texts to choose from', async () => {
	const arg = new Arg<string>(defaultTypes, {
		label: 'hello-text',
		description: `Is it hello or world?`,
		type: 'text',
		oneOf: ['hello!', 'hello world!', 'ZA WARUDO', 'shindeiru.']
	})

	expect(arg.label).toBe('hello-text')

	const guess1 = await arg.parse('hello!...')
	const guess2 = await arg.parse('"hello!"...')
	const guess3 = await arg.parse('ZA WARUDO')
	const guess4 = await arg.parse('`shindeiru.` \'other unrelated thing\'')
	
	expect(guess1.error.info).toBe(`Argument has to be one of the following values: "hello!", "hello world!", "ZA WARUDO", "shindeiru.", recieved "hello!..." instead`)
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
		new Arg<string>(defaultTypes, {
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
		new Arg<string>(defaultTypes, {
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