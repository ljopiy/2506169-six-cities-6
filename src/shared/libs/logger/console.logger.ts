import { Logger } from './logger.interface.js';
import { getErrorMessage } from '../../helpers/index.js';

export class ConsoleLogger implements Logger {
  public debug(message: string, ...args: unknown[]): void {
    console.debug(message, ...args);
  }

  public error(message: string, error: Error, ...args: unknown[]): void {
    console.error(message, ...args);

    if (error instanceof Error) {
      console.error(`Error message: ${getErrorMessage(error)}`);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    console.info(message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    console.warn(message, ...args);
  }
}
