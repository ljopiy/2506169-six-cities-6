import EventEmitter from 'node:events';
import { ReadStream, createReadStream } from 'node:fs';
import { FileReader } from './file-reader.interface.js';
import { TSVFileReaderEvent } from './file-reader.constant.js';
import { ENCODING } from '../../../cli/cli.constant.js';

const CHUNK_SIZE = 16384;

export class TSVFileReader extends EventEmitter implements FileReader {
  private stream: ReadStream;

  constructor(private readonly filePath: string) {
    super();

    this.stream = createReadStream(this.filePath, {
      encoding: ENCODING,
      highWaterMark: CHUNK_SIZE
    });
  }

  public async read(): Promise<void> {
    let remainingData = '';
    let nextLinePosition = -1;
    let importedRowCount = 0;

    for await (const chunk of this.stream) {
      remainingData += chunk.toString();

      while ((nextLinePosition = remainingData.indexOf('\n')) >= 0) {
        const completeRow = remainingData.slice(0, nextLinePosition + 1);
        remainingData = remainingData.slice(++nextLinePosition);
        importedRowCount++;

        await new Promise((resolve) => {
          this.emit(TSVFileReaderEvent.Row, completeRow, resolve);
        });
      }
    }

    if (remainingData.length > 0) {
      importedRowCount++;
      await new Promise((resolve) => {
        this.emit(TSVFileReaderEvent.Row, remainingData, resolve);
      });
    }

    this.emit(TSVFileReaderEvent.End, importedRowCount);
  }
}
