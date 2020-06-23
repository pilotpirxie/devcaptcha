import UserDataController from "../lib/UserData";
import {NextFunction, Request, Response} from "express";
const config = require('../../config.json');

import {
  fileList,
  redisClient
} from '../server';

export default {
  challenge: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {challenges} = await UserDataController.getOrSetUserData({
        req,
        fileList,
        redisClient,
        config: {...config}
      });
      return res.json(challenges);
    } catch (e) {
      return next(e);
    }
  },

  initialize: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {key} = await UserDataController.getOrSetUserData({
        req,
        fileList,
        redisClient,
        config: {...config}
      });

      const userdataJSON = await redisClient.get(key);
      if (userdataJSON) {
        return res.json({status: 'initialized'});
      } else {
        return next(new Error(`Can't initialize`));
      }
    } catch (e) {
      return next(e);
    }
  }
}