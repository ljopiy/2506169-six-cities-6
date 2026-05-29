import { WriteStream } from 'node:fs';
import { createWriteStream } from 'node:fs';
import { FileWriter } from './file-writer.interface.js';
import { ENCODING } from '../../../cli/cli.constant.js';

export class TSVFileWriter implements FileWriter {
  private stream: WriteStream;

  constructor(filename: string) {
    this.stream = createWriteStream(filename, {
      flags: 'w',
      encoding: ENCODING,
      autoClose: true,
    });
  }

  public async write(row: string): Promise<unknown> {
    const isWriteSuccess = this.stream.write(`${row}\n`);
    if (!isWriteSuccess) {
      return new Promise((resolve) => {
        this.stream.once('drain', () => resolve(true));
      });
    }

    return Promise.resolve();
  }
}
