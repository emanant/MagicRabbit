import State from "@scilearn/learnflow-sdk/lib/State";
import BaseNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/BaseNode";
import { TrialResultEvent } from "../../model/ExerciseTypes";

export interface ICompletionUnitEvaluator {
    updateFromTrial(state: State, node: BaseNode, trialResult: TrialResultEvent): void;
}
