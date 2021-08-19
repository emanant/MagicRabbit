import { TrialResultEvent, IProgressionPayload, SkinEvent } from "../../model/ExerciseTypes";
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import IExerciseSkin from "../skins/IExerciseSkin";
import { Subject } from "rxjs/Rx";
import { GameButtonState } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { AnonymousSubscription } from "rxjs/Subscription";
import { ProgressionEventService } from "../../service/display/ProgressionEventService";
import AudioProxy from "../../service/display/AudioProxy";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { Resources } from "../../Resources";
import { LevelProxy } from "../../service/display/LevelProxy";
import InactivePrompt from "../prompt/InactivePrompt";
import { DebugKeyResponder } from "../../service/debug/DebugKeyResponder";
import { IPPDebugEvent } from "../../model/ExerciseTypes";
import { TimerRegistry } from "@scilearn/learnflow-sdk/lib/helpers/time/TimerRegistry"
import { TRIAL_RESPONSE_TIME } from "../../model/ProgressionTypes";
import globalResources from "@scilearn/learnflow-sdk/lib/res/globalResources";
import IScreenListener from "./IScreenListener";

/**
 * @class ScreenListener
 * @implements {IListener}
 * @classdesc this component listens to screen and handles event.
 * It presents and evaluates trial, as result it emits TrialResultEvent
 */
export default class ScreenListener extends Subject<TrialResultEvent> implements IScreenListener {
    // exercise skin
    private skin: IExerciseSkin;

    // listens to the skin
    private listener: AnonymousSubscription | null = null;

    // inactive prompt listener
    private inactivePrompt: InactivePrompt;

    private audioProxy: AudioProxy = new AudioProxy();

    private orBtnClicked = false;
    private disableButtonsListener = false;
    private debuggerDebugEvent: IPPDebugEvent | null = null;
    private debuggerKeyAcceptable = false;

    /**
     * @constructor
     * @param {IExerciseSkin} skin implementation of Buzz Fly skin
     * @param {string} mechanicName name of current mechanic(used for dependency injection)
     */
    constructor(skin: IExerciseSkin) {
        super();
        this.skin = skin;
    }

    private handleButtonEvent(e: SkinEvent, progressionData: IProgressionData): void {
        switch (e) {
            case SkinEvent.GO_TOUCH:
                this.GOPressed(progressionData);
                break;
            default:
                break;
        }
    }

    /**
     * @function GOPressed
     * @param {IProgressionData} progressionData : current item being played
     * handler for GOPressed event
     */
    private GOPressed(progressionData: IProgressionData): void {
        // start timer for trial
        TimerRegistry.startTimer(TRIAL_RESPONSE_TIME);

        ProgressionEventService.update("resetGoButton", false);
        progressionData.globalVariables.resetGoButton = false;
        this.orBtnClicked = true;

        // end timer for trial
        // normally you would update the response time AFTER the user has clicked a response
        this.updateResponseTime();
        this.skin.goButtonState = GameButtonState.INACTIVE;

        if (!!this.debuggerDebugEvent && !this.debuggerDebugEvent.normalFeedback) {
            this.next(this.debuggerDebugEvent.trialResult);
        } else {
            this.emitEvent(TrialResultEvent.PASS, progressionData);
        }
    }

    private resetDebugKeysState(debugEvent: IPPDebugEvent): void {
        this.emitEvent(debugEvent.trialResult, debugEvent.progressionData);
        this.debuggerDebugEvent = null;
        this.debuggerKeyAcceptable = false;
    }

    private processDebuggerKey(debugEvent: IPPDebugEvent): void {
        let simulateNormalFeedback = debugEvent.normalFeedback && debugEvent.trialResult === TrialResultEvent.PASS;
        if (this.inactivePrompt) {
            this.inactivePrompt.stopInactivePrompt();
        }

        if (simulateNormalFeedback) {
            this.resetDebugKeysState(debugEvent);
        } else if (!debugEvent.normalFeedback) {
            this.next(debugEvent.trialResult);
        } else {
            this.resetDebugKeysState(debugEvent);
        }
    }

