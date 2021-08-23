import AppConstants from "@scilearn/learnflow-sdk/lib/manager/AppConstants";
import { Subject } from "rxjs/Rx";
import Layer = cc.Layer;
import { FlaxDisplay, TouchEventWrapper, GameButtonState, IProgressionData }
    from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
    import Helper from "@scilearn/learnflow-sdk/lib/helpers";

// Process of loading in the flax components. TempInit needs to initialize first
// with undefined. Then as we import each component have it be set to tempInit. 
// This seems to be the way flax can import each component into the cocos2d-html
// system.
let tempInit;
import Character from "../flax/Character";
tempInit = Character;
import UserNameBoard, { IUserNameBoard } from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/UserNameBoard";
tempInit = UserNameBoard;
import TimeProgress, { ITimeProgress } from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/TimeProgress";
tempInit = TimeProgress;
import ScoreText, { IScoreText } from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/ScoreText";
tempInit = ScoreText;
// For non next generation exercises, so pure html5 converted exercises who don't
// have the newer percent complete features. Uncomment this and remove the use of the
// other PercentComplete above.
// import PercentCompleteSimple from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/PercentCompleteSimple";
// tempInit = PercentCompleteSimple
// Otherwise use this Next Gen version for next gen based exercises
// import PercentComplete, {IPercentComplete} from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/PercentComplete";
// tempInit = PercentComplete;

// We need the interface here for flax, because it using GoButton as a value to 
// initialize it's cache
import IGoButton from "../flax/IGoButton";
import GoButton from "../flax/GoButton";
tempInit = GoButton;

import IExerciseSkin from "./IExerciseSkin";
import { SkinEvent, IGlobalVariables, IProgressionPayload } from "../../model/ExerciseTypes";
import IGame from "../flax/IGame";
import Game from "../flax/Game";
import CharacterSkin from "./CharacterSkin";
import BackgroundSkin from "./BackgroundSkin";
import { DisplayCache } from "../../service/display/DisplayCache";
import PlaypowerLearningSystem from "@scilearn/learnflow-sdk/lib/manager";
import { Resources } from "../../Resources";
import ICharacter from "../flax/ICharacter";

/**
 * @class ExerciseSkin
 * @classdesc implements IExerciseSkin and provide functions to change game grapics elements
 * @implements {IExerciseSkin}
 */
export default class ExerciseSkin extends Subject<SkinEvent> implements IExerciseSkin {

    private mainGame: FlaxDisplay;
    private characterSkin: CharacterSkin;
    private backgroundSkin: BackgroundSkin;
    currentCharIndex: number;

    /**
     * @constructor
     * @param {string} mechanicName used to get concrete implementation of components
     */
    constructor() {
        super();
        let ExerciseGame: IGame = new Game();
        this.mainGame = ExerciseGame.exerciseMain;
        this.backgroundSkin = new BackgroundSkin();
        this.addComponentListeners();
        DisplayCache.createDisplays();
    }

    /**
     * @function addComponentListeners
     * listens to all clickable components for any event
     */
    private addComponentListeners(): void {
        this.listenToComponent(this.mainGame.GO, SkinEvent.GO_TOUCH);
        let or: IGoButton = this.mainGame.GO;
        or.bindKeyboard([cc.KEY.space]);
    }

    /**
     * @function listenToComponent
     * @param {FlaxDisplay} component component for which we want to fire event
     * @param {skinEvent} SkinEvent name of event
     * emits event from skin when it receives event from a component
     */
    private listenToComponent(component: FlaxDisplay, skinEvent: SkinEvent): void {
        component.observable.subscribe(() => {
            this.next(skinEvent);
        });
    }

    /**
     * @function init
     * one time called function to initialize skin
     */
    init(learnerName: string): void {
        let nameBoard: IUserNameBoard = this.mainGame.NameBoard;
        nameBoard.setUserName(learnerName);
    }

    /**
     * @function setPowerballAndCharacter
     * @param {boolean[]} answers : result of every trial in current session
     * @param {string} freq : current sweep frequency for horn
     * @param {string} duration : current sweep duration for horn
     * powerball and character is initialized on screen
     */
    async setCharacter(): Promise<void> {
   
        let char: FlaxDisplay = DisplayCache.getCreateDisplay(Resources.imageRes.BUZHC_character_plist_early, "character");
        
        this.currentCharIndex = 0;
        if (this.mainGame.character) {
            this.mainGame.removeChild(this.mainGame.character);
        }
        this.mainGame.character = char;
        this.mainGame.character.setPosition(cc.p(440, 390));
        let character: ICharacter = this.mainGame.character;
        this.mainGame.addChild(character, 100);
        return Promise.resolve();
        // await this.characterSkin.initCharacter();    
    }

    showCurrentScore(sessionScore: number): void {
    }

    /**
     * getter and setter for OR button
     */
    get goButtonState(): GameButtonState {
        let goBtn: IGoButton = this.mainGame.GO;
        return goBtn.buttonState;
    }

    set goButtonState(state: GameButtonState) {
        let goBtn: IGoButton = this.mainGame.GO;
        goBtn.buttonState = state;
    }

    isButtonActive(): boolean {
        return this.goButtonState !== GameButtonState.INACTIVE && this.goButtonState !== GameButtonState.AUTOPLAY_ON;
    }

    /**
     * @function attachTo
     * @param {Layer} layer layer to which mainGame needs to be attached
     */
    attachTo(layer: Layer): void {
        this.mainGame.setPosition(AppConstants.DEVICE_WIDTH / 2, AppConstants.DEVICE_HEIGHT / 2);
        layer.addChild(this.mainGame, 1);
    }

    setTimer(totalTime: number, timeLeft: number): void {
        let timer: ITimeProgress = this.mainGame.timeProgress;
        timer.startTimer(totalTime, timeLeft, true);
    }

    toggleComponentVisibility(component: string, visible: boolean): void {
        if (this.mainGame[component]) {
            this.mainGame[component].visible = visible;
        }
    }

    addBG(layer: cc.Layer, bgID: number): void {
        this.backgroundSkin.attachBGTo(layer, bgID);
    }

    public async determineOrderOfUISequence(progressionData: IProgressionData): Promise<void> {
        let globalVariables: IGlobalVariables = progressionData.globalVariables;
        let progressionPayload: IProgressionPayload = progressionData.payload;

        this.setTimer(globalVariables.secondsScheduledToday, globalVariables.secondsRemaining);
        if (globalVariables.secondsRemaining <= 0 || progressionPayload.gameOver) {
            alert("Game Over. We will exit after you close this message");
            PlaypowerLearningSystem.exit();
        }
    }

    // Character handling

    /**
     * @function removeCharacter
     * removes character from screen
     */
    private removeCharacter(): void {
        if (this.mainGame.character) {
            this.mainGame.removeChild(this.mainGame.character);
            this.mainGame.character = null;
        }
    }
    
    /**
     * @function initCharacter
     * character is added to screen in same position it was left after last trial.
     */
    async initCharacter(): Promise<void> {
        console.log("initializing character skin");

        // simulate character frame change of 0
        this.currentCharIndex = 0;
        if (this.mainGame.character) {
            this.mainGame.removeChild(this.mainGame.character);
        }

        let char: FlaxDisplay = DisplayCache.getCreateDisplay(Resources.imageRes.BUZHC_character_plist_early, "character");

        // position this as per the game's requirement
        this.mainGame.character = char;
        this.mainGame.character.setPosition(cc.p(450, 390));
        let character: ICharacter = this.mainGame.character;
        this.mainGame.addChild(character, 100);
    }


    // Handling the game character

    /**
     * @function plotCharacter
     * @param {number} position : position of character/machine
     * @param {number} zIndex : z index of character/machine
     * sets position, zindex and machine horn of character movie clip and adds it to screen.
     */
    private plotCharacter(position: cc.Point, zIndex: number): void {
        let character: ICharacter = this.mainGame.character;
        character.setPosition(position);
        this.mainGame.addChild(this.mainGame.character, zIndex);
    }


    /**
     * @function reset
     * resets character to _default position, also resets platform.
     */
    async resetCharacter(): Promise<void> {
        let character: ICharacter = this.mainGame.character;
        let position = character.getPosition();
        let z = character.zIndex;
        this.mainGame.removeChild(this.mainGame.character);
        let char: FlaxDisplay = DisplayCache.getCreateDisplay(Resources.imageRes.BUZHC_character_plist_early, "character");
        this.mainGame.character = char;
        this.plotCharacter(position, z);
        return Promise.resolve();
    }


    /**
     * @function poseCharacter
     * @param {number} poseIndex : current sweep frequency for horn
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * performs character pose animation.
     */
    async poseCharacter(poseIndex?: number): Promise<void> {
        let totalPose = 3;
        let pose = poseIndex && poseIndex > 0 && poseIndex <= totalPose
            ? poseIndex : Math.floor(Math.random() * totalPose) + 1;
        await this.changeCharacter("_pose_" + pose.toString());

        let poseDelay = 0.5;
        await Helper.GameHelper.delayedCall(poseDelay);
    }


    /**
     * @function changeCharacter
     * @param {string} label : label to identify character movie clip for current machine
     * Changes character movie clip to perform animations or poses and also sets horn to appropriate position
     */
    private async changeCharacter(label: string): Promise<void> {
        let character: ICharacter = this.mainGame.character;
        let position: cc.Point = character.getPosition();
        let z = character.zIndex;
        this.mainGame.removeChild(this.mainGame.character);

        let char: FlaxDisplay = DisplayCache.getCreateDisplay(Resources.imageRes.BUZHC_character_plist_early, "character");
        this.mainGame.character = char;
        character = this.mainGame.character;
        character.setPosition(position);
        this.mainGame.addChild(character, z);
        return Promise.resolve();
    }
}
