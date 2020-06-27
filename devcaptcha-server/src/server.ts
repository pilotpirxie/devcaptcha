import Optimize, {ImageFormat} from "./lib/Optimize";

const express = require('express');
const bodyParser = require('body-parser');
const asyncRedis = require("async-redis");
const path = require('path');
const cors = require('cors');
const config = require('../config.json');

const redisClient = asyncRedis.createClient();
const app = express();

import clientController from './controllers/client';
import verifyController from './controllers/verify';
import filesController from './controllers/files';
import errorHandler from './controllers/error';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.set('port', process.env.PORT || config.port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  req.setTimeout(config.timeout);
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

redisClient.on("error", (err) => {
  console.error(err);
});

let fileList : Array<string>;

Optimize.dir({
  forceCleanCache: config.forceCleanOpimizedImageCache,
  outputFormat: ImageFormat.JPEG,
  inputDirectory: path.join(__dirname, '../public/backgrounds/source/'),
  outputDirectory: path.join(__dirname, '../public/backgrounds/optimized/'),
  outputWidth: 480,
  outputHeight: 280,
  outputQuality: 40
}).then(list => {
  fileList = list;
});

app.get('/init', clientController.initialize);
app.get('/challenge', clientController.challenge);
app.post('/verify', verifyController);
app.get('/bg.jpeg', filesController.background);
app.get('/puzzle.png', filesController.puzzle);
app.use('/static', express.static(path.join(__dirname, '../public/static/')))

app.use(errorHandler);

try {
  app.listen(app.get('port'), () => {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  });
} catch (err) {
  console.warn('App is listening but ip address information are unavailable');
  console.error(err);
}

export {
  fileList,
  redisClient
};