    /**
     * @function emitEvent
     * @param {TrialResultEvent} eventName
     * emits result of trial
     */
    private emitEvent(eventName: TrialResultEvent, progressionData: IProgressionData): void {

        // stop timer for trial
        let responseTime = TimerRegistry.getTime(TRIAL_RESPONSE_TIME);

        if (eventName === TrialResultEvent.PASS || eventName === TrialResultEvent.FAIL) {
            ProgressionEventService.update("responseTime", responseTime);
        }

        if (progressionData && (progressionData.payload.playReward !== false ||
            progressionData.payload.contributeToSound === true)) {
            if (eventName === TrialResultEvent.PASS) {
                Helper.AudioHelper.playAudioFromZip(Resources.zipAsset, globalResources.soundRes.ding, LevelProxy.ResDirectoryPath, undefined, false);
                this.next(eventName);
            } else if (eventName === TrialResultEvent.FAIL) {
                Helper.AudioHelper.playAudioFromZip(Resources.zipAsset, globalResources.soundRes.thunk, LevelProxy.ResDirectoryPath, undefined, false);
                this.next(eventName);
            } else if (eventName === TrialResultEvent.HELP) {
                this.next(eventName);
            }
        } else {
            this.next(eventName);
        }
    }

    private setupDefaultInactivePrompt(progressionData: IProgressionData): void {
        let beforeInactiveAudio = () => {
            this.skin.goButtonState = GameButtonState.INACTIVE;
            this.disableButtonsListener = true;
        };
        let afterInactiveAudio = () => {
            this.disableButtonsListener = false;

            if (!this.orBtnClicked && progressionData.payload.activateOR !== false) {
                this.skin.goButtonState = GameButtonState.GLOW;
                return;
            }
        };
        this.inactivePrompt = new InactivePrompt(progressionData.payload.instructionReplay);
        this.inactivePrompt.startInactivePrompt(progressionData, afterInactiveAudio, beforeInactiveAudio);
    }

    private handleDebugOrTrialEnvSetup(progressionData: IProgressionData): void {
        if (this.shouldButtonBePressed(progressionData, this.debuggerDebugEvent)) {
            this.GOPressed(progressionData);
        } else {
            this.debuggerKeyAcceptable = true;
            this.skin.goButtonState = GameButtonState.UP;
            this.setupDefaultInactivePrompt(progressionData);
        }
    }

    private shouldButtonBePressed(progressionData: IProgressionData,
        debuggerDebugEvent: IPPDebugEvent | null): boolean {
        let activateOROff = progressionData.payload.activateOR === false;
        let debugEventExists = !!debuggerDebugEvent;
        let resetGoButton = progressionData.globalVariables.resetGoButton;
        return debugEventExists || (!resetGoButton && activateOROff);
    }

    presentAndEvaluateTrial(progressionData: IProgressionData): void {
        let progressionPayload: IProgressionPayload = progressionData.payload;

        console.log("present and evaluate trial");
        this.audioProxy.playTutorial(progressionData, "tutBeforeOr").then(() => {
            if (progressionPayload.automaticExit) {
                this.next(TrialResultEvent.FORCE_PASS);
            } else {
                this.handleDebugOrTrialEnvSetup(progressionData);
            }
        });
    }

    listenToDebuggingEvents(progressionData: IProgressionData): any {

        DebugKeyResponder.listenToDebuggingEvents((trialResult: TrialResultEvent, normalFeedback: boolean) => {
            let orBtnOff = !this.skin.isButtonActive() || this.orBtnClicked;
            trialResult = progressionData.payload.incorrectImpossible && trialResult ? TrialResultEvent.PASS : trialResult;

            this.debuggerDebugEvent = {
                trialResult: trialResult, progressionData: progressionData, normalFeedback: normalFeedback
            };

            if (!normalFeedback || (orBtnOff && this.debuggerKeyAcceptable)) {
                this.processDebuggerKey(this.debuggerDebugEvent);
            } else if (normalFeedback && !orBtnOff && this.debuggerKeyAcceptable) {
                this.GOPressed(progressionData);
            }
        });
    }


    /**
     * @function listenToSkin
     * @param {IProgressionData} progressionData : current item being played
     * subscribes to skin and handles events
     */
    listenToSkin(progressionData: IProgressionData): void {
        let pressDelay = 0.1;
        if (!this.listener) {
            this.listener = this.skin.subscribe((e: SkinEvent) => {

                Helper.GameHelper.delayedCall(pressDelay).then(() => {
                    if (!this.disableButtonsListener) {
                        if (this.inactivePrompt) {
                            this.inactivePrompt.stopInactivePrompt();
                        }
                        this.handleButtonEvent(e, progressionData);
                    }
                });
            });
        }
    }

    /**
     * @function removeListeners
     * removes the listener which was listening on skin
     */
    removeListeners(): void {
        if (this.listener) {
            this.listener.unsubscribe();
            this.listener = null;
        }
    }

    private updateResponseTime(): void {
        // stop timer for trial
        let responseTime = TimerRegistry.getTime(TRIAL_RESPONSE_TIME);
        ProgressionEventService.update("responseTime", responseTime);
    }

}
