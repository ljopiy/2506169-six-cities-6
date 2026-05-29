import { COMMAND_BEGINNING } from './cli.constant.js';

type ParsedCommand = Record<string, string[]>

export class CommandParser {
  static parse(cliArguments: string[]): ParsedCommand {
    const parsedCommand: ParsedCommand = {};
    let command = '';

    cliArguments.forEach((argument) => {
      if (argument.startsWith(COMMAND_BEGINNING)) {
        parsedCommand[argument] = [];
        command = argument;
      } else if (command && argument) {
        parsedCommand[command].push(argument);
      }
    });

    return parsedCommand;
  }
}
