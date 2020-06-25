import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";

interface ICaptcha {
  config: CaptchaConfig,
}

export type CaptchaConfig = {
  appendSelector: string,
  prompt: string,
  privacyUrl: string,
  termsUrl: string,
  baseUrl: string,
  puzzleAlpha: number,
  canvasContainerId: string,
  leadingZerosLength: number
}

export type CaptchaResponse = {
  x: number,
  y: number,
  challenge: object
}

class DevCaptcha implements ICaptcha {
  readonly config : CaptchaConfig;

  public constructor(config : CaptchaConfig) {
    this.config = config;

    ReactDOM.render(<App {...this.config} captcha={this} />, document.querySelector(this.config.appendSelector));
  }

  public async prepareResponse() : Promise<CaptchaResponse> {
    return new Promise(((resolve) => {
      resolve(window.__getResponse());
    }));
  }
}

declare global {
  interface Window {
    DevCaptcha: ICaptcha | object,
    __getResponse(): Promise<CaptchaResponse>
  }
}

window.DevCaptcha = window.DevCaptcha || {};
window['DevCaptcha'] = DevCaptcha;