export const isOneOf = <T>(value: T, array: T[]) =>
	array.some((v) => v === value)
