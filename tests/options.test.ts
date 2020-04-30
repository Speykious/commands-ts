import { Opt } from '../src/Opt'
import { defaultTypes } from '../src/defaultTypes'

test('Options: without arguments - professeur', async () => {
	const opProf = new Opt(defaultTypes, {
		name: 'professeur',
		description: `Si l'utilisateur est un professeur.`,
		short: 'p'
	})

	const long1 = opProf.parse('--professeur')
	const long2 = opProf.parse('--professeur ...then waste of string')
	const long3 = opProf.parse('--professeurextendedquimarche')

	expect(!!long1.result).toBe(true)
	expect(!!long2.result).toBe(true)
	expect(!!long3.result).toBe(true)

	const short1 = opProf.parse('-p')
	const short2 = opProf.parse('-p ...then waste of string')
	const short3 = opProf.parse('-pextendedquimarche')

	expect(!!short1.result).toBe(true)
	expect(!!short2.result).toBe(true)
	expect(!!short3.result).toBe(true)
})

test('Options: with one argument - answer', async () => {
	const opProf = new Opt(defaultTypes, {
		name: 'answer',
		description: `To answer yes, or no.`,
		short: 'a',
		arguments: [
			{
				name: 'answer',
				description: 'The answer: yes, or no.',
				type: 'word',
				oneOf: ['yes', 'no']
			}
		]
	})

	const long1 = opProf.fullParse('--answer')
	const long2 = opProf.fullParse('--answer ...then waste of string')
	const long3 = opProf.fullParse('--answer yes')
	const long4 = opProf.fullParse('--ansnbhvf')

	//console.log(long1, long2, long3, long4)

	expect(long1.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(long2.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(long3.error).toBe(null)
	expect(long4.error.info).toBe('Unable to match with any parser')

	expect(long1.result).toBe(null)
	expect(long2.result).toBe(null)

	expect(long3.result.argsResults).toEqual([
		{
			type: 'arg',
			name: 'answer',
			value: 'yes'
		}
	])
	expect(long4.result).toBe(null)

	const short1 = opProf.fullParse('-a')
	const short2 = opProf.fullParse('-a ...then waste of string')
	const short3 = opProf.fullParse('-a yes')
	const short4 = opProf.fullParse('-ahjivf')

	expect(short1.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(short2.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(short3.error).toBe(null)
	expect(short4.error.info).toBe('Argument n°1 from option "answer" is invalid')

	expect(short1.result).toBe(null)
	expect(short2.result).toBe(null)
	expect(short3.result.argsResults).toEqual([
		{
			type: 'arg',
			name: 'answer',
			value: 'yes'
		}
	])
	expect(short4.result).toBe(null)
})

test('Options: with multiple arguments - answer', async () => {
	const quizz = new Opt(defaultTypes, {
		name: 'Quizz',
		description: `Answer 4 questions!`,
		short: 'Q',
		arguments: [
			{
				name: 'meth',
				description: '1 + 1 = 3.',
				type: 'word',
				oneOf: ['true', 'false'],
				error: `U hav to say tru or fals`
			},
			{
				name: 'maths',
				description: '1 + 1 = ?',
				type: 'int',
				filter: {
					fn: (result) => result === 2,
					error: `Wrong answer. It was 2!`
				}
			},
			{
				name: 'culprit',
				description: 'Who was the culprit?',
				type: 'word',
				oneOf: ['Kuriminaru'],
				error: `Wrong... The culprit was Kuriminaru!!`
			},
			{
				name: 'japanese',
				description: 'What does 九千九百九十九 mean?',
				type: 'word',
				oneOf: ['9999'],
				error: `Wroooong. It means 9999!!`
			}
		]
	})

	const long_alright = quizz.fullParse(`--Quizz false 2 Kuriminaru 9999`)
	const long_false1 = quizz.fullParse(`--Quizz neither 2 Kuriminaru 9999`)
	const long_false2 = quizz.fullParse(`--Quizz false 5 Kuriminaru 9999`)
	const long_false3 = quizz.fullParse(`--Quizz false 2 Innosento 9999`)
	const long_false4 = quizz.fullParse(`--Quizz false 2 Kuriminaru banana`)

	expect(long_alright.error).toBe(null)
	expect(long_alright.result.argsResults).toEqual([
		{
			type: 'arg',
			name: 'meth',
			value: 'false'
		},
		{
			type: 'arg',
			name: 'maths',
			value: 2
		},
		{
			type: 'arg',
			name: 'culprit',
			value: 'Kuriminaru'
		},
		{
			type: 'arg',
			name: 'japanese',
			value: '9999'
		}
	])

	expect(long_false1.error.info).toBe(
		'Argument n°1 from option "Quizz" is invalid'
	)
	expect(long_false2.error.info).toBe(
		'Argument n°2 from option "Quizz" is invalid'
	)
	expect(long_false3.error.info).toBe(
		'Argument n°3 from option "Quizz" is invalid'
	)
	expect(long_false4.error.info).toBe(
		'Argument n°4 from option "Quizz" is invalid'
	)

	expect(long_false1.error.argInfo).toBe(`U hav to say tru or fals`)
	expect(long_false2.error.argInfo).toBe(`Wrong answer. It was 2!`)
	expect(long_false3.error.argInfo).toBe(
		`Wrong... The culprit was Kuriminaru!!`
	)
	expect(long_false4.error.argInfo).toBe(`Wroooong. It means 9999!!`)

	expect(long_false1.result).toBe(null)
	expect(long_false2.result).toBe(null)
	expect(long_false3.result).toBe(null)
	expect(long_false4.result).toBe(null)

	const short_alright = quizz.fullParse(`-Q false 2 Kuriminaru 9999`)
	const short_false1 = quizz.fullParse(`-Q neither 2 Kuriminaru 9999`)
	const short_false2 = quizz.fullParse(`-Q false 5 Kuriminaru 9999`)
	const short_false3 = quizz.fullParse(`-Q false 2 Innosento 9999`)
	const short_false4 = quizz.fullParse(`-Q false 2 Kuriminaru banana`)

	expect(short_alright.error).toBe(null)
	expect(short_alright.result.argsResults).toEqual([
		{
			type: 'arg',
			name: 'meth',
			value: 'false'
		},
		{
			type: 'arg',
			name: 'maths',
			value: 2
		},
		{
			type: 'arg',
			name: 'culprit',
			value: 'Kuriminaru'
		},
		{
			type: 'arg',
			name: 'japanese',
			value: '9999'
		}
	])

	expect(short_false1.error.info).toBe(
		'Argument n°1 from option "Quizz" is invalid'
	)
	expect(short_false2.error.info).toBe(
		'Argument n°2 from option "Quizz" is invalid'
	)
	expect(short_false3.error.info).toBe(
		'Argument n°3 from option "Quizz" is invalid'
	)
	expect(short_false4.error.info).toBe(
		'Argument n°4 from option "Quizz" is invalid'
	)

	expect(short_false1.error.argInfo).toBe(`U hav to say tru or fals`)
	expect(short_false2.error.argInfo).toBe(`Wrong answer. It was 2!`)
	expect(short_false3.error.argInfo).toBe(
		`Wrong... The culprit was Kuriminaru!!`
	)
	expect(short_false4.error.argInfo).toBe(`Wroooong. It means 9999!!`)

	expect(short_false1.result).toBe(null)
	expect(short_false2.result).toBe(null)
	expect(short_false3.result).toBe(null)
	expect(short_false4.result).toBe(null)
})
