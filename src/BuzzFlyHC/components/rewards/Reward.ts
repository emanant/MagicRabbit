import IReward from "./IReward";
import IExerciseSkin from "../skins/IExerciseSkin";
import { TrialResultEvent, IProgressionPayload } from "../../model/ExerciseTypes";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

/**
 * @class Reward
 * @implements {IReward}
 * @classdesc this component presents reward.
 */
export default class Reward implements IReward {
    // exercise skin
    private skin: IExerciseSkin;

    /**
     * @constructor
     * @param {IExerciseSkin} skin implementation of Buzz Fly skin
     * @param {string} mechanicName name of current mechanic(used for dependency injection)
     */
    constructor(skin: IExerciseSkin) {
        this.skin = skin;
    }

    /**
     * @function playFeedback
     * @param {TrialResultEvent} trialResult : result of current trial
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * plays reward
     */
    async playFeedback(trialResult: TrialResultEvent): Promise<void> {
        if (trialResult === TrialResultEvent.PASS) {
            await this.showPositiveFeedback();
        } else {
            await this.showNegativeFeedback();
        }
    }

    /**
     * @function showPositiveFeedback
     * @returns {Promise<void> : promise is resolved when animation has completed
     * plays positive reward
     */
    private async showPositiveFeedback(): Promise<void> {
        await this.positiveRewardAnimation();
        let delay = 200;
        await Helper.GameHelper.delayedCall(delay / 1000);
    }

    private async triggerPoseAnimation(): Promise<void> {
        let simulateCharPose = 1;

        await this.skin.poseCharacter(simulateCharPose);
        return this.skin.resetCharacter();
    }

    /**
     * @function positiveRewardAnimation
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * plays reward animation
     */
    private async positiveRewardAnimation(): Promise<void> {
        await this.triggerPoseAnimation();
    }

    /**
     * @function showNegativeFeedback
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * plays negative feedback sound and resets the streak
     */
    private async showNegativeFeedback(): Promise<void> { }

}
