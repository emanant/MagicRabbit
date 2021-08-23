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

	it.only("should serve failed Blocks again immediately (upto 3times)", () => {
		// tutorial
		trial = TestsHelper.simulateAnswers(progression, [1]);

		// pass block 1-3
		trial = TestsHelper.simulateAnswers(progression, [20 * 3]);
		expect(trial.payload.level).toBe(1);
		expect(trial.payload.block).toBe(4);

		// block 4 --> fail 10th trial
		trial = TestsHelper.simulateAnswers(progression, [10, 3, 7]);
		// then
		expect(trial.payload.block).toBe(4);
	});
});

describe;
