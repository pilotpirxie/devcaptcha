// eslint-disable-next-line no-unused-vars
import {ImageFormat} from "./Optimize";

const path = require('path');
const sharp = require('sharp');

type CompositePuzzleConfig = {
  top: number,
  left: number
  puzzleFilepath: string,
  outputQuality: number,
  outputFormat: ImageFormat
}

export default class Background {
  private readonly filepath : string;

  constructor(filepath : string) {
    this.filepath = filepath;
  }

  public async compositePuzzle(config : CompositePuzzleConfig) : Promise<Buffer> {
    const bg = await sharp(path.join(this.filepath));

    await bg
      .composite([{
        input: path.join(config.puzzleFilepath),
        top: config.top,
        left: config.left,
      }]);


    return await bg.jpeg({
      quality: config.outputQuality
    }).toBuffer();
  }
}