import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { IProgressionPayload, IGlobalVariables} from "../../model/ExerciseTypes";
import * as _ from "lodash";
import PPDebugger from "@scilearn/learnflow-sdk/lib/manager/PPDebugger";
import PlaypowerLearningSystem from "@scilearn/learnflow-sdk/lib/manager";

export namespace DebuggerLog {

    export let logObj, trialInfo, progressionData;

    export function setDebuggerInfo(progressionData: IProgressionData): void {
        let progressionPayload: IProgressionPayload = progressionData.payload;
        let globalVariables: IGlobalVariables = progressionData.globalVariables;

        // console log Sending data to ppDebugger
        let ppDebugger: PPDebugger = PlaypowerLearningSystem.ppDebugger();

        ppDebugger.updateStateModel("percentThrough", addPadding(globalVariables.percentComplete.toString()));
        ppDebugger.updateStateModel("currentSet", addPadding(progressionPayload.id + " - " + progressionPayload.item));
    }

    export function addPadding(value): string {
        return "                          " + value;
    }

}

