import { Option } from '../src/Option'
import { defaultTypes } from '../src/defaultTypes'

test('Options: simple - professeur', () => {
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
