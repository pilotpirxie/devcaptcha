import PIXI from "pixi.js";
import {ProgressState} from "./ProgressState";

export interface IApp {
  app: PIXI.Application,
  dragging: boolean,
  loadingSpinner: PIXI.Sprite,
  puzzle: PIXI.Sprite,
  lockOverlay: PIXI.Graphics,
  progressText: PIXI.Text,
  stepIndicator: PIXI.Text,
  challenges: Array<string>
  challengeResponses: Object,
  progressState: ProgressState
}