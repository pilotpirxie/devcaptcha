const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// eslint-disable-next-line no-unused-vars
import {OptimizeConfig} from "../models/OptimizeConfig";

export enum ImageFormat {
  'JPEG',
  'PNG'
}

export default class Optimize {
  static async dir(config: OptimizeConfig) : Promise<Array<string>> {
    const inputFileList = fs.readdirSync(config.inputDirectory);
    const outputFileList = fs.readdirSync(config.outputDirectory);

    for (const file of inputFileList) {
      if (!outputFileList.includes(file) || config.forceCleanCache) {
        const img = await sharp(path.join(config.inputDirectory, file));
        await img.resize({
          width: config.outputWidth,
          height: config.outputHeight,
        });

        if (config.outputFormat === ImageFormat.JPEG) {
          await img
            .jpeg({quality: config.outputQuality})
            .toFile(path.join(config.outputDirectory, file));
        } else if (config.outputFormat === ImageFormat.PNG) {
          await img
            .png({quality: config.outputQuality})
            .toFile(path.join(config.outputDirectory, file));
        }
      }
    }

    return fs.readdirSync(config.outputDirectory);
  }
}
