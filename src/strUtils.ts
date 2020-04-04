export const pad = (n: number | string, width: number, z = '0') => {
	n = n + '';
	if (n.length >= width) return n;
	else return new Array(width - n.length + 1).join(z) + n;
}

export const shiftSpaces = (s: string) => {
	let match = s.match(/^\s+/);
	if (match) s = s.slice(match[0].length);
	return s;
}