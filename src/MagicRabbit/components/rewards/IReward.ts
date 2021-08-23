import { TrialResultEvent } from "../../model/ExerciseTypes";
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

/**
 * @interface IReward
 * handler of all rewards in the game
 */
export default interface IReward {
    playFeedback(trialResult: TrialResultEvent): Promise<void>;
}

