import { IMechanic } from "./IMechanic";
import { IProgressionData } from "../../../../node_modules/@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { ProgressionEventService } from "../../service/display/ProgressionEventService";
import { TrialResultEvent, IProgressionPayload, IGlobalVariables } from "../../model/ExerciseTypes";
import ExerciseSkin from "../skins/ExerciseSkin";
import Listener from "../listeners/ScreenListener";
import Reward from "../rewards/Reward";
import PlaypowerLearningSystem from "@scilearn/learnflow-sdk/lib/manager";

export default class NormalMechanic extends cc.Layer implements IMechanic {

    private skin: ExerciseSkin;
    private listener: Listener;
    private reward: Reward;
    private trialSubscription;

    constructor() {
        super();
        this.skin = new ExerciseSkin();
        this.listener = new Listener(this.skin);
        this.reward = new Reward(this.skin);
    }

    async startMechanic(progressionData: IProgressionData): Promise<void> {
        console.log("start mechanic");
        ProgressionEventService.init();
        await this.setScreen(this, progressionData);
        if (progressionData.globalVariables.secondsRemaining > 0 && !progressionData.payload.gameOver) {
            await this.provideTrial(progressionData);
        }
    }

    private async determineOrderOfUISequence(progressionData: IProgressionData): Promise<void> {
        let globalVariables: IGlobalVariables = progressionData.globalVariables;
        let progressionPayload: IProgressionPayload = progressionData.payload;

        this.skin.setTimer(globalVariables.secondsScheduledToday, globalVariables.secondsRemaining);
        if (globalVariables.secondsRemaining <= 0 || progressionPayload.gameOver) {
            alert("Game Over. We will exit after you close this message");
            PlaypowerLearningSystem.exit();
        }
    }

    private async playFeedback(progressionData: IProgressionData, trialResult: TrialResultEvent): Promise<void> {

        let payload: IProgressionPayload = progressionData.payload;
        if (payload.playReward === true) {
            await this.reward.playFeedback(trialResult);
        }
    }

    private async provideTrial(progressionData: IProgressionData): Promise<{}> {
        return new Promise(resolve => {
            this.listener.listenToSkin(progressionData);
            this.listener.listenToDebuggingEvents(progressionData);
            this.listener.presentAndEvaluateTrial(progressionData);
            console.log("presenting trial");
    
            this.trialSubscription = this.listener
                .subscribe(async (trialResult: TrialResultEvent) => {
                    console.log("got trial result");
                    await this.handleTrialResult(trialResult, progressionData);
                    // Calls complete on all the subscribers and then removes them from the subscriber[]
                    resolve();
                    this.listener.complete();
                });
    
            // this waits for your listener to complete
            this.listener.toPromise().then(() => {
                // Sets the subject to be closed
                this.trialSubscription.unsubscribe();
            });
        });
    }

    private async handleTrialResult(trialResult: TrialResultEvent, progressionData: IProgressionData): Promise<any> {
        switch (trialResult) {
            case TrialResultEvent.PASS:
            case TrialResultEvent.FAIL: {
                await this.playFeedback(progressionData, trialResult);
                this.setEventsArray(trialResult, progressionData);
                break;
            }
            case TrialResultEvent.HELP: {
                console.log("handle help button action here");
                break;
            }
            case TrialResultEvent.FORCE_PASS: {
                this.setEventsArray(TrialResultEvent.PASS, progressionData);
                break;
            }
            case TrialResultEvent.FORCE_FAIL: {
                this.setEventsArray(TrialResultEvent.FAIL, progressionData);
                break;
            }
            default:
        }
    }


    private setEventsArray(trialResult: TrialResultEvent, progressionData: IProgressionData): void {
        ProgressionEventService.setResult(trialResult);
        if ((trialResult === TrialResultEvent.PASS || trialResult === TrialResultEvent.FORCE_PASS)) {
            let trialPassScore = progressionData.globalVariables.addlSessionScore;
            ProgressionEventService.update("addlSessionScore", trialPassScore + 1);
        }
    }

    private async setScreen(layer: cc.Layer, progressionData: IProgressionData): Promise<void> {
        let globalVariables: IGlobalVariables = progressionData.globalVariables;

        this.skin.addBG(layer, globalVariables.backgroundID);
        this.skin.attachTo(layer);
        this.skin.init(globalVariables.learnerName);

        await this.skin.setCharacter();
        await this.skin.determineOrderOfUISequence(progressionData);
    }

}
