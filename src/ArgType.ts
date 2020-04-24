import { Parser } from 'parsers-ts';

/** A type for arguments. */
export interface ArgType<T> {
	/** The name of the argument type, which is what to enter in any ArgInfo type. */
	name: string;
	/** The label of the argument type. */
	label: string;
	/** The description of the argument type. */
	description: string;
	/** The parser of the argument type. */
	parser: Parser<T>;
}

/** Changes the parser of an ArgType. */
export const changeArgParser = <T>(type: ArgType<T>, newParser: Parser<T>) => {
	const newType = { ...type };
	newType.parser = newParser;
	return newType;
};

/** Literally a list of argument types with one more function that helps to find types. */
export class ArgTypeTuple<T extends any[]> extends Array<ArgType<T[number]>> {
	/** Creates an ArgTypeTuple object. */
	constructor(...types: ArgType<T[number]>[]) {
		super(...types);
	}

	/** Searches for an argument type by name in a given list. */
	getType(name: string) {
		const filtered = this.filter((type) => type.name === name);
		if (filtered.length > 1)
			throw `Two or more argument types have the same name: '${name}'`;
		else if (filtered.length < 1)
			throw `No argument with name '${name}' has been found`;

		return filtered[0] as ArgType<T[number]>;
	}
}
