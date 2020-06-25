import {ServerConfig} from './ServerConfig';

export type UserDataRequest = {
  req: object,
  fileList: Array<string>,
  redisClient: any,
  config: ServerConfig
}