var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var YAML = require("json2yaml");
var reducers = require("./r1p-reducers.js");

// --------------- header - column names -----------------
/*
 * [
 *  #	Level-id	Task	Foil-level	Position	Category	Block	Set     Item	trial-id
 *  Stimulus	Target	Foil1	Foil2	Foil3	root	foilword1	foilword2	foilword3	Probe
 * ];
 */

// --------------- pre-processing -----------------
const fileNames = ["R1P_MRP_Stims.xlsx - Pairs.tsv", "R1P_MRP_Stims.xlsx - Chains.tsv"];
let stimuli = [];
fileNames.forEach((fileName) => {
    let content = fs
        .readFileSync(`./${fileName}`, "utf8", "r")
        .trim()
        .split("\r\n")
        .map((line) => line.split("\t").slice(1))
        .slice(1);
    stimuli.push(...content);
});

stimuli = stimuli.sort((a, b) => a[0] - b[0]);
// fs.writeFileSync(path.join(__dirname, "./../r1p-stimuli-sorted.txt"), stimuli.join("\n"));

// ------- start reducing the processed data ------
let levelData = _.groupBy(stimuli, (row) => row[0]);
let gameContent = _.reduce(levelData, reducers.levelReducer, []);

// create root node
let rootNode = reducers.getRootNode("UnguardedNodeServer");

// tutorial node
let tutorialNode = reducers.getTutorialNode();

// create game play node
let gameNode = {
    id: "B_2",
    type: "InternalNodeSequencer",
    description: "MR root node",
    guard: "(!${GamePlayComplete})",
    onPassChangeBy: [
        {
            fromIndex: 0,
            changeBy: 1,
        },
    ],
    onFailChangeBy: [
        {
            fromIndex: 0,
            changeBy: 0,
        },
    ],
    children: gameContent,
};

// create game-over node
var gameOverNode = {
    id: "B_3",
    type: "DNWrapper",
    description: "MR game over node",
    guard: "(${GamePlayComplete})",
    children: [
        {
            id: "B_3_1",
            type: "DataNode",
            description: "game over",
            data: {
                gameOver: true,
                viewID: "com.scilearn.MagicRabbit.GameOver",
                trialID: 0,
                level: 0,
                answer: "",
                foil1: "",
                foil2: "",
                foil3: "",
            },
        },
    ],
};

// finalize nodes
var finalContent = _.assign(rootNode, { children: [tutorialNode, gameNode, gameOverNode] });

fs.writeFileSync(path.join(__dirname, "./../r1p-content.yaml"), YAML.stringify(finalContent));
fs.writeFileSync(path.join(__dirname, "./../r1p-content.json"), JSON.stringify(finalContent, null, 4));

console.log("\ncontent created at:\n\n", path.join(__dirname, "./../content.json"), "\n", path.join(__dirname, "./../content.yaml"), "\n");
