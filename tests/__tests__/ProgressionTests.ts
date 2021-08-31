import TestsHelper from "../util/TestsHelper";

let progression, trial;

beforeEach(() => {
	progression = TestsHelper.getDefaultProgression();
	trial = TestsHelper.simulateAnswers(progression);
});

describe("Basic Progression : 1st layer nodes (Intro, GameNode, GameOverNode)", () => {
	it("should serve Intro node first", () => {
		expect(trial.payload.id).toBe("B_1_1");
	});

	it("should serve GameNode after Intro", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);
		// then
		expect(trial.payload.level).toBe(1);
		expect(trial.payload.block).toBe(1);
	});

	it("should serve GameOver node on all level are passed", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);

		// when pass level 1 ==> 8 blocks * 20 trials
		trial = TestsHelper.simulateAnswers(progression, [160]);
		// when pass level 2 ==> 20 rounds * 11 trials
		trial = TestsHelper.simulateAnswers(progression, [220]);
		// when pass level 3 ==> 8 blocks * 20 trials
		trial = TestsHelper.simulateAnswers(progression, [160]);
		// when pass level 4 ==> 8 blocks * 20 trials
		trial = TestsHelper.simulateAnswers(progression, [220]);

		expect(trial.payload.id).toBe("B_3_1");
		expect(trial.payload.gameOver).toBe(true);
	});
});

describe("Basic Progression : 2rd layer node (BeginnerLevel)", () => {
	it("should serve 8 Blocks sequentially", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);

		// each level ==> 8 blocks * (20 trials served out of 40 trials)
		let block = 0;
		while (block++ < 8) {
			expect(trial.payload.level).toBe(1);
			expect(trial.payload.block).toBe(block);
			trial = TestsHelper.simulateAnswers(progression, [20]);
		}
		expect(trial.payload.level).toBe(2);
		expect(trial.payload.item).toBe(0);
	});

	it("should serve failed Blocks again immediately (upto 3times) then move onto next block", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);

		// pass block 1-3
		trial = TestsHelper.simulateAnswers(progression, [20 * 3]);
		expect(trial.payload.level).toBe(1);
		expect(trial.payload.block).toBe(4);

		// block 4 --> fail
		trial = TestsHelper.simulateAnswers(progression, [10, 3, 7]);
		// then
		expect(trial.payload.block).toBe(4);

		// block 4 --> fail
		trial = TestsHelper.simulateAnswers(progression, [0, 20]);
		// then
		expect(trial.payload.block).toBe(4);

		// block 4 --> fail
		trial = TestsHelper.simulateAnswers(progression, [10, 10]);
		// then
		expect(trial.payload.block).toBe(5);
	});
});

describe("Basic Progression : 2rd layer node (AdvancedLevel)", () => {
	it("should serve 20 Rounds randomly", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);
		// pass level 1
		trial = TestsHelper.simulateAnswers(progression, [160]);

		// each level ==> serves random 20 out of 40 rounds
		let totalRounds = 0,
			lastRound = -1;
		while (totalRounds++ < 20) {
			expect(trial.payload.level).toBe(2);
			expect(trial.payload.round).toBeGreaterThan(0);
			expect(trial.payload.round).toBeLessThanOrEqual(40);
			expect(trial.payload.round).not.toBe(lastRound);
			lastRound = trial.payload.round;
			trial = TestsHelper.simulateAnswers(progression, [11]);
		}
		expect(trial.payload.level).toBe(3);
		expect(trial.payload.block).toBe(9);
	});

	it("should serve failed Rounds again immediately (upto 3times) then move onto next Round", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);
		// pass level 1
		trial = TestsHelper.simulateAnswers(progression, [160]);

		// pass Round 1-10
		trial = TestsHelper.simulateAnswers(progression, [11 * 10]);
		expect(trial.payload.level).toBe(2);
		expect(trial.payload.item).toBe(0);

		let round = trial.payload.round;
		// round 11 --> fail 1st time
		trial = TestsHelper.simulateAnswers(progression, [6, 5]);
		// then
		expect(trial.payload.round).toBe(round);
		expect(trial.payload.item).toBe(0);

		// round 11 --> fail 2nd time
		trial = TestsHelper.simulateAnswers(progression, [1, 10]);
		// then
		expect(trial.payload.round).toBe(round);
		expect(trial.payload.item).toBe(0);

		// round 11 --> fail 3rd time
		trial = TestsHelper.simulateAnswers(progression, [3, 8]);
		// then
		expect(trial.payload.round).not.toBe(round);
		expect(trial.payload.item).toBe(0);
	});
});

describe("Progression : pbt", () => {
	it("BeginnerLevel", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);

		// fail a unit 3 times and pass the rest
		expect(trial.payload.level).toBe(1);
		trial = TestsHelper.simulateAnswers(progression, [20 * 5]);
		trial = TestsHelper.simulateAnswers(progression, [10, 10, 10, 10, 10, 10]);
		expect(trial.payload.block).toBe(7);
		trial = TestsHelper.simulateAnswers(progression, [20]);
		trial = TestsHelper.simulateAnswers(progression, [19]);
		trial = TestsHelper.simulateAnswers(progression, [1]);
		
		// then
		expect(trial.payload.level).toBe(2);
		expect(trial.payload.item).toBe(0);

		// pass rest of the levels
		trial = TestsHelper.simulateAnswers(progression, [11*20]);
		expect(trial.payload.level).toBe(3);
		expect(trial.payload.block).toBe(9);

		trial = TestsHelper.simulateAnswers(progression, [20 * 8]);
		expect(trial.payload.level).toBe(4);
		expect(trial.payload.item).toBe(0);

		trial = TestsHelper.simulateAnswers(progression, [11*20]);
		
		// then - pbt
		expect(trial.payload.level).toBe(1);
		expect(trial.payload.block).toBe(6);

		// fail again
		trial = TestsHelper.simulateAnswers(progression, [10, 10, 10, 10, 10, 10]);
		// then - pbt again
		expect(trial.payload.level).toBe(1);
		expect(trial.payload.block).toBe(6);

		// pass the unit
		trial = TestsHelper.simulateAnswers(progression, [20]);
		expect(trial.payload.gameOver).toBe(true);
	});
});
