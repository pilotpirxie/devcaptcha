export type CaptchaConfig = {
  appendSelector: string,
  promptText: string,
  lockedText: string,
  savingText: string,
  privacyUrl: string,
  termsUrl: string,
  baseUrl: string,
  puzzleAlpha: number,
  canvasContainerId: string,
  leadingZerosLength: number,
  workerPath: string,
  responseRef: number
}

export type CaptchaResponse = {
  x: number,
  y: number,
  challenge: object
}

export interface ICaptcha {
  config: CaptchaConfig,
  getResponse(): Promise<CaptchaResponse>
}