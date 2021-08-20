import TestsHelper from "../util/TestsHelper";
import { UnitStatus, UnitType } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

let progression, trial;

beforeEach(() => {
	progression = TestsHelper.getDefaultProgression();
	trial = TestsHelper.simulateAnswers(progression);
});

describe("data writeout and log function behavior", () => {
	it("should start counting points and streaks", () => {
		// Given
		TestsHelper.simulateAnswers(progression);

		// When
		let trial = TestsHelper.simulateAnswers(progression, [2]);

		// Then
		expect(trial.payload.item).toEqual("L1S1S1");
		expect(trial.globalVariables.logObj.currentScore).toBe(2);
	});

	it("should properly output data writeout", () => {
		// Given
		TestsHelper.simulateAnswers(progression);

		// When
		let trial = TestsHelper.simulateAnswers(progression, [2]);

		// Then
		expect(trial.payload.item).toEqual("L1S1S1");
		expect(trial.globalVariables.logObj.percentThru).toBe(2);
		expect(trial.globalVariables.logObj.displayOnly).toBe(false);
		expect(trial.globalVariables.logObj.completionUnitStatus).toBe(UnitStatus.IN_PROGRESS);
		expect(trial.globalVariables.logObj.completionUnitTotal).toBe(2);
		expect(trial.globalVariables.logObj.completionUnitCorrect).toBe(2);
		expect(trial.globalVariables.logObj.unitStatus).toBe(UnitStatus.IN_PROGRESS);
		expect(trial.globalVariables.logObj.unitType).toBe(UnitType.PROGRESS);
	});

	it("can use ppDebugger percent jump feature", () => {
		// Given
		let targetPercent = 1;

		// When
		TestsHelper.adjustPercentComplete(progression, targetPercent);
		let trial = TestsHelper.simulateAnswers(progression);

		// Then
		expect(trial.globalVariables.logObj.percentThru).toBe(1);
	});
});
