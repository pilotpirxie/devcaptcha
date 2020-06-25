import {BackgroundCompositeConfig} from "../models/CompositeConfig";
import {ImageFormat} from "./Optimize";
const sharp = require('sharp');

export default class Puzzle {
  private readonly filepath : string;

  constructor(filepath : string) {
    this.filepath = filepath;
  }

  public async compositeBackground (config : BackgroundCompositeConfig) : Promise<Buffer> {
    const puzzle = await sharp(this.filepath);
    const background = sharp(config.compositeFilepath);

    await background.extract({
      left: config.left,
      top: config.top,
      width: config.puzzleWidth,
      height: config.puzzleHeight
    });

    await puzzle
      .composite([{
        input: await background.toBuffer(),
        blend: 'in'
      }])


    if (config.outputFormat === ImageFormat.PNG) {
      return await puzzle.png({
        quality: config.outputQuality
      }).toBuffer();
    } else if (config.outputFormat === ImageFormat.JPEG) {
      return await puzzle.jpeg({
        quality: config.outputQuality
      }).toBuffer();
    }
  }
}