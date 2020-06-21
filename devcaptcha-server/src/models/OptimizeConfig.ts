// eslint-disable-next-line no-unused-vars
import {ImageFormat} from "../lib/Optimize";

export type OptimizeConfig = {
  inputDirectory: string,
  outputDirectory: string,
  forceCleanCache: boolean,
  outputWidth: number,
  outputHeight: number,
  outputQuality: number,
  outputFormat: ImageFormat
}