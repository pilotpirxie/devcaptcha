import Puzzle from "./lib/Puzzle";
import Optimize, {ImageFormat} from "./lib/Optimize";
import Background from "./lib/Background";
// eslint-disable-next-line no-unused-vars
import UserDataController from "./lib/UserData";

const express = require('express');
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const path = require('path');
const cors = require('cors');

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

app.get('/init', async (req, res, next) => {
  try {
    const {key} = await UserDataController.getUserData(req, fileList);

    const userdataJSON = await redisClient.get(key);
    if (userdataJSON) {
      return res.json({status: 'initialized'});
    }
  } catch (e) {
    return next(e);
  }
});

app.get('/challenge', async (req, res, next) => {
  try {
    const {stringChallenge} = await UserDataController.getUserData(req, fileList);
    return res.json(stringChallenge);
  } catch (e) {
    return next(e);
  }
});

app.get('/bg.jpeg', async (req, res, next) => {
  try {
    const {backgroundPath, puzzleForBackgroundPath, positionX, positionY} = await UserDataController.getUserData(req, fileList);
    const background = new Background(backgroundPath);
    const backgroundBuffer = await background.compositePuzzle({
      compositeFilepath: puzzleForBackgroundPath,
      outputQuality: 40,
      left: positionX,
      top: positionY,
      outputFormat: ImageFormat.JPEG
    });

    res.set('Content-Type', 'image/jpeg');
    return res.send(backgroundBuffer);
  } catch (e) {
    return next(e);
  }
});

app.get('/puzzle.png', async (req, res, next) => {
  try {
    const {backgroundPath, puzzleForClientPath, positionX, positionY} = await UserDataController.getUserData(req, fileList);

    const puzzle = new Puzzle(puzzleForClientPath);
    const puzzleBuffer = await puzzle.compositeBackground({
      compositeFilepath: backgroundPath,
      left: positionX,
      top: positionY,
      outputQuality: 40,
      outputFormat: ImageFormat.PNG
    });

    res.set('Content-Type', 'image/jpeg');
    return res.send(puzzleBuffer);
  } catch (e) {
    return next(e);
  }
});

app.use((err, req, res) => {
  if (err) {
    console.error(err);
    return res.sendStatus(400);
  }
});

try {
  app.listen(app.get('port'), () => {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  });
} catch (err) {
  console.warn('App is listening but ip address information are unavailable');
  console.error(err);
}