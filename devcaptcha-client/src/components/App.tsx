import * as React from "react";
import * as PIXI from 'pixi.js';
import wait from '../utils/interval';

interface IApp {
  app: PIXI.Application,
  dragging: boolean,
  puzzle: PIXI.Sprite,
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
      dragging: false,
      puzzle: null
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
  }

  onDragStart() {
    this.setState(() => {
      return {
        dragging: true,
      };
    });
  }
  
  onDragEnd() {
    this.setState(() => {
      return {
        dragging: false,
      };
    });
  }

  onDragMove(event : any) {
    if (this.state.dragging) {
      const puzzle = this.state.puzzle;
      puzzle.position.x += event.data.originalEvent.movementX;
      puzzle.position.y += event.data.originalEvent.movementY;
    }
  }
  
  async componentDidMount() {
    document.getElementById('devcaptcha-container').appendChild(this.state.app.view);
    await fetch('http://localhost:8081/refresh');

    // background
    const background = PIXI.Sprite.from('http://localhost:8081/bg.jpeg');
    background.alpha = 0;
    background.width = this.state.app.view.width;
    background.height = this.state.app.view.height;
    this.state.app.stage.addChild(background);
    for(let i = 0; i < 100; i++) {
      background.alpha = i / 100;
      await wait(8);
    }

    // puzzle
    const puzzle = PIXI.Sprite.from('http://localhost:8081/puzzle.png');
    puzzle.anchor.set(0.5, 0.5);
    puzzle.alpha = 0.9;
    puzzle.interactive = true;
    puzzle.buttonMode = true;
    puzzle.x = 64;
    puzzle.y = this.state.app.view.height / 2;
    puzzle.on('mousedown', this.onDragStart)
      .on('touchstart', this.onDragStart)
      .on('mouseup', this.onDragEnd)
      .on('mouseupoutside', this.onDragEnd)
      .on('touchend', this.onDragEnd)
      .on('touchendoutside', this.onDragEnd)
      .on('mousemove', this.onDragMove)
      .on('touchmove', this.onDragMove);
    this.setState(() => {
      return {
        puzzle
      }
    });
    this.state.app.stage.addChild(puzzle);

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

    // privacy policy
    const textPrivacy = new PIXI.Text('Privacy', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#777777',
    });
    textPrivacy.interactive = true;
    textPrivacy.buttonMode = true;
    textPrivacy.on('pointerdown', () => {
      console.log('aaa');
    });
    textPrivacy.anchor.set(0.5, 0.5);
    textPrivacy.x = 24;
    textPrivacy.y = this.state.app.view.height - 16;
    this.state.app.stage.addChild(textPrivacy);

    // terms of service
    const textTerms = new PIXI.Text('Terms', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#777777',
    });
    textTerms.interactive = true;
    textTerms.buttonMode = true;
    textTerms.on('pointerdown', () => {
      console.log('aaa');
    });
    textTerms.anchor.set(0.5, 0.5);
    textTerms.x = 72;
    textTerms.y = this.state.app.view.height - 16;
    this.state.app.stage.addChild(textTerms);
  }

  render() {
    return <div id={"devcaptcha-container"}/>;
  }
}