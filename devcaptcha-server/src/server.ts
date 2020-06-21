import Puzzle from "./lib/Puzzle";
import Optimize, {ImageFormat} from "./lib/Optimize";
import Background from "./lib/Background";
// eslint-disable-next-line no-unused-vars
import {UserData} from "./models/UserData";

const express = require('express');
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const path = require('path');
const {getClientIp} = require('request-ip');
const cors = require('cors');
const crypto = require('crypto');

const redisClient = asyncRedis.createClient();
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('port', process.env.PORT || 8081);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

app.use((req, res, next) => {
  req.setTimeout(8000);
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

redisClient.on("error", (err) => {
  console.error(err);
});

let fileList : Array<string>;

Optimize.dir({
  forceCleanCache: false,
  outputFormat: ImageFormat.JPEG,
  inputDirectory: path.join(__dirname, '../public/backgrounds/source/'),
  outputDirectory: path.join(__dirname, '../public/backgrounds/optimized/'),
  outputWidth: 480,
  outputHeight: 280,
  outputQuality: 40
}).then(list => {
  fileList = list;
});

function getRandomFileIndex(files: string[]) {
  return Math.floor(Math.random() * files.length);
}

async function getUserData(req) : Promise<UserData> {
  let backgroundPath: string;
  let puzzlePath: string;
  let positionX: number;
  let positionY: number

  const clientIp = getClientIp(req);
  const key = crypto.createHash('md5').update(clientIp).digest("hex");
  const ttl = await redisClient.ttl(key);
  if (ttl > 1) {
    const userDataJSON = await redisClient.get(key);
    const userData = JSON.parse(userDataJSON);
    backgroundPath = userData.backgroundPath;
    puzzlePath = userData.puzzlePath;
    positionX = userData.positionX;
    positionY = userData.positionY;
  } else {
    await redisClient.del(key);
    const imageIndex = getRandomFileIndex(fileList);
    backgroundPath = path.join(__dirname, '../public/backgrounds/optimized', fileList[imageIndex]);
    puzzlePath = path.join(__dirname, '../public/puzzle/1.png');
    positionX = Math.round(Math.random() * (480 - 128)) + 64;
    positionY = Math.round(Math.random() * (280 - 256)) + 96;

    await redisClient.set(key, JSON.stringify({
      backgroundPath,
      puzzlePath,
      positionX,
      positionY
    }), 'EX', 10);
  }
  return {backgroundPath, puzzlePath, positionX, positionY, key};
}

app.get('/refresh', async (req, res) => {
  const {key} = await getUserData(req);

  const userdataJSON = await redisClient.get(key);
  if (userdataJSON) {
    return res.json({status: 'refreshed'});
  }
});

app.get('/bg.jpeg', async (req, res) => {
  const {backgroundPath, puzzlePath, positionX, positionY} = await getUserData(req);
  const background = new Background(backgroundPath);
  const backgroundBuffer = await background.compositePuzzle({
    compositeFilepath: puzzlePath,
    outputQuality: 40,
    left: positionX,
    top: positionY,
    outputFormat: ImageFormat.JPEG
  });

  res.set('Content-Type', 'image/jpeg');
  return res.send(backgroundBuffer);
});

app.get('/puzzle.png', async (req, res) => {
  const {backgroundPath, puzzlePath, positionX, positionY} = await getUserData(req);

  const puzzle = new Puzzle(puzzlePath);
  const puzzleBuffer = await puzzle.compositeBackground({
    compositeFilepath: backgroundPath,
    left: positionX,
    top: positionY,
    outputQuality: 40,
    outputFormat: ImageFormat.PNG
  });

  res.set('Content-Type', 'image/jpeg');
  return res.send(puzzleBuffer);
});

try {
  app.listen(app.get('port'), () => {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  });
} catch (err) {
  console.warn('App is listening but ip address information are unavailable');
  console.error(err);
}