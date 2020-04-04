import { colors } from '../src/colors';

test('Regex: word-link', () => {
	console.log(
		`${colors.Bright}Test${colors.Reset}: ${colors.FgYellow}Hello world${colors.FgRed}!${colors.Reset}`
	);

	expect('word-link'.match(/\w+/g)).toBe(['word', 'link']);
});
