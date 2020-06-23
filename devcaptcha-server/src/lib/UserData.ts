import {UserDataResponse} from "../models/UserDataResponse";
import {UserDataRequest} from "../models/UserDataRequest";

const path = require('path');
const {getClientIp} = require('request-ip');
const crypto = require('crypto');

export default class UserDataController {
  static getRandomFileIndex(files: string[]) {
    return Math.floor(Math.random() * files.length);
  }

  static async getOrSetUserData(userDataRequest : UserDataRequest) : Promise<UserDataResponse> {
    const {req, redisClient, fileList, config} = userDataRequest;

    let userData: UserDataResponse;

    const clientIp = getClientIp(req);
    const key = crypto.createHash('md5')
      .update(clientIp)
      .digest("hex");

    if (await redisClient.ttl(key) > 0) {
      const userDataJSON = await redisClient.get(key);
      userData = JSON.parse(userDataJSON);
    } else {
      await redisClient.del(key);
      const imageIndex = this.getRandomFileIndex(fileList);
      const challenges = this.getRandomChallenges(config.challengeCount, config.leadingZerosLength);

      userData = {
        backgroundPath: path.join(__dirname, '../../', config.backgroundImagesPath, fileList[imageIndex]),
        backgroundPuzzlePath: path.join(__dirname, '../../', config.backgroundPuzzlePath),
        clientPuzzlePath: path.join(__dirname, '../../', config.clientPuzzlePath),
        positionX: this.getRandomPuzzlePosition(0, 480, config.puzzleWidth),
        positionY: this.getRandomPuzzlePosition(32, 248, config.puzzleHeight),
        challenges,
        key
      };

      await redisClient.set(key, JSON.stringify(userData), 'EX', config.maxTTL);
    }

    return userData;
  }

  private static getRandomPuzzlePosition(min : number, max : number, puzzleSize : number) {
    return Math.round(Math.random() * ((max - puzzleSize) - (min + puzzleSize))) + min + puzzleSize;
  }

  private static getRandomChallenges(challengeCount : number, challengeLength : number) {
    const challenges = [];
    for (let i = 0; i < challengeCount; i++) {
      challenges.push(crypto.randomBytes(challengeLength)
        .toString('base64'));
    }
    return challenges;
  }
}