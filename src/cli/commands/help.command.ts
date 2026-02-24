import { Command } from './command.interface.js';
import chalk from 'chalk';

export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public async execute(..._parameters: string[]): Promise<void> {
    console.info(`
        ${chalk.bold('Программа для подготовки данных для REST API сервера.')}
        ${chalk.yellow('Пример:')}
            main.cli.js --<command> [--arguments]
        ${chalk.yellow('Команды:')}
            ${chalk.green('--version:')}
            ${chalk.green('--help:')}
            ${chalk.green('--import <path>:')}
    `);
  }
}
