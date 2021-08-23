import * as _ from "lodash";
import { GamePost } from "../../MagicRabbit/model/ProgressionTypes";
import GameSummarizer from "../../MagicRabbit/service/summarizer/GameSummarizer";
import { ProgressionContentRegex } from "../../MagicRabbit/service/summarizer/ProgressionContentRegex";
import { ICompletionUnit } from "../../MagicRabbit/service/interface/ICompletionUnit";
import { UnitType } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { UnitStatus } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

// arguments:
// state = initialState
// node = this is node from content.yaml which is part of payload
// trialResult = 0/1 (helperFunctions.isTrialResultCorrect)
export function logFunction(
	state: any,
	node: any,
	trialResult: number,
	type: string,
	helperFunctions,
	staticLog: object
): void {
	// this is called after the trial has been taken but before we send the result to the SDK to be eval'd.
	if (type === "pre" && node) {
		// currently nothing
	} else if (type === "post" && node && node.data) {
		// this is called after the data has been sent to SDK to be eval'd.
		let gameSummarizer: GameSummarizer = state.get("gameSummarizer");
		let gameLog: GamePost = new GamePost();

		// score/trial attributes
		gameLog.currentScore = gameSummarizer.scoreCurrent;
		gameLog.totalScore = gameSummarizer.scoreTotal;
		gameLog.todayScore = gameSummarizer.scoreToday;
		gameLog.percentThru = gameSummarizer.percentComplete;
		gameLog.points = gameSummarizer.pointsPerTrial;
		gameLog.bonusPoints = gameSummarizer.bonusPointsPerTrial;
		gameLog.responseTime = state.get("responseTime") || 0;

		// node attributes
		// gameLog.trialRef = ProgressionContentRegex.getTrialRef(node.data);

		// completion-unit attributes
		let completionUnits = state.get("completionUnits") || {};
		// let completionUnitId: string = ProgressionContentRegex.getCompletionUnit(node.id);
		// let completionUnit: ICompletionUnit = completionUnits[completionUnitId];

		// i have no idea why this gets undefined during tests
		// if (completionUnit !== undefined) {
		//     gameLog.completionUnitId = completionUnit.id;
		//     gameLog.completionUnitStatus = completionUnit.status;
		//     gameLog.completionUnitCorrect = completionUnit.correct;
		//     gameLog.completionUnitTotal = completionUnit.total;
		// } else {
		//     // gameLog.completionUnitId = ProgressionContentRegex.getCompletionUnit(this.nodeId);
		//     gameLog.completionUnitStatus = UnitStatus.IN_PROGRESS;
		//     gameLog.completionUnitCorrect = 0;
		//     gameLog.completionUnitTotal = 0;
		// }
		gameLog.unitStatus = UnitStatus.IN_PROGRESS;
		gameLog.unitType = UnitType.PROGRESS;

		// trial-ref attributes
		// this could be a class as well...
		gameLog.trialAttemptCount = 0;
		gameLog.trialErrorCount = 0;
		gameLog.displayOnly = false;
		gameLog.target = "target";
		gameLog.response = "response";

		// interventions:
		gameLog.autoPlayEnabled = false;
		gameLog.autoPlayGoal = 0;
		gameLog.autoPlayStreak = 0;
		gameLog.helpClicks = 0;
		gameLog.replayClicks = 0;
		state.set("logObj", gameLog);

		// any trial that shouldn't be logged: state.set("logObj", null);
		// console.log("LOG_FCN: GAME_LOG: ", gameLog);
	}
}
