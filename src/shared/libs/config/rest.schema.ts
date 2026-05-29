import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

export type RestSchema = {
  PORT: number;
  HOST: string;
  SALT: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_NAME: string;
  UPLOAD_FILES_DIRECTORY: string;
  STATIC_FILES_DIRECTORY: string;
  JWT_SECRET: string;
  JWT_ALGORITHM: string;
  JWT_EXPIRED: string;
}

export const configRestSchema = convict<RestSchema>({
  PORT: {
    doc: 'Port for incoming connections',
    format: 'port',
    env: 'PORT',
    default: 4000
  },
  HOST: {
    doc: 'Host where started service',
    format: String,
    env: 'HOST',
    default: 'localhost'
  },
  SALT: {
    doc: 'Salt for password hash',
    format: String,
    env: 'SALT',
    default: null
  },
  DB_HOST: {
    doc: 'IP address of the database server (MongoDB)',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1'
  },
  DB_USER: {
    doc: 'Username to connect to the database',
    format: String,
    env: 'DB_USER',
    default: null,
  },
  DB_PASSWORD: {
    doc: 'Password to connect to the database',
    format: String,
    env: 'DB_PASSWORD',
    default: null,
  },
  DB_PORT: {
    doc: 'Port to connect to the database (MongoDB)',
    format: 'port',
    env: 'DB_PORT',
    default: '27017',
  },
  DB_NAME: {
    doc: 'Database name (MongoDB)',
    format: String,
    env: 'DB_NAME',
    default: 'six-cities'
  },
  UPLOAD_FILES_DIRECTORY: {
    doc: 'Directory for upload files',
    format: String,
    env: 'UPLOAD_FILES_DIRECTORY',
    default: 'upload'
  },
  STATIC_FILES_DIRECTORY: {
    doc: 'Path to directory with static resources',
    format: String,
    env: 'STATIC_FILES_DIRECTORY',
    default: 'static'
  },
  JWT_SECRET: {
    doc: 'Secret for sign JWT',
    format: String,
    env: 'JWT_SECRET',
    default: null
  },
  JWT_ALGORITHM: {
    doc: 'JWT signing algorithm',
    format: String,
    env: 'JWT_ALGORITHM',
    default: 'HS256'
  },
  JWT_EXPIRED: {
    doc: 'JWT expiration time (for example 2d, 12h)',
    format: String,
    env: 'JWT_EXPIRED',
    default: '2d'
  },
});
