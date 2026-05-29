import { Command } from './commands/command.interface.js';
import { CommandParser } from './command-parser.js';
import { COMMAND_BEGINNING } from './cli.constant.js';

const DEFAULT_COMMAND = `${COMMAND_BEGINNING}help`;

type CommandCollection = Record<string, Command>;

export class CLIApplication {
  private commands: CommandCollection = {};

  constructor(
    private readonly defaultCommand: string = DEFAULT_COMMAND
  ) { }

  public registerCommands(commandsList: Command[]): void {
    commandsList.forEach((command) => {
      const commandName: string = command.getName();

      if (Object.hasOwn(this.commands, commandName)) {
        throw new Error(`Command ${commandName} is already registered`);
      }
      this.commands[commandName] = command;
    });
  }

  public async executeCommand(argv: string[]): Promise<void> {
    const parsedCommand = CommandParser.parse(argv);
    const [commandName] = Object.keys(parsedCommand);
    const command = this.getCommand(commandName);
    const commandArguments = parsedCommand[commandName] ?? [];
    await command.execute(...commandArguments);
  }

  private getCommand(commandName: string): Command {
    return this.commands[commandName] ?? this.getDefaultCommand();
  }

  private getDefaultCommand(): Command | never {
    if (!this.commands[this.defaultCommand]) {
      throw new Error(`The default command (${this.defaultCommand}) is not registered.`);
    }
    return this.commands[this.defaultCommand];
  }
}
