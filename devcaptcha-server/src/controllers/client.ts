import UserDataController from "../lib/UserData";
import {NextFunction, Request, Response} from "express";

import {
  fileList,
  redisClient
} from '../server';

export default {
  challenge: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {challenges} = await UserDataController.getUserData({
        req,
        fileList,
        redisClient
      });
      return res.json(challenges);
    } catch (e) {
      return next(e);
    }
  },

  initialize: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {key} = await UserDataController.getUserData({
        req,
        fileList,
        redisClient
      });

      const userdataJSON = await redisClient.get(key);
      if (userdataJSON) {
        return res.json({status: 'initialized'});
      }
    } catch (e) {
      return next(e);
    }
  }
}