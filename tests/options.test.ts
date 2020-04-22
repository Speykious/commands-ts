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

test('Options: with arguments - answer', () => {
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