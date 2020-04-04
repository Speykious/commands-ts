import { colors } from '../src/colors';

test('Regex: word regex matching to "word-link"', () => {
	console.log(
		`${colors.Bright}Test${colors.Reset}: ${colors.FgYellow}Hello world${colors.FgRed}!${colors.Reset}`
	);
	const matches = 'word-link'.match(/\w+/g);
	expect(matches).toEqual(['word', 'link']);
});
