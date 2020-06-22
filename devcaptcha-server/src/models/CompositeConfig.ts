import {ImageFormat} from "../lib/Optimize";

export type CompositeConfig = {
  top: number,
  left: number
  compositeFilepath: string,
  outputQuality: number,
  outputFormat: ImageFormat
}