import { helperFunctions } from "./HelperFunctions";
import { ProgressionEventService } from "../../MagicRabbit/service/display/ProgressionEventService";
import GameSummarizer from "../../MagicRabbit/service/summarizer/GameSummarizer";
import CompletionUnitSummarizer from "../../MagicRabbit/service/evaluator/CompletionUnitEvaluator";
import CompletionUnitEvaluator from "../../MagicRabbit/service/evaluator/CompletionUnitEvaluator";

export function onSessionStart(state, time): void {
	// session trials should be initiated when the session begins
	// there is a check in the index.ts to see if there are session trials before we post our first trial event
	// for some reason, the learnflow system wants to post a trial before the user takes a trial so this check stop it.
	state.set("sessionTrials", []);
	state.set("resetGoButton", true);
	state.set("backgroundID", Math.floor(Math.random() * 4) + 1);
	state.set("sessionScore", 0);
	let trainingDay = state.get("trainingDay");

	// this class has the logic to evaluator any updates to completion-units
	// completion units are stores separately as map
	// completionUnits[id] = ICompletionUnit
	state.set("completionUnitEvaluator", new CompletionUnitEvaluator());

	let totalTrialCount = state.get("totalTrialCount") || 0;
	if (totalTrialCount === 0) {
		// this is the first time the user has taken a trial
		state.set("gameSummarizer", new GameSummarizer());
		state.set("completionUnits", {});
	} else {
		// user has taken trials before so get the values back from the state
		// and push them into the class for this session
		let gameVals = state.get("gameSummarizer");
		let gameSummarizer: GameSummarizer = GameSummarizer.regenerate(gameVals);
		state.set("gameSummarizer", gameSummarizer);

		// save today off as the lastTrainingDay
		state.set("lastTrainingDay", trainingDay);
	}
}
