import { ICompletionUnitEvaluator } from "../interface/ICompletionUnitEvaluator";
import State from "@scilearn/learnflow-sdk/lib/State";
import BaseNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/BaseNode";
import { ProgressionContentRegex } from "../summarizer/ProgressionContentRegex";
import { ICompletionUnit } from "../interface/ICompletionUnit";
import { UnitStatus } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { TrialResultEvent } from "../../model/ExerciseTypes";
import TrialResult from "@scilearn/learnflow-sdk/lib/TrialResult";

export default class CompletionUnitEvaluator implements ICompletionUnitEvaluator {

    updateFromTrial(state: State, node: BaseNode, trialResult: TrialResultEvent): void {
        let completionUnitId = ProgressionContentRegex.getCompletionUnit(node.id);
        let completionUnits = state.get("completionUnits") || {};

        // get completion-unit or initialize one
        let unit: ICompletionUnit = completionUnits[completionUnitId] || {
            id: completionUnitId,
            status: UnitStatus.IN_PROGRESS,
            total: 0,
            correct: 0
        };

        if (trialResult === TrialResult.PASS.valueOf()) {
            unit.correct += 1;
            unit.total += 1;
        }

        // save
        completionUnits[completionUnitId] = unit;
        state.set("completionUnits", completionUnits);
    }

}
