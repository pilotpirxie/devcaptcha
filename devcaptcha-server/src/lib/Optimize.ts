const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

export enum ImageFormat {
  'JPEG',
  'PNG'
}

export type OptimizeConfig = {
  inputDirectory: string,
  outputDirectory: string,
  forceCleanCache: boolean,
  outputWidth: number,
  outputHeight: number,
  outputQuality: number,
  outputFormat: ImageFormat
}

export default class Optimize {
  static async dir(config: OptimizeConfig) {
    const inputFileList = fs.readdirSync(path.join(__dirname, config.inputDirectory));
    const outputFileList = fs.readdirSync(path.join(__dirname, config.outputDirectory));

    for (const file of inputFileList) {
      if (!outputFileList.includes(file) || config.forceCleanCache) {
        const img = await sharp(path.join(__dirname, config.inputDirectory, file));
        await img.resize({
          width: config.outputWidth,
          height: config.outputHeight,
        });

        if (config.outputFormat === ImageFormat.JPEG) {
          await img
            .jpeg({quality: config.outputQuality})
            .toFile(path.join(__dirname, config.outputDirectory, file));
        } else if (config.outputFormat === ImageFormat.PNG) {
          await img
            .png({quality: config.outputQuality})
            .toFile(path.join(__dirname, config.outputDirectory, file));
        }
      }
    }
  }
}
