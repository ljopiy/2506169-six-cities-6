import * as Mongoose from 'mongoose';
import { inject, injectable } from 'inversify';
import { setTimeout } from 'node:timers/promises';
import { DatabaseClient } from './database-client.interface.js';
import { Component } from '../../types/index.js';
import { Logger } from '../logger/index.js';

const RetryConnection = {
  COUNT: 5,
  TIMEOUT: 1000
} as const;

@injectable()
export class MongoDatabaseClient implements DatabaseClient {
  private mongooseConnection: typeof Mongoose;
  private isConnected: boolean;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    this.isConnected = false;
  }

  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnectedToDatabase()) {
      throw new Error('MongoDB client already connected');
    }

    this.logger.info('Trying to connect to MongoDB…');

    let attempt = 0;
    while (attempt < RetryConnection.COUNT) {
      try {
        this.mongooseConnection = await Mongoose.connect(uri);
        this.isConnected = true;
        this.logger.info('Database connection established.');
        return;
      } catch (error) {
        attempt++;
        this.logger.error(
          `Failed to connect to the database. Attempt ${attempt}`,
          error instanceof Error ? error : new Error(String(error))
        );
        await setTimeout(RetryConnection.TIMEOUT);
      }
    }

    throw new Error(`Unable to establish database connection after ${RetryConnection.COUNT}`);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnectedToDatabase()) {
      throw new Error('Not connected to the database');
    }

    await this.mongooseConnection.disconnect?.();
    this.isConnected = false;
    this.logger.info('Database connection closed.');
  }
}
