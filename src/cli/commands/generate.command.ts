import { injectable } from 'inversify';
import got from 'got';
import chalk from 'chalk';
import { Command } from './command.interface.js';
import { MockServerData } from '../../shared/types/index.js';
import { TSVOfferGenerator } from '../../shared/libs/offer-generation/index.js';
import { getErrorMessage } from '../../shared/helpers/index.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/index.js';
import { COMMAND_BEGINNING } from '../cli.constant.js';

const COMMAND_NAME = `${COMMAND_BEGINNING}generate`;

@injectable()
export class GenerateCommand implements Command {
  private initialData: MockServerData;

  public getName(): string {
    return COMMAND_NAME;
  }

  public async execute(...params: string[]): Promise<void> {
    const [count, filepath, url] = params;
    const offerCount = Number.parseInt(count, 10);

    try {
      await this.load(url);
      await this.write(filepath, offerCount);
      console.info(chalk.greenBright(`File ${filepath} was created!`));
    } catch (error: unknown) {
      console.error(chalk.red('Can\'t generate data'));
      console.error(chalk.red(getErrorMessage(error)));
    }
  }

  private async load(url: string) {
    try {
      this.initialData = await got.get(url).json();
    } catch {
      throw new Error(`Can't load data from ${url}`);
    }
  }

  private async write(filepath: string, offerCount: number) {
    const tsvOfferGenerator = new TSVOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());
    }
  }
}
