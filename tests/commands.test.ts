import { Command } from '../src/Command';
import { defaultTypes } from '../src/defaultTypes';

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

	execute: (input) => console.log(input)
});

test('First Command Ever', async () => {
	const state1 = await somewords.parse('hello world yay --two-more NO PROBLEM');
	const state2 = await somewords.parse('one two three');

	console.log(
		JSON.stringify(state1, null, '  '),
		JSON.stringify(state2, null, '  ')
	);
});
