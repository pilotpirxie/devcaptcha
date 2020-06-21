// eslint-disable-next-line no-unused-vars
import {CompositeConfig} from "../models/Composite";
import {ImageFormat} from "./Optimize";
const sharp = require('sharp');

export default class Puzzle {
  private readonly filepath : string;

  constructor(filepath : string) {
    this.filepath = filepath;
  }

  public async compositeBackground (config : CompositeConfig) : Promise<Buffer> {
    const puzzle = await sharp(this.filepath);
    const background = sharp(config.compositeFilepath);

    background.extract({
      left: config.left,
      top: config.top,
      width: 64,
      height: 64
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