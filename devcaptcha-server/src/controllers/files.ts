import UserDataController from "../lib/UserData";
import Background from "../lib/Background";
import {ImageFormat} from "../lib/Optimize";
import Puzzle from "../lib/Puzzle";
import {NextFunction, Request, Response} from "express";
const config = require('../../config.json');

import {
  fileList,
  redisClient
} from '../server';

export default {
  background: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {backgroundPath,
        backgroundPuzzlePath,
        positionX,
        positionY
      } = await UserDataController.getOrSetUserData({
        req,
        fileList,
        redisClient,
        config: {...config}
      });

      const background = new Background(backgroundPath);
      const backgroundBuffer = await background.compositePuzzle({
        compositeFilepath: backgroundPuzzlePath,
        outputQuality: config.backgroundQuality,
        left: positionX,
        top: positionY,
        outputFormat: ImageFormat.JPEG
      });

      res.set('Content-Type', 'image/jpeg');
      return res.send(backgroundBuffer);
    } catch (e) {
      return next(e);
    }
  },

  puzzle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        backgroundPath,
        clientPuzzlePath,
        positionX,
        positionY
      } = await UserDataController.getOrSetUserData({
        req,
        fileList,
        redisClient,
        config: {...config}
      });

      const puzzle = new Puzzle(clientPuzzlePath);
      const puzzleBuffer = await puzzle.compositeBackground({
        compositeFilepath: backgroundPath,
        left: positionX,
        top: positionY,
        outputQuality: config.backgroundQuality,
        outputFormat: ImageFormat.PNG
      });

      res.set('Content-Type', 'image/png');
      return res.send(puzzleBuffer);
    } catch (e) {
      return next(e);
    }
  }
}