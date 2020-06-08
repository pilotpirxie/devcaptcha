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

    const background = PIXI.Sprite.from('https://i.imgur.com/OcQSPcR.png');
    background.width = this.state.app.view.width;
    background.height = this.state.app.view.height;
    this.state.app.stage.addChild(background);

    const stripes = new PIXI.Graphics();
    stripes.beginFill(0xffffff);
    stripes.drawRect(0, 0,
      this.state.app.view.width,
      32
    );
    stripes.endFill();

    stripes.beginFill(0xffffff);
    stripes.drawRect(0,
      this.state.app.view.height - 32,
      this.state.app.view.width,
      32
    );
    stripes.endFill();
    this.state.app.stage.addChild(stripes);
  }

  render() {
    return <div id={"devcaptcha-container"}/>;
  }
}