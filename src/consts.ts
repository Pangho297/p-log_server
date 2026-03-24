export const SERVER_ENV = process.env.SERVER_ENV || 'development';
export const IS_LOCAL = SERVER_ENV === 'development';
export const PORT = process.env.PORT || 3001;
export const SWAGGER_FILE_PATH =
  process.env.SWAGGER_FILE_PATH || './swagger.json';

