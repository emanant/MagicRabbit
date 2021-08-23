import GameSummarizer from "../../MagicRabbit/service/summarizer/GameSummarizer";
import { TrialResultEvent } from "../../MagicRabbit/model/ExerciseTypes";
import State from "@scilearn/learnflow-sdk/lib/State";
import BaseNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/BaseNode";
import TrialResult from "@scilearn/learnflow-sdk/lib/TrialResult";
import CompletionUnitEvaluator from "../../MagicRabbit/service/evaluator/CompletionUnitEvaluator";

export let listeners = {
	ItemId: (state, passedNode, trialResult, helperFunctions) => {
		// this method is called by sdk after user has answered/completed
		// the trial is and in transit to the next trial
	},

	AllItems: (state: State, passedNode: BaseNode, trialResult: TrialResultEvent, helperFunctions) => {
		// update game summarizer
		let gameSummarizer: GameSummarizer = state.get("gameSummarizer");
		if (trialResult === TrialResult.PASS.valueOf()) {
			gameSummarizer.updateWithSuccess();
		} else {
			gameSummarizer.updateWithFailure();
		}
		state.set("gameSummarizer", gameSummarizer);

		// update the completion unit
		let completionUnitEvaluator: CompletionUnitEvaluator = state.get("completionUnitEvaluator");
		completionUnitEvaluator.updateFromTrial(state, passedNode, trialResult);

		// here we set it to percentComplete so that the percentComplete will
		// be saved and the PPDebugger percent jump will register it properly
		state.set("prevPercentComplete", gameSummarizer.previousPercentComplete);
		state.set("calcPercentComplete", gameSummarizer.percentComplete);
		state.set("percentComplete", gameSummarizer.percentComplete);
	},
};
