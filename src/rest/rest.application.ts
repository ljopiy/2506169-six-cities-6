import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import cors from 'cors';
import { Logger } from '../shared/libs/logger/index.js';
import { Config, RestSchema } from '../shared/libs/config/index.js';
import { Component } from '../shared/types/index.js';
import { DatabaseClient } from '../shared/libs/database-client/index.js';
import { getFullServerPath, getMongoURI } from '../shared/helpers/index.js';
import { Controller, ExceptionFilter, ParseTokenMiddleware } from '../shared/libs/rest/index.js';
import { StaticRoute, Route } from './rest.constant.js';

@injectable()
export class RestApplication {
  private server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly appExceptionFilter: ExceptionFilter,
    @inject(Component.UserController) private readonly userController: Controller,
    @inject(Component.CommentController) private readonly commentController: Controller,
    @inject(Component.OfferController) private readonly offerController: Controller,
    @inject(Component.AuthExceptionFilter) private readonly authExceptionFilter: ExceptionFilter,
  ) {
    this.server = express();
  }

  private initDb(): Promise<void> {
    const dbUri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(dbUri);
  }

  private initServer(): void {
    const port = this.config.get('PORT');
    this.server.listen(port);
  }

  private initControllers(): void {
    this.server.use(Route.Users, this.userController.router);
    this.server.use(Route.Offers, this.commentController.router);
    this.server.use(Route.Offers, this.offerController.router);
  }

  private initMiddleware(): void {
    const authMiddleware = new ParseTokenMiddleware(this.config.get('JWT_SECRET'));

    this.server.use(express.json());
    this.server.use(cors());
    this.server.use(
      StaticRoute.UploadFiles,
      express.static(this.config.get('UPLOAD_FILES_DIRECTORY'))
    );
    this.server.use(
      StaticRoute.AppFiles,
      express.static(this.config.get('STATIC_FILES_DIRECTORY'))
    );
    this.server.use(authMiddleware.execute.bind(authMiddleware));
  }

  private initExceptionFilters(): void {
    this.server.use(this.authExceptionFilter.catch.bind(this.authExceptionFilter));
    this.server.use(this.appExceptionFilter.catch.bind(this.appExceptionFilter));
  }

  public async init(): Promise<void> {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Init database…');
    await this.initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init app-level middleware');
    this.initMiddleware();
    this.logger.info('App-level middleware initialization completed');

    this.logger.info('Init controllers');
    this.initControllers();
    this.logger.info('Controller initialization completed');

    this.logger.info('Init exception filters');
    this.initExceptionFilters();
    this.logger.info('Exception filters initialization completed');

    this.logger.info('Try to init server…');
    this.initServer();
    this.logger.info(`Server started on ${getFullServerPath(this.config.get('HOST'), this.config.get('PORT'))}`);
  }
}
