import UserDataController from "../lib/UserData";
import Background from "../lib/Background";
import {ImageFormat} from "../lib/Optimize";
import Puzzle from "../lib/Puzzle";
import {NextFunction, Request, Response} from "express";

import {
  fileList,
  redisClient
} from '../server';

export default {
  background: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {backgroundPath,
        puzzleForBackgroundPath,
        positionX,
        positionY
      } = await UserDataController.getUserData({
        req,
        fileList,
        redisClient
      });

      const background = new Background(backgroundPath);
      const backgroundBuffer = await background.compositePuzzle({
        compositeFilepath: puzzleForBackgroundPath,
        outputQuality: 25,
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
        puzzleForClientPath,
        positionX,
        positionY
      } = await UserDataController.getUserData({
        req,
        fileList,
        redisClient
      });

      const puzzle = new Puzzle(puzzleForClientPath);
      const puzzleBuffer = await puzzle.compositeBackground({
        compositeFilepath: backgroundPath,
        left: positionX,
        top: positionY,
        outputQuality: 25,
        outputFormat: ImageFormat.PNG
      });

      res.set('Content-Type', 'image/png');
      return res.send(puzzleBuffer);
    } catch (e) {
      return next(e);
    }
  }
}