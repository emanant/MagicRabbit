import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import InactivityTimer from "@scilearn/learnflow-sdk/lib/helpers/InactivityTimer";

export default class InactivePrompt {

    static RESET_REPLAY_TIME: number = 60000;
    static milliseconds: number = 1000;
    private active: boolean = false;
    private defaultInstructionReplay: number;
    private playInstructionOnce: boolean = false;

    constructor(replayTime?: string, playInstructionOnce: boolean = false) {
        this.defaultInstructionReplay = !!replayTime ? this.determineReplayTime(replayTime) : InactivePrompt.RESET_REPLAY_TIME;
        this.playInstructionOnce = playInstructionOnce;
    }

    startInactivePrompt(progressionData: IProgressionData, callback: Function, beginAudioCallback?: Function): void {
        let afterInactiveAudio = () => {
            if (this.active) {
                InactivityTimer.stopInactivityTimer();
                callback();
                if (!this.playInstructionOnce) {
                    this.startInactivePrompt(progressionData, callback, beginAudioCallback);
                }
            }
        };
        this.active = true;
        InactivityTimer.startInactivityTimer(afterInactiveAudio, this.defaultInstructionReplay, beginAudioCallback);
    }

    startInactivePromptNoAudio(progressionData: IProgressionData, callback: Function): void {
        let afterInactiveTimer = () => {
            if (this.active) {
                InactivityTimer.stopInactivityTimer();
                callback();
                if (!this.playInstructionOnce) {
                    this.startInactivePromptNoAudio(progressionData, callback);
                }
            }
        };
        this.active = true;
        InactivityTimer.startInactivityTimerNoAudio(afterInactiveTimer, this.defaultInstructionReplay);
    }

    stopInactivePrompt(): void {
        this.active = false;
        InactivityTimer.stopInactivityTimer();
    }

    determineReplayTime(replay: string): number {
        return parseInt(replay) * InactivePrompt.milliseconds;
    }

    resetDefaultReplayTime(): void {
        this.defaultInstructionReplay = InactivePrompt.RESET_REPLAY_TIME;
    }

    isActive(): boolean {
        return !!InactivityTimer.timerID;
    }

}
