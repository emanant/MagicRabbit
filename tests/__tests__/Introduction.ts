const fs = require("fs");

const BASE_PATH = "/../../src/Progression/InitialStates/";
let progression = {
    "baseState": {}
};

// Please note this file generation is meant for the Pipeline build process only.
// It is not a normal test block. The output file will be in the following directory
// within the exercise root directory:
// ./src/Progression/InitialStates/
describe("generate intro demo", () => {

    it ("should generate the demo json", () => {
        fs.writeFileSync(__dirname + BASE_PATH + "Introduction.json", JSON.stringify(progression), "utf8");
    });

});
