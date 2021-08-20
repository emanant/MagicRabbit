var _ = require("lodash");
const { parse } = require("path");

const gameRootId = "B_2";

let currentLevel, currentBlockOrRound, currentTrial;

/*
 * Header - column names
 * [
 *  Level-id	Task	Foil-level	Position	Category	Block	Set     Item	trial-id
 *  Stimulus	Target	Foil1	Foil2	Foil3	root	foilword1	foilword2	foilword3	Probe
 * ];
 */

/**
 * Node Structure
 *  ${Root}_${level}_${Block or Round}_${Trial}_D
 */

let levelNodeReducer = (aggregator, line, idx) => {
	currentLevel = parseInt(idx, 10);
	const beginnerLevel = currentLevel === 1 || currentLevel === 3;
	let lineCheck = _.filter(line, (node) => parseInt(node[0]) && parseInt(node[5]) && parseInt(node[8]));
	let levelNode = {
		id: `${gameRootId}_${idx}`,
		type: `${beginnerLevel ? "MRBeginnerLevel" : "MRAdvancedLevel"}`,
		description: `Level ${idx} (${beginnerLevel ? "Beginner" : "Advanced"}Level)`,
		override: {
			level: parseInt(currentLevel),
		},
		children: _.concat(
			[],
			_.reduce(
				_.groupBy(lineCheck, (node) => node[5]),
				beginnerLevel ? BlockReducer : RoundReducer,
				[]
			)
		),
	};
	aggregator.push(levelNode);
	return aggregator;
};

let BlockReducer = (aggregator, line, idx) => {
	currentBlockOrRound = parseInt(idx, 10);
	let blockNodes = {
		id: `${gameRootId}_${currentLevel}_${currentBlockOrRound}`,
		description: `Block ${currentBlockOrRound}`,
		type: `MRBlock`,
		override: {
			block: parseInt(currentBlockOrRound),
		},
		percentCorrect: 90,
		children: _.concat(
			[],
			_.reduce(
				_.groupBy(line, (node) => parseInt((parseInt(node[6], 10) - 1) * 10 + parseInt(node[7], 10)), 10),
				trialReducer,
				[]
			)
		),
	};
	aggregator.push(blockNodes);
	return aggregator;
};

let RoundReducer = (aggregator, line, idx) => {
	currentBlockOrRound = parseInt(idx, 10);
	let roundNodes = {
		id: `${gameRootId}_${currentLevel}_${currentBlockOrRound}`,
		description: `Round ${currentBlockOrRound}`,
		type: `MRRound`,
		override: {
			round: parseInt(currentBlockOrRound),
		},
		percentCorrect: 90,
		children: _.concat(
			[],
			_.reduce(
				_.groupBy(line, (node) => parseInt(node[7])),
				trialReducer,
				[]
			)
		),
	};
	aggregator.push(roundNodes);
	return aggregator;
};

let trialReducer = (aggregator, line, idx) => {
	currentTrial = parseInt(idx, 10);
	// let lineCheck = _.filter(line, (node) => node[7]);
	let trialNodes = {
		id: `${gameRootId}_${currentLevel}_${currentBlockOrRound}_${currentTrial}`,
		description: `Trial Node - ${line[0][2]}`,
		type: "DNWrapper",
		children: [gamePlayDataNode(line[0])],
	};
	// currentTrial === 1 && (currentLevel === 2 || currentLevel === 1) && console.log(line);
	aggregator.push(trialNodes);
	return aggregator;
};

let gamePlayDataNode = (line) => {
	let dataNode = {
		id: `${gameRootId}_${currentLevel}_${currentBlockOrRound}_${currentTrial}_D`,
		type: "DataNode",
		description: "Data Node",
		data: {
			trialID: parseInt(line[8], 10),
			viewID: "com.scilearn.MagicRabbit.NormalMechanic",
			category: line[4],
			set: isNaN(parseInt(line[6], 10)) ? "" : parseInt(line[6], 10),
			item: isNaN(parseInt(line[7], 10)) ? "" : parseInt(line[7], 10),
			stimulus: line[9],
			target: line[10],
			foil1: line[11],
			foil2: line[12],
			foil3: line[13],
			root: line[14],
			foilWord1: line[15],
			foilWord2: line[16],
			foilWord3: line[17],
		},
	};
	if (currentLevel === 1 || currentLevel === 3) {
		dataNode.data["probe"] = line[18];
	} else {
		dataNode.data["type"] = line[2];
	}
	return dataNode;
};

let getTutorialNode = () => {
	return {
		id: "B_1",
		type: "DNWrapper",
		guard: "(!(${TutorialComplete}))",
		override: {
			viewID: "com.scilearn.MagicRabbit.Introduction",
			tutorial: true,
			trialID: 0,
			level: 0,
		},
		children: [
			{
				id: "B_1_1",
				type: "DataNode",
				description: "Tutorial segment",
				data: {
					answer: "",
					foil1: "",
					foil2: "",
					foil3: "",
				},
			},
		],
	};
};

let getRootNode = (nodeType = "UnguardedNodeServer") => {
	let ret = {};
	ret["id"] = "B";
	ret["fileType"] = "content";
	ret["type"] = nodeType;
	ret["description"] = "Root Node";
	ret["tags"] = ["AllItems"];
	return ret;
};

module.exports = {
	levelReducer: levelNodeReducer,
	getRootNode: getRootNode,
	getTutorialNode: getTutorialNode,
};
