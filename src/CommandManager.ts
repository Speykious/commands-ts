import { Command, CommandResult } from "./Command";
import { choice, Parser, ParserState } from "parsers-ts";

export class CommandManager extends Array<Command> {
	public parser: Parser<CommandResult>

	constructor(...commands: Command[]) {
		super(...commands)

		this.parser = choice(...commands.map(command => command.nameParser))
		.mapError(`Command not found`)
		.chain(command => command.parser)
	}

	/** CommandManager parser function. */
	parse(targetString: string, index: number = 0) {
		return this.parser.transformer(new ParserState(targetString, index))
	}
}