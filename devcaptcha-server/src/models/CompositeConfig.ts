import {ImageFormat} from "../lib/Optimize";

export type PuzzleCompositeConfig = {
  top: number,
  left: number
  compositeFilepath: string,
  outputQuality: number,
  outputFormat: ImageFormat,
}

export type BackgroundCompositeConfig = {
  top: number,
  left: number
  compositeFilepath: string,
  outputQuality: number,
  outputFormat: ImageFormat,
  puzzleWidth: number,
  puzzleHeight: number
}