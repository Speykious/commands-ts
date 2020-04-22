import { Option } from '../src/Option'
import { defaultTypes } from '../src/defaultTypes'

test('Options: without arguments - professeur', () => {
	const opProf = new Option(defaultTypes, {
		name: 'professeur',
		description: `Si l'utilisateur est un professeur.`,
		short: 'p'
	})

	const long1 = opProf.parse("--professeur")
	const long2 = opProf.parse("--professeur ...then waste of string")
	const long3 = opProf.parse("--professeurextendedquimarche")

	expect(long1.result).toBe(true)
	expect(long2.result).toBe(true)
	expect(long3.result).toBe(true)

	const short1 = opProf.parse("-p")
	const short2 = opProf.parse("-p ...then waste of string")
	const short3 = opProf.parse("-pextendedquimarche")

	expect(short1.result).toBe(true)
	expect(short2.result).toBe(true)
	expect(short3.result).toBe(true)
})

test('Options: with one argument - answer', () => {
	const opProf = new Option(defaultTypes, {
		name: 'answer',
		description: `To answer yes, or no.`,
		short: 'a',
		arguments: [
			{
				label: 'answer',
				description: 'The answer: yes, or no.',
				type: 'word',
				oneOf: ['yes', 'no']
			}
		]
	})

	const long1 = opProf.parse("--answer")
	const long2 = opProf.parse("--answer ...then waste of string")
	const long3 = opProf.parse("--answer yes")
	const long4 = opProf.parse("--ansnbhvf")

	expect(long1.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(long2.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(long3.error).toBe(null)
	expect(long4.error.info).toBe('Option "answer" parsing failed')

	expect(long1.result).toBe(null)
	expect(long2.result).toBe(null)
	expect(long3.result).toEqual(['yes'])
	expect(long4.result).toBe(null)

	const short1 = opProf.parse("-a")
	const short2 = opProf.parse("-a ...then waste of string")
	const short3 = opProf.parse("-a yes")
	const short4 = opProf.parse("-ahjivf")

	expect(short1.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(short2.error.info).toBe('Argument n°1 from option "answer" is invalid')
	expect(short3.error).toBe(null)
	expect(short4.error.info).toBe('Argument n°1 from option "answer" is invalid')

	expect(short1.result).toBe(null)
	expect(short2.result).toBe(null)
	expect(short3.result).toEqual(['yes'])
	expect(short4.result).toBe(null)
})

test('Options: with multiple arguments - answer', () => {
	const quizz = new Option(defaultTypes, {
		name: 'Quizz',
		description: `Answer 4 questions!`,
		short: 'Q',
		arguments: [
			{
				label: 'meth',
				description: '1 + 1 = 3.',
				type: 'word',
				oneOf: ['true', 'false'],
				error: `U hav to say tru or fals`
			},
			{
				label: 'maths',
				description: '1 + 1 = ?',
				type: 'int',
				filter: {
					fn: result => result === 2,
					error: `Wrong answer. It was 2!`
				}
			},
			{
				label: 'culprit',
				description: 'Who was the culprit?',
				type: 'word',
				oneOf: ['Kuriminaru'],
				error: `Wrong... The culprit was Kuriminaru!!`
			},
			{
				label: 'japanese',
				description: 'What does 九千九百九十九 mean?',
				type: 'word',
				oneOf: ['9999'],
				error: `Wroooong. It means 9999!!`
			},
		]
	})



	const long_alright = quizz.parse(`--Quizz false 2 Kuriminaru 9999`)
	const long_false1 = quizz.parse(`--Quizz neither 2 Kuriminaru 9999`)
	const long_false2 = quizz.parse(`--Quizz false 5 Kuriminaru 9999`)
	const long_false3 = quizz.parse(`--Quizz false 2 Innosento 9999`)
	const long_false4 = quizz.parse(`--Quizz false 2 Kuriminaru banana`)
	
	expect(long_alright.error).toBe(null)
	expect(long_alright.result).toEqual(['false', 2, 'Kuriminaru', '9999'])

	expect(long_false1.error.info).toBe('Argument n°1 from option "Quizz" is invalid')
	expect(long_false2.error.info).toBe('Argument n°2 from option "Quizz" is invalid')
	expect(long_false3.error.info).toBe('Argument n°3 from option "Quizz" is invalid')
	expect(long_false4.error.info).toBe('Argument n°4 from option "Quizz" is invalid')

	expect(long_false1.error.argInfo).toBe(`U hav to say tru or fals`)
	expect(long_false2.error.argInfo).toBe(`Wrong answer. It was 2!`)
	expect(long_false3.error.argInfo).toBe(`Wrong... The culprit was Kuriminaru!!`)
	expect(long_false4.error.argInfo).toBe(`Wroooong. It means 9999!!`)

	expect(long_false1.result).toBe(null)
	expect(long_false2.result).toBe(null)
	expect(long_false3.result).toBe(null)
	expect(long_false4.result).toBe(null)



	const short_alright = quizz.parse(`-Q false 2 Kuriminaru 9999`)
	const short_false1 = quizz.parse(`-Q neither 2 Kuriminaru 9999`)
	const short_false2 = quizz.parse(`-Q false 5 Kuriminaru 9999`)
	const short_false3 = quizz.parse(`-Q false 2 Innosento 9999`)
	const short_false4 = quizz.parse(`-Q false 2 Kuriminaru banana`)
	
	expect(short_alright.error).toBe(null)
	expect(short_alright.result).toEqual(['false', 2, 'Kuriminaru', '9999'])

	expect(short_false1.error.info).toBe('Argument n°1 from option "Quizz" is invalid')
	expect(short_false2.error.info).toBe('Argument n°2 from option "Quizz" is invalid')
	expect(short_false3.error.info).toBe('Argument n°3 from option "Quizz" is invalid')
	expect(short_false4.error.info).toBe('Argument n°4 from option "Quizz" is invalid')

	expect(short_false1.error.argInfo).toBe(`U hav to say tru or fals`)
	expect(short_false2.error.argInfo).toBe(`Wrong answer. It was 2!`)
	expect(short_false3.error.argInfo).toBe(`Wrong... The culprit was Kuriminaru!!`)
	expect(short_false4.error.argInfo).toBe(`Wroooong. It means 9999!!`)

	expect(short_false1.result).toBe(null)
	expect(short_false2.result).toBe(null)
	expect(short_false3.result).toBe(null)
	expect(short_false4.result).toBe(null)
})