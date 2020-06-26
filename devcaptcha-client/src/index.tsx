import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import {CaptchaConfig, CaptchaResponse, ICaptcha} from "./models/Captcha";

class DevCaptcha implements ICaptcha {
  readonly config : CaptchaConfig;
  readonly responseRef : number = 0;

  public constructor(config : CaptchaConfig) {
    this.config = config;

    if (window.__getDevCaptchaResponses) {
      this.responseRef = window.__getDevCaptchaResponses.length;
    }

    ReactDOM.render(<App {...this.config} responseRef={this.responseRef} />, document.querySelector(this.config.appendSelector));
  }

  public async getResponse() : Promise<CaptchaResponse> {
    return window.__getDevCaptchaResponses[this.responseRef]();
  }
}

declare global {
  interface Window {
    DevCaptcha: ICaptcha | object,
    __getDevCaptchaResponses: Array<() => Promise<CaptchaResponse>>
  }
}

let _window : Window = window;
_window['DevCaptcha'] = DevCaptcha;
_window['__getDevCaptchaResponses'] = [];