import * as React from "react";
import * as PIXI from 'pixi.js';
import wait from '../utils/interval';
import {CaptchaResponse} from "../index";
import {sha256} from "js-sha256";

interface IApp {
  app: PIXI.Application,
  dragging: boolean,
  puzzle: PIXI.Sprite,
  challenges: Array<string>
  challengeResponses: Object
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
      puzzle: null,
      challenges: null,
      challengeResponses: null,
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.getResponse = this.getResponse.bind(this);

    window.__getResponse = this.getResponse.bind(this);
  }

  async getResponse() : Promise<CaptchaResponse> {
    return new Promise((resolve => {
      const worker = new Worker(this.props.workerPath);
      worker.postMessage({
        challenges: this.state.challenges,
        leadingZerosLength: this.props.leadingZerosLength
      });

      worker.addEventListener('message', (event : MessageEvent) => {
        resolve({
          x: this.state.puzzle.x - this.state.puzzle.width / 2,
          y: this.state.puzzle.y - this.state.puzzle.height / 2,
          challenge: event.data.arr
        });
      });
    }))
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
    document.getElementById(this.props.canvasContainerId).appendChild(this.state.app.view);
    await fetch(`${this.props.baseUrl}/init`);
    await wait(100);

    const background = PIXI.Sprite.from(`${this.props.baseUrl}/bg.jpeg`);
    background.width = this.state.app.view.width;
    background.height = this.state.app.view.height;
    this.state.app.stage.addChild(background);

    const puzzle = PIXI.Sprite.from(`${this.props.baseUrl}/puzzle.png`);
    puzzle.anchor.set(0.5, 0.5);
    puzzle.interactive = true;
    puzzle.buttonMode = true;
    puzzle.alpha = this.props.puzzleAlpha;
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

    this.state.app.stage.addChild(stripes);

    const basicText = new PIXI.Text(this.props.prompt, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#000000',
    });
    basicText.x = 8;
    basicText.y = 8;
    this.state.app.stage.addChild(basicText);

    const textPrivacy = new PIXI.Text('Privacy', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#777777',
    });
    textPrivacy.interactive = true;
    textPrivacy.buttonMode = true;
    textPrivacy.on('pointerdown', () => {
      window.open(this.props.privacyUrl, '_blank');
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
      window.open(this.props.termsUrl, '_blank');
    });
    textTerms.anchor.set(0.5, 0.5);
    textTerms.x = 72;
    textTerms.y = this.state.app.view.height - 16;
    this.state.app.stage.addChild(textTerms);

    const fadeOut = new PIXI.Graphics();
    fadeOut.beginFill(0xffffff);
    fadeOut.drawRect(0, 0,
      this.state.app.view.width,
      this.state.app.view.height
    );
    fadeOut.endFill();
    this.state.app.stage.addChild(fadeOut);

    for (let i = 0; i < 100; i++) {
      fadeOut.alpha -= i/100;
      await wait(16);
    }

    const response = await fetch(`${this.props.baseUrl}/challenge`);
    const data = await response.json();
    this.setState(() => {
      return {
        challenges: data,
      };
    });
  }

  render() {
    return <div id={this.props.canvasContainerId}/>;
  }
}