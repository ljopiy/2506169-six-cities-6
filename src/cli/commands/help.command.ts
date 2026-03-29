import { Command } from './command.interface.js';
import chalk from 'chalk';
export class HelpCommand implements Command {
  public getName(): string {
    return '--help';
  }

  public async execute(..._parameters: string[]): Promise<void> {
    console.info(chalk.greenBright(`
        Программа для подготовки данных для REST API сервера.
        Пример:
            cli.js --<command> [--arguments]
        Команды:
            --version:                   # выводит номер версии
            --help:                      # печатает этот текст
            --import <path> <db-uri> <salt> # импортирует данные из TSV в MongoDB
            --import <path> <user> <password> <host> <db> <salt> # импортирует данные из TSV в MongoDB (параметры подключения отдельно)
            --generate <n> <path> <url>  # генерирует произвольное количество тестовых данных
    `));
  }
}
