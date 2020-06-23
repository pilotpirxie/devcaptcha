export type UserDataRequestConfig = {
  port: number,
  timeout: number,
  apiKey:  string,
  maxDistance: number,
  leadingZerosLength: number,
  challengeCount: number,
  challengeLength: number,
  backgroundPuzzlePath: string,
  clientPuzzlePath: string,
  backgroundImagesPath: string,
  puzzleWidth: number,
  puzzleHeight: number,
  maxTTL: number,
  backgroundQuality: number
}