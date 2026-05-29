import { inject, injectable } from 'inversify';
import { Command } from './command.interface.js';
import { TSVFileReader, TSVFileReaderEvent } from '../../shared/libs/file-reader/index.js';
import { createOffer, getMongoURI } from '../../shared/helpers/index.js';
import { Config, RestSchema } from '../../shared/libs/config/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { OfferService } from '../../shared/modules/offer/index.js';
import { DatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger } from '../../shared/libs/logger/index.js';
import { Component } from '../../shared/types/index.js';
import { CreateUserDto } from '../../shared/modules/user/dto/create-user.dto.js';
import { Offer } from '../../shared/types/index.js';
import { COMMAND_BEGINNING } from '../cli.constant.js';

const COMMAND_NAME = `${COMMAND_BEGINNING}import`;
const DEFAULT_USER_PASSWORD = '123456';
const DB_URI_ARGS_COUNT = 2;
const DB_PARAMS_ARGS_COUNT = 6;

@injectable()
export class ImportCommand implements Command {
  private salt!: string;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);
  }

  public getName(): string {
    return COMMAND_NAME;
  }

  public async execute(
    fileName: string,
    ...params: string[]
  ): Promise<void> {
    const { uri, salt } = this.resolveConnectionOptions(params);

    this.salt = salt;

    this.logger.info('Trying to connect to MongoDB…');

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(fileName.trim());
    fileReader.on(TSVFileReaderEvent.Row, this.onImportedLine);
    fileReader.on(TSVFileReaderEvent.End, this.onCompleteImport);

    try {
      await fileReader.read();
    } catch (error) {
      this.logger.error(
        `Can't import data from file: ${fileName}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async onImportedLine(line: string, resolve: () => void): Promise<void> {
    const offer = createOffer(line);
    await this.saveOffer(offer);
    resolve();
  }

  private async onCompleteImport(count: number): Promise<void> {
    this.logger.info(`${count} rows imported`);
    await this.databaseClient.disconnect();
  }

  private async saveOffer(offer: Offer): Promise<void> {
    const user = await this.userService.findOrCreate(this.createUserPayload(offer), this.salt);

    await this.offerService.create({
      title: offer.title,
      description: offer.description,
      postDate: offer.postDate,
      city: offer.city,
      previewUrl: offer.previewUrl,
      images: offer.images,
      isPremium: offer.isPremium,
      isFavorite: offer.isFavorite,
      rating: offer.rating,
      type: offer.type,
      roomsCount: offer.roomsCount,
      guestsCount: offer.guestsCount,
      price: offer.price,
      conveniences: offer.conveniences,
      authorId: user.id,
      commentsCount: offer.commentsCount,
      coordinates: offer.coordinates
    });
  }

  private createUserPayload(offer: Offer): CreateUserDto {
    return {
      name: offer.author.name,
      email: offer.author.email,
      type: offer.author.type,
      password: this.extractAuthorPassword(offer)
    };
  }

  private extractAuthorPassword(offer: Offer): string {
    const authorPassword = Reflect.get(offer.author, 'password');
    return (typeof authorPassword === 'string' && authorPassword.length > 0)
      ? authorPassword
      : DEFAULT_USER_PASSWORD;
  }

  private resolveConnectionOptions(args: string[]): { uri: string; salt: string } {
    if (args.length === 0) {
      return this.getConnectionOptionsFromEnv();
    }

    if (args.length === DB_URI_ARGS_COUNT) {
      const [uri, salt] = args;
      return { uri, salt };
    }

    if (args.length === DB_PARAMS_ARGS_COUNT) {
      const [login, password, host, port, dbName, salt] = args;

      const uri = getMongoURI(
        login,
        password,
        host,
        port,
        dbName
      );

      return { uri, salt };
    }

    throw new Error(
      'Invalid number of arguments for --import command. Use env variables or: <uri> <salt> | <user> <password> <host> <port> <db> <salt>.'
    );
  }

  private getConnectionOptionsFromEnv(): { uri: string; salt: string } {
    const uri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME')
    );

    return {
      uri,
      salt: this.config.get('SALT')
    };
  }
}
