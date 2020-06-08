import * as React from "react";
import * as PIXI from 'pixi.js';
interface IApp {
  app: PIXI.Application
}

export class App extends React.Component<any, IApp> {
  constructor(props : any) {
    super(props);

    this.state = {
      app: new PIXI.Application({
        width: 480,
        height: 280,
        backgroundColor: 0xeeeeee,
        resolution: window.devicePixelRatio || 1,
      }),
    };
  }

  componentDidMount() {
    document.getElementById('devcaptcha-container').appendChild(this.state.app.view);

    // background
    const background = PIXI.Sprite.from('https://i.imgur.com/OcQSPcR.png');
    background.width = this.state.app.view.width;
    background.height = this.state.app.view.height;
    this.state.app.stage.addChild(background);

    // top stripe
    const stripes = new PIXI.Graphics();
    stripes.beginFill(0xffffff);
    stripes.drawRect(0, 0,
      this.state.app.view.width,
      32
    );
    stripes.endFill();

    // bottom stripe
    stripes.beginFill(0xffffff);
    stripes.drawRect(0,
      this.state.app.view.height - 32,
      this.state.app.view.width,
      32
    );

    // top shadow
    stripes.beginFill(0xdddddd, 0.5);
    stripes.drawRect(0, 32,
      this.state.app.view.width,
      4
    );
    stripes.endFill();

    // bottom shadow
    stripes.beginFill(0xdddddd, 0.5);
    stripes.drawRect(0,
      this.state.app.view.height - 36,
      this.state.app.view.width,
      4
    );
    stripes.endFill();
    this.state.app.stage.addChild(stripes);

    // submit button
    const submitButton = new PIXI.Graphics();
    submitButton.interactive = true;
    submitButton.buttonMode = true;
    submitButton.on('pointerdown', () => {
      console.log('aaa');
    });
    submitButton.beginFill(0x222222);
    submitButton.drawRect(this.state.app.view.width - 112,
      this.state.app.view.height - 64,
      96,
      48
    );
    submitButton.endFill();
    this.state.app.stage.addChild(submitButton);

    // instruction
    const basicText = new PIXI.Text('Move the jigsaw to the correct position to solve captcha.', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#000000',
    });
    basicText.x = 8;
    basicText.y = 8;
    this.state.app.stage.addChild(basicText);

    // text on the submit button
    const submitButtonText = new PIXI.Text('Submit', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#ffffff',
    });
    submitButtonText.x = this.state.app.view.width - 112 + 40;
    submitButtonText.y = this.state.app.view.height - 64 + 16;
    this.state.app.stage.addChild(submitButtonText);

    // icon on the submit button
    const submitButtonIcon = PIXI.Sprite.from('https://i.imgur.com/mgWUPWc.png');
    submitButtonIcon.width = 24;
    submitButtonIcon.height = 24;
    submitButtonIcon.x = this.state.app.view.width - 112 + 12;
    submitButtonIcon.y = this.state.app.view.height - 64 + 12;
    this.state.app.stage.addChild(submitButtonIcon);

  }

  render() {
    return <div id={"devcaptcha-container"}/>;
  }
}