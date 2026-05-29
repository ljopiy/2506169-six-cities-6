import { injectable } from 'inversify';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from './command.interface.js';
import { COMMAND_BEGINNING, ENCODING } from '../cli.constant.js';
import chalk from 'chalk';

const COMMAND_NAME = `${COMMAND_BEGINNING}version`;
const PACKAGE_JSON_FILEPATH = './package.json';

type PackageJSONConfig = {
  version: string;
}

function isPackageJSONConfig(value: unknown): value is PackageJSONConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.hasOwn(value, 'version')
  );
}

@injectable()
export class VersionCommand implements Command {
  constructor(
    private readonly filePath: string = PACKAGE_JSON_FILEPATH
  ) { }

  public getName(): string {
    return COMMAND_NAME;
  }

  public async execute(..._parameters: string[]): Promise<void> {
    try {
      const version = this.readVersion();
      console.info(chalk.green(version));
    } catch (error: unknown) {
      console.error(chalk.red(`Failed to read version from ${this.filePath}`));

      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
    }
  }

  private readVersion(): string {
    const jsonContent = readFileSync(resolve(this.filePath), ENCODING);
    const importedContent: unknown = JSON.parse(jsonContent);

    if (!isPackageJSONConfig(importedContent)) {
      throw new Error('Failed to parse json content.');
    }

    return importedContent.version;
  }
}
