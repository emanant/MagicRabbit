import { IProgressionData, IProgressionEventTypes } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { TrialResultEvent } from "../../model/ExerciseTypes";

export namespace ProgressionEventService {

    export let events: any[] = [];

    export function init():void {
        events = [];
    }

    export function update(updateKey: string, updateValue: any): void {
        let obj = {eventType: IProgressionEventTypes.UPDATE};
        obj[updateKey] = updateValue;
        events.push(obj);
    }

    export function setResult(trialResult: TrialResultEvent): void {
        if (trialResult === TrialResultEvent.PASS) {
            events.push({ eventType: IProgressionEventTypes.RESULT, status: 1 });
        } else {
            events.push({ eventType: IProgressionEventTypes.RESULT, status: 0 });
        }
    }

}
