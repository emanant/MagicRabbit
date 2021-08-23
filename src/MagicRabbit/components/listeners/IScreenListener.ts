import { IProgressionData, FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Subscribable } from "rxjs/Observable";
import { TrialResultEvent } from "../../model/ExerciseTypes";
import { SimulateAnswer } from "@scilearn/learnflow-sdk/lib/helpers/debugger/SimulateAnswer";

/**
 * @interface IListener
 * @extends {Subscribable<TrialResultEvent>}
 */
export default interface IScreenListener extends Subscribable<TrialResultEvent> {
    presentAndEvaluateTrial(progressionData: IProgressionData,simulateAns?: SimulateAnswer): void;
    listenToSkin(progressionData: IProgressionData): void;
    listenToDebuggingEvents(progressionData: IProgressionData): any;
    removeListeners(): void;
}
