import { Command } from '../src/Command'
import { defaultTypes } from '../src/defaultTypes'

const somewords = new Command(defaultTypes, {
	name: 'three-words',
	description: 'Logs three words... And maybe more?',

	arguments: [
		{
			name: 'first',
			description: 'The first word',
			type: 'word'
		},
		{
			name: 'second',
			description: 'The second word',
			type: 'word'
		},
		{
			name: 'third',
			description: 'The third word',
			type: 'word'
		}
	],

	options: [
		{
			name: 'two-more',
			description: 'Two more words!',
			short: '2',
			arguments: [
				{
					name: '2-first',
					description: 'The first optional word',
					type: 'word'
				},
				{
					name: '2-second',
					description: 'The second optional word',
					type: 'word'
				}
			]
		}
	],

	execute: (input) => undefined //console.log(input)
})

test('First Command Ever', async () => {
	const fail1 = somewords.parse('not enough')
	const fail2 = somewords.parse('not enough --two-more with option')
	const fail3 = somewords.parse('--two-more without enough arguments')
	const fail4 = somewords.parse('not enough in --two-more option')

	expect(fail1.result).toBe(undefined)
	expect(fail2.result).toBe(undefined)
	expect(fail3.result).toBe(undefined)
	expect(fail4.result).toBe(undefined)

	expect(fail1.error.info).toBe(
		'Argument n°3 from command "three-words" is invalid'
	)
	expect(fail2.error.info).toBe(
		'Argument n°3 from command "three-words" is invalid'
	)
	expect(fail3.error.info).toBe(
		'Argument n°2 from command "three-words" is invalid'
	)
	expect(fail4.error.info).toBe(
		'Argument n°2 from option "two-more" is invalid'
	)

	const success1 = somewords.parse('that is enough')
	const success2 = somewords.parse(
		'--two-more at start parsing with option'
	)
	const success3 = somewords.parse(
		'parsing --two-more at midleft with option'
	)
	const success4 = somewords.parse(
		'parsing with --two-more at midright option'
	)
	const success5 = somewords.parse(
		'parsing with option --two-more at end'
	)

	/*console.log(
		JSON.stringify(fail2, undefined, '  '),
		JSON.stringify(fail4, undefined, '  '),
		JSON.stringify(success1, undefined, '  '),
		JSON.stringify(success3, undefined, '  ')
	)*/

	expect(success1.error).toBe(undefined)
	expect(success2.error).toBe(undefined)
	expect(success3.error).toBe(undefined)
	expect(success4.error).toBe(undefined)
	expect(success5.error).toBe(undefined)

	expect(success1.result.opts).toEqual([])
	expect(success2.result.opts).toEqual([
		{
			type: 'opt',
			name: 'two-more',
			argsResults: [
				{
					type: 'arg',
					name: '2-first',
					value: 'at'
				},
				{
					type: 'arg',
					name: '2-second',
					value: 'start'
				}
			]
		}
	])
	expect(success3.result.opts).toEqual([
		{
			type: 'opt',
			name: 'two-more',
			argsResults: [
				{
					type: 'arg',
					name: '2-first',
					value: 'at'
				},
				{
					type: 'arg',
					name: '2-second',
					value: 'midleft'
				}
			]
		}
	])
	expect(success4.result.opts).toEqual([
		{
			type: 'opt',
			name: 'two-more',
			argsResults: [
				{
					type: 'arg',
					name: '2-first',
					value: 'at'
				},
				{
					type: 'arg',
					name: '2-second',
					value: 'midright'
				}
			]
		}
	])
	expect(success5.result.opts).toEqual([
		{
			type: 'opt',
			name: 'two-more',
			argsResults: [
				{
					type: 'arg',
					name: '2-first',
					value: 'at'
				},
				{
					type: 'arg',
					name: '2-second',
					value: 'end'
				}
			]
		}
	])
})
