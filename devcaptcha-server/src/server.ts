const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const redisClient = asyncRedis.createClient();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
import Optimize, {OptimizeFormat} from "./lib/Optimize";

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
  targetFormat: OptimizeFormat.JPEG,
  inputDirectory: '../../public/backgrounds/source/',
  outputDirectory: '../../public/backgrounds/optimized/',
  targetWidth: 480,
  targetHeight: 280,
  targetQuality: 40
});

app.get('/bg', async (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, '../backgrounds/optimized'));
  const imageIndex = Math.floor(Math.random() * files.length);
  const bg = await sharp(path.join(__dirname, '../backgrounds/optimized', files[imageIndex]));

  const bgBuffer = await bg
    .composite([{
      input: path.join(__dirname, '../puzzle/1.png'),
      top: 100,
      left: 100,
    }])
    .jpeg({
      quality: 40
    })
    .toBuffer();

  const puzzle = await sharp(path.join(__dirname, '../puzzle/1.png'));

  const bgCropped = sharp(path.join(__dirname, '../backgrounds/optimized', files[imageIndex]));
  bgCropped.extract({
    left: 100,
    top: 100,
    width: 64,
    height: 64
  });

  const puzzleBuffer = await puzzle
    .composite([{
      input: await bgCropped.toBuffer(),
      blend: 'in'
    }])
    .png()
    .toBuffer();

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