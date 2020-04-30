import { choice, Parser, ParserState } from "parsers-ts";
import { Command, CommandResult, CommandInfo } from "./Command";
import { ArgTypeTuple } from "./ArgType";

export class CommandManager extends Array<Command> {
	public types: ArgTypeTuple<any[]>
	public parser: Parser<CommandResult>

	constructor(types: ArgTypeTuple<any[]>, commandinfos: CommandInfo[]) {
		super(...commandinfos.map(commandinfo => new Command(types, commandinfo)))
		this.types = types

		this.parser = choice(...this.map(command => command.nameParser))
		.mapError(`Command not found`)
		.chain(command => command.parser)
	}

	/** CommandManager parser function. */
	parse(targetString: string, index: number = 0) {
		return this.parser.transformer(new ParserState(targetString, index))
	}

	/** Parses a string and executes the command. If the command isn't valid, it calls the errorCallback. */
	runSync(targetString: string, errorCallback: (state: ParserState<CommandResult>) => any) {
		const state = this.parse(targetString)
		if (state.error) return errorCallback(state)
		state.result.execute(state.result)
	}

	/** Parses a string and executes the command. If the command isn't valid, it Promise.reject's the state. */
	async run(targetString: string) {
		const state = this.parse(targetString)
		if (state.error) return Promise.reject(state)
		state.result.execute(state.result)
		return Promise.resolve(state)
	}
}