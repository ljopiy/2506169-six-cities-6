import { injectable } from 'inversify';
import { Command } from './command.interface.js';
import { COMMAND_BEGINNING } from '../cli.constant.js';
import chalk from 'chalk';

const COMMAND_NAME = `${COMMAND_BEGINNING}help`;

@injectable()
export class HelpCommand implements Command {
  public getName(): string {
    return COMMAND_NAME;
  }

  public async execute(..._parameters: string[]): Promise<void> {
    console.info(chalk.greenBright(`
        Программа для подготовки данных для REST API сервера.
        Пример:
            cli.js --<command> [--arguments]
        Команды:

            --version: # выводит номер версии
            --help: # печатает текст
            --import <path> # импортирует данные из TSV в MongoDB (параметры подключения из .env)
            --import <path> <db-uri> <salt> # импортирует данные из TSV в MongoDB
            --import <path> <user> <password> <host> <port> <db> <salt> # импортирует данные из TSV в MongoDB (параметры подключения отдельно)
            --generate <n> <path> <url> # генерирует произвольное количество тестовых данных
    `));
  }
}
