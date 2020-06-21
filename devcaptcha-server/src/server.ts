const express = require('express');
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const redisClient = asyncRedis.createClient();
const app = express();

import Optimize, {ImageFormat} from "./lib/Optimize";
import Background from "./lib/Background";

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

Optimize.dir({
  forceCleanCache: false,
  outputFormat: ImageFormat.JPEG,
  inputDirectory: '../../public/backgrounds/source/',
  outputDirectory: '../../public/backgrounds/optimized/',
  outputWidth: 480,
  outputHeight: 280,
  outputQuality: 40
});

function getRandomFileIndex(files: string[]) {
  const imageIndex = Math.floor(Math.random() * files.length);
  return imageIndex;
}

app.get('/bg', async (req, res) => {
  const bgDir = fs.readdirSync(path.join(__dirname, '../public/backgrounds/optimized'));
  const imageIndex = getRandomFileIndex(bgDir);

  const bgPath = path.join(__dirname, '../public/backgrounds/optimized', bgDir[imageIndex]);
  const puzzlePath = path.join(__dirname, '../public/puzzle/1.png');

  const bg = new Background(bgPath);
  const bgBuffer = await bg.compositePuzzle({
    puzzleFilepath: puzzlePath,
    outputQuality: 40,
    left: 100,
    top: 100,
    outputFormat: ImageFormat.JPEG
  });

  // const puzzle = await sharp(path.join(__dirname, '../puzzle/1.png'));
  //
  // const bgCropped = sharp(path.join(__dirname, '../backgrounds/optimized', files[imageIndex]));
  // bgCropped.extract({
  //   left: 100,
  //   top: 100,
  //   width: 64,
  //   height: 64
  // });
  //
  // const puzzleBuffer = await puzzle
  //   .composite([{
  //     input: await bgCropped.toBuffer(),
  //     blend: 'in'
  //   }])
  //   .png()
  //   .toBuffer();

  res.set('Content-Type', 'image/jpeg');
  res.send(bgBuffer);
});

try {
  app.listen(app.get('port'), () => {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  });
} catch (err) {
  console.warn('App is listening but ip address information are unavailable');
  console.error(err);
}