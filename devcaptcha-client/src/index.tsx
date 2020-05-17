import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";

interface ICaptcha {
  _appendSelector: string
}

type CaptchaConfig = {
  appendSelector: string
}

class DevCaptcha implements ICaptcha {
  readonly _appendSelector : string;

  public constructor(config : CaptchaConfig) {
    this._appendSelector = config.appendSelector;
  }

  mount() {
    ReactDOM.render(<App />, document.querySelector(this._appendSelector));
  }
}

window['DevCaptcha'] = DevCaptcha;