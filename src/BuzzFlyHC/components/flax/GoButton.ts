import { TouchEventWrapper, GameButtonState, FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { eventType }from "@scilearn/learnflow-sdk/lib/helpers/EventHelper";
import { Observable } from "rxjs/Rx";
import BaseButton from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/baseClass/BaseButton";
import IGoButton from "./IGoButton";
import { GOEvents } from "../../model/ExerciseTypes";

/**
 * @class GoButton
 * @implements {IGoButton}
 * @extends {flax.MovieClip}
 * @classdesc all animations related to OR Button is handled here.
 */
class GoButton extends BaseButton implements IGoButton {

    // shows current state of OR Button
    currentState: GameButtonState = GameButtonState.INACTIVE;
    onActiveState: GameButtonState = GameButtonState.GLOW;
    autoplayState: GameButtonState = GameButtonState.AUTOPLAY_ON;

    /** initialize the component
     * @param {string} assetsFile - Spritesheet name
     * @param {string} assetID - AssetID declared in the flash
     */
    constructor(assetsFile: string, assetID: string) {
        super(assetsFile, assetID);
    }

    /**
     * setter for buttonState
     * if button in not inactive then add listener to the button
     * it uses glowInfinite function for repeating glow animation
     */
    set buttonState(state: GameButtonState) {
        this.currentState = state;
        this.gotoAndStop(state);
        if (state === GameButtonState.INACTIVE) {
            if (this.isListening) {
                this.removeListener();
                Helper.EventHelper.getEventSubject().next({
                    "logType": eventType.OTHER,
                    "logObj": { "log": GOEvents.GO_INACTIVE.toString() }
                });
            }
        } else {
            if (!this.isListening) {
                this.addListener();
                Helper.EventHelper.getEventSubject().next({
                    "logType": eventType.OTHER,
                    "logObj": { "log": GOEvents.GO_ACTIVE.toString() }
                });
            }
        }
        if (state === GameButtonState.GLOW) {
            this.onActiveState = GameButtonState.GLOW;
            this.glowInfinite();
        }
        if (state === GameButtonState.UP) {
            this.onActiveState = GameButtonState.UP;
        }
    }
    private isAutoplayOn(event: cc.Event): boolean {
        let currentTarget: any = event.getCurrentTarget();
        return !!currentTarget.text || (!!currentTarget.progressionData && !!currentTarget.progressionData.globalVariables.autoplayEnable);
    }
    private autoOrRequestedState(state: GameButtonState, event: cc.Event): GameButtonState {
        return this.isAutoplayOn(event) ? this.autoplayState : state;
    }

    /** Keyboard button clicked
     * @param {cc.Event} event - event object passed
     * @param {number} keyCode - key pressed
     * @param {string} state - State of button pressed
     */
    protected keyPressed(event: cc.Event, keyCode: number, state: string): boolean {
        if (keyCode === cc.KEY.space) {
            this.getActionManager().pauseTarget(<FlaxDisplay>this);
            let touchEventWrapper: TouchEventWrapper = new TouchEventWrapper(event, new cc.Touch(0, 0, 0), state);
            this.emitEvent(touchEventWrapper);
        }
        return true;
    }

    /**
     * @function  buttonEvent
     * @param {cc.Event} event : event object for latest event
     * @param {cc.Touch} touch : touch information of latest event
     * @param {string} state : state of button touch events
     * handles all go button events
     */
    protected buttonEvent(event: cc.Event, touch: cc.Touch, state: string): boolean {
        let currentTarget: FlaxDisplay = event.getCurrentTarget();
        
        if (this.currentState !== GameButtonState.INACTIVE) {
            if (state === Helper.EventHelper.ON_MOVE) {
                currentTarget.getActionManager().pauseTarget(currentTarget);
                if (!this.isAutoplayOn(event)) {
                    currentTarget.buttonState = GameButtonState.OVER;
                    super.setPointer();
                }
            } else if (state === Helper.EventHelper.ON_BEGAN) {
                currentTarget.buttonState = GameButtonState.DOWN;
            } else if (state === Helper.EventHelper.ON_END) {
                currentTarget.buttonState = this.autoOrRequestedState(GameButtonState.OVER, event);
            } else if (state === Helper.EventHelper.ON_OUT) {
                currentTarget.resume();
                currentTarget.buttonState = this.autoOrRequestedState(this.onActiveState, event);
                super.setDefault();
            }
        }
        return true;
    }
    /**
     * getter for buttonState
     */
    get buttonState(): GameButtonState {
        return this.currentState;
    }

    /**
     * @function glowInfinite
     * infinitely repeats glow animation on go button
     */
    private glowInfinite(): void {
        let holdTime = 0.7;
        Helper.GameHelper.playFrame(this, "glow").then(() => {
            Observable.timer(holdTime * 1000).subscribe(() => {
                if (this.getCurrentLabel() === "glow") {
                    this.glowInfinite();
                }
            });
        });
    }
    /**
     * @function setUp
     * changes GoButton state to UP without adding listener
     */
    setUp(): void {
        this.gotoAndStop(GameButtonState.UP);
    }

}

// We need remove the create method to override a flax implementation
// otherwise we get issues when we're trying to set up the listener. 
// This seems only required for components we are going to have the user
// interact with.
GoButton.create = undefined;
export default window["GoButton"] = GoButton;
