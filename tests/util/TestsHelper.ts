import * as progressionLogic from "../../src/Progression/progressionLogic";
import {GlobalTestHelper} from "@scilearn/learnflow-sdk/lib/helpers/GlobalTestHelper";
import * as _ from "lodash";

const Progression = require("@scilearn/learnflow-sdk").default;
const yaml = require("js-yaml");
const fs = require("fs");
const BASE_PATH = "/../../src/Progression/";
const content = yaml.safeLoad(fs.readFileSync(__dirname + BASE_PATH + "content.yaml", "utf8"));
const reversalArrayName = "reversals";

export namespace TestsHelper {

    export function adjustPercentComplete(progression: any, percent: number): any {
        return GlobalTestHelper.adjustPercentComplete(progression, percent).progression;
    }

    // export function getAnswersArray(progression: any,feed: number[]): number[] {
    //     return GlobalTestHelper.simulateAnswers(progression, feed);
    // }

    // returns the last question
    export function simulateAnswers(progression, feed?: number[]): any {
        return GlobalTestHelper.simulateAnswers(progression, feed, reversalArrayName);
    }

    export function getDefaultProgression(): any {
        let freshProgressionLogic = _.cloneDeep(progressionLogic);
        return GlobalTestHelper.getDefaultProgression(freshProgressionLogic, content);
    }

    export function getOverrideProgression(state: any): any {
        let progression = new Progression(content, progressionLogic, state);
        progression.init(new Date());
        return progression;
    }

    export function getUpdatedProgression(progression: any): any {
        if (progression) {
            return getOverrideProgression(JSON.parse(progression.state.save()));
        } else {
            return getDefaultProgression();
        }
    }

    export function findAlert(alerts:any[] = [], alert: progressionLogic.ALERT_STAGES): number {
        for (let i = 0; i < alerts.length; i++) {
            if (alerts[i].name === alert) {
                return i;
            }
        }
        return -1;
    }

    export function testAlertDataStructure(progression: any, alertStage: progressionLogic.ALERT_STAGES): void {
        let alertIndex = findAlert(progression.state.get("alerts"), alertStage);
        let alert = progression.state.get("alerts")[alertIndex];
        expect(alert.name).toEqual(alertStage);
        expect(alert.dateRaised).toMatch(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/);
    }

}

export default TestsHelper;
