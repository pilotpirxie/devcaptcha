const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

export enum OptimizeFormat {
  'JPEG',
  'PNG'
}

export type OptimizeConfig = {
  inputDirectory: string,
  outputDirectory: string,
  forceCleanCache: boolean,
  targetWidth: number,
  targetHeight: number,
  targetQuality: number,
  targetFormat: OptimizeFormat
}

export default class Optimize {
  static async dir(config: OptimizeConfig) {
    const inputFileList = fs.readdirSync(path.join(__dirname, config.inputDirectory));
    const outputFileList = fs.readdirSync(path.join(__dirname, config.outputDirectory));

    for (const file of inputFileList) {
      if (!outputFileList.includes(file) || config.forceCleanCache) {
        const img = await sharp(path.join(__dirname, config.inputDirectory, file));
        await img.resize({
          width: config.targetWidth,
          height: config.targetHeight,
        });

        if (config.targetFormat === OptimizeFormat.JPEG) {
          await img
            .jpeg({quality: config.targetQuality})
            .toFile(path.join(__dirname, config.outputDirectory, file));
        } else if (config.targetFormat === OptimizeFormat.PNG) {
          await img
            .png({quality: config.targetQuality})
            .toFile(path.join(__dirname, config.outputDirectory, file));
        }
      }
    }
  }
}
