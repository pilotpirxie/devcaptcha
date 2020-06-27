import UserDataController from "../lib/UserData";
import {NextFunction, Request, Response} from "express";
const config = require('../../config.json');
const crypto = require('crypto');

import {
  fileList,
  redisClient
} from '../server';

function distance2d(x, positionX: number, y, positionY: number) {
  return Math.sqrt(Math.pow(x - positionX, 2) + Math.pow(y - positionY, 2));
}

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {response} = req.body;
    const {apiKey} = req.query;

    if (!(apiKey && response)) {
      return res.sendStatus(401);
    }

    if (apiKey !== config.apiKey) {
      return res.sendStatus(403);
    }

    const {x, y, answers} = response;
    const {
      challenges,
      positionX,
      positionY,
      key
    } = await UserDataController.getOrSetUserData({
      req,
      fileList,
      redisClient,
      config: {...config}
    });
    await redisClient.del(key);

    if (distance2d(+x, positionX, +y, positionY) > config.maxDistance) {
      return res.sendStatus(400);
    }

    if (answers.length !== challenges.length) {
      return res.sendStatus(400);
    }

    const answerChallenges = answers.map(answer => {
      return answer.challenge;
    })

    for (const challenge of challenges) {
      if (answerChallenges.indexOf(challenge) < 0) {
        return res.sendStatus(400);
      }
    }

    for (const answer of answers) {
      const hash = crypto.createHash('sha256').update(answer.prefix + answer.challenge).digest('hex');
      if (!hash.startsWith('0'.repeat(config.leadingZerosLength))) {
        return res.sendStatus(400);
      }
    }

    return res.sendStatus(200);
  } catch (e) {
    return next(e);
  }
}