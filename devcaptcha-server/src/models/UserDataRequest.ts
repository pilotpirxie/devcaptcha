import {UserDataRequestConfig} from './UserDataRequestConfig';

export type UserDataRequest = {
  req: object,
  fileList: Array<string>,
  redisClient: any,
  config: UserDataRequestConfig
}