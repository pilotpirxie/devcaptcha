import {UserDataResponse} from "../models/UserDataResponse";
import {UserDataRequest} from "../models/UserDataRequest";

const path = require('path');
const {getClientIp} = require('request-ip');
const crypto = require('crypto');

export default class UserDataController {
  static getRandomFileIndex(files: string[]) {
    return Math.floor(Math.random() * files.length);
  }

  static async getUserData(userDataRequest : UserDataRequest) : Promise<UserDataResponse> {
    const {req, redisClient, fileList} = userDataRequest;

    let backgroundPath: string;
    let puzzleForBackgroundPath: string;
    let puzzleForClientPath: string;
    let positionX: number;
    let positionY: number;
    let stringChallenge: Array<string> = [];

    const clientIp = getClientIp(req);
    const key = crypto.createHash('md5').update(clientIp).digest("hex");
    const ttl = await redisClient.ttl(key);
    if (ttl > 1) {
      const userDataJSON = await redisClient.get(key);
      const userData = JSON.parse(userDataJSON);
      backgroundPath = userData.backgroundPath;
      puzzleForBackgroundPath = userData.puzzleForBackgroundPath;
      puzzleForClientPath = userData.puzzleForClientPath;
      positionX = userData.positionX;
      positionY = userData.positionY;
      stringChallenge = userData.stringChallenge;

    } else {
      await redisClient.del(key);
      const imageIndex = UserDataController.getRandomFileIndex(fileList);
      backgroundPath = path.join(__dirname, '../../public/backgrounds/optimized', fileList[imageIndex]);
      puzzleForBackgroundPath = path.join(__dirname, '../../public/puzzle/1.png');
      puzzleForClientPath = path.join(__dirname, '../../public/puzzle/2.png');
      positionX = Math.round(Math.random() * (480 - 128)) + 64;
      positionY = Math.round(Math.random() * (280 - 256)) + 96;
      for (let i = 0; i < 10; i++) {
        stringChallenge[i] = crypto.randomBytes(64).toString('base64');
      }

      await redisClient.set(key, JSON.stringify({
        backgroundPath,
        puzzleForBackgroundPath,
        puzzleForClientPath,
        positionX,
        positionY,
        stringChallenge
      }), 'EX', 10);
    }

    return {
      backgroundPath,
      puzzleForBackgroundPath,
      puzzleForClientPath,
      positionX,
      positionY,
      key,
      challenges: stringChallenge
    };
  }
}