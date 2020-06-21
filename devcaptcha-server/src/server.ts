import Puzzle from "./lib/Puzzle";
import Optimize, {ImageFormat} from "./lib/Optimize";
import Background from "./lib/Background";

const express = require('express');
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const path = require('path');

const redisClient = asyncRedis.createClient();
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('port', process.env.PORT || 8081);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  const imageIndex = Math.floor(Math.random() * files.length);
  return imageIndex;
}

app.get('/bg', async (req, res) => {
  const imageIndex = getRandomFileIndex(fileList);

  const bgPath = path.join(__dirname, '../public/backgrounds/optimized', fileList[imageIndex]);
  const puzzlePath = path.join(__dirname, '../public/puzzle/1.png');

  const background = new Background(bgPath);
  const backgroundBuffer = await background.compositePuzzle({
    compositeFilepath: puzzlePath,
    outputQuality: 40,
    left: 100,
    top: 100,
    outputFormat: ImageFormat.JPEG
  });

  const puzzle = new Puzzle(puzzlePath);
  const puzzleBuffer = await puzzle.compositeBackground({
    compositeFilepath: bgPath,
    left: 100,
    top: 100,
    outputQuality: 40,
    outputFormat: ImageFormat.PNG
  });

  res.set('Content-Type', 'image/jpeg');
  res.send(puzzleBuffer);
});

try {
  app.listen(app.get('port'), () => {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  });
} catch (err) {
  console.warn('App is listening but ip address information are unavailable');
  console.error(err);
}