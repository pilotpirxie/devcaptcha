import * as React from "react";
import * as PIXI from 'pixi.js';
import wait from '../utils/interval';
import {CaptchaConfig, CaptchaResponse} from "../models/Captcha";
import {IApp} from "../models/App";
import {ProgressState} from "../models/ProgressState";

export class App extends React.Component<CaptchaConfig, IApp> {
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
      loadingSpinner: null,
      puzzle: null,
      lockOverlay: null,
      progressText: null,
      stepIndicator: null,
      challenges: null,
      challengeResponses: null,
      progressState: ProgressState.INITIAL
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragMove = this.onDragMove.bind(this);
    this.getResponse = this.getResponse.bind(this);
    this.workerStart = this.workerStart.bind(this);
    this.workerEnd = this.workerEnd.bind(this);
    this.setWorkerProgress = this.setWorkerProgress.bind(this);

    window.__getDevCaptchaResponses.push(this.getResponse);
  }

  async getResponse() : Promise<CaptchaResponse> {
    return new Promise(((resolve, reject) => {
      if (this.state.progressState !== ProgressState.INITIAL) {
        reject('Already responded');
      }

      this.workerStart();

      const worker = new Worker(this.props.workerPath);
      worker.postMessage({
        challenges: this.state.challenges,
        leadingZerosLength: this.props.leadingZerosLength
      });

      worker.addEventListener('message', (event : MessageEvent) => {
        if (event.data.type === 'next') {
          this.setWorkerProgress(event.data['solved'], event.data['total']);
        } else if (event.data.type === 'success') {
          this.workerEnd();

          resolve({
            x: this.state.puzzle.x - this.state.puzzle.width / 2,
            y: this.state.puzzle.y - this.state.puzzle.height / 2,
            challenge: event.data['arr']
          });
        }
      });
    }));
  }

  workerStart() {
    this.setState(() => {
      return {
        progressState: ProgressState.SAVING
      };
    }, () => {
      const {puzzle, lockOverlay, stepIndicator, progressText} = this.state;
      puzzle.interactive = false;
      puzzle.buttonMode = false;
      lockOverlay.alpha = 0.5;
      stepIndicator.visible = true;
      progressText.visible = true;

      this.setWorkerProgress(0, 1);
    });
  }

  setWorkerProgress(solved : number, total : number) {
    const {stepIndicator, progressText, loadingSpinner} = this.state;
    progressText.text = Math.ceil(solved/total * 100) + '%';
    if (solved < total) {
      stepIndicator.text = this.props.savingText;
      loadingSpinner.visible = true;
    } else {
      stepIndicator.text = this.props.lockedText;
      loadingSpinner.visible = false;
    }
  }

  workerEnd() {
    this.setState(() => {
      return {
        progressState: ProgressState.LOCKED
      };
    }, () => {
      this.setWorkerProgress(1, 1);
    });
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

    const response = await fetch(`${this.props.baseUrl}/challenge`);
    const data = await response.json();
    this.setState(() => {
      return {
        challenges: data,
      };
    });

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
    this.state.app.stage.addChild(puzzle);

    const lockOverlay = new PIXI.Graphics();
    lockOverlay.beginFill(0x000000);
    lockOverlay.alpha = 0;
    lockOverlay.drawRect(0, 0,
      this.state.app.view.width,
      this.state.app.view.height
    );
    lockOverlay.endFill();
    this.state.app.stage.addChild(lockOverlay);

    const loadingSpinner = PIXI.Sprite.from(`${this.props.baseUrl}/static/loading.png`);
    loadingSpinner.anchor.set(0.5, 0.5);
    loadingSpinner.visible = false;
    loadingSpinner.x = this.state.app.view.width / 2;
    loadingSpinner.y = this.state.app.view.height / 2;
    this.state.app.stage.addChild(loadingSpinner);

    this.state.app.ticker.add(delta => {
      loadingSpinner.rotation += 0.1 * delta;
    });

    const progressText = new PIXI.Text('0%', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#ffffff'
    });
    progressText.visible = false;
    progressText.anchor.set(0.5, 0.5);
    progressText.x = this.state.app.view.width / 2;
    progressText.y = this.state.app.view.height / 2 + 12;
    this.state.app.stage.addChild(progressText);

    const stepIndicator = new PIXI.Text('Saving...', {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#ffffff',
    });
    stepIndicator.visible = false;
    stepIndicator.anchor.set(0.5, 0.5);
    stepIndicator.x = this.state.app.view.width / 2;
    stepIndicator.y = this.state.app.view.height / 2 - 12;
    this.state.app.stage.addChild(stepIndicator);

    this.setState(() => {
      return {
        puzzle,
        lockOverlay,
        progressText,
        stepIndicator,
        loadingSpinner
      }
    });

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

    const basicText = new PIXI.Text(this.props.promptText, {
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

    const logo = PIXI.Sprite.from(`${this.props.baseUrl}/static/logo.png`);
    logo.x = this.state.app.view.width - 102;
    logo.y = this.state.app.view.height - 24;
    this.state.app.stage.addChild(logo);

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
  }

  render() {
    return <div id={this.props.canvasContainerId}/>;
  }
}