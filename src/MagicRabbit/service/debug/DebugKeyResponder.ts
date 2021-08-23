import PPDebugger from "@scilearn/learnflow-sdk/lib/manager/PPDebugger";
import { LevelProxy } from "../display/LevelProxy";
import { TrialResultEvent } from "../../model/ExerciseTypes";
import PlaypowerLearningSystem from "@scilearn/learnflow-sdk/lib/manager";
import { SimulateAnswer } from "@scilearn/learnflow-sdk/lib/helpers/debugger/SimulateAnswer";

export namespace DebugKeyResponder {

    let activePPDebugger: PPDebugger;

    export function removeObserver(): void {
        // unsubscribe the observer
        LevelProxy.debugKeyObserver && LevelProxy.debugKeyObserver.unsubscribe();
        LevelProxy.debugKeyObserver = null;
    }

    /**
     * Handle debug key events
     */
    export function listenToDebuggingEvents(callback: Function): any {
        activePPDebugger = PlaypowerLearningSystem.ppDebugger();
        if (activePPDebugger) {
            let key = activePPDebugger.getKey(["K", "C", "I", "[", "]", "N"]);
            if (key) {
                LevelProxy.simulateAnswer = key.value as any;
                this.handleDebugEvents(key, callback);
                return key;
            } else {
                this.removeObserver();
                LevelProxy.debugKeyObserver = activePPDebugger.observable!.subscribe(() => {
                    this.removeObserver();
                    key = activePPDebugger.getKey(["C", "I", "[", "]", "N"]);
                    if (!key) {
                        console.warn("Observer is not unsubscribed", LevelProxy.debugKeyObserver);
                        return;
                    } else {
                        LevelProxy.simulateAnswer = this.handleDebugEvents(key, callback);
                    }
                });
            }
        }
    }

    export function determineSimulateAnswer(key): SimulateAnswer {
        switch (key.value) {
            case "[":
                return SimulateAnswer.c;
            case "C":
                return SimulateAnswer.C;
            case "]":
                return SimulateAnswer.i;
            case "I":
                return SimulateAnswer.I;
            // skip tutorial
            case "N":
            default:
                return SimulateAnswer.N;
        }
    }

    export function handleDebugEvents(key, callback: Function): SimulateAnswer {
        let simulateAns = determineSimulateAnswer(key);
        
        switch (simulateAns) {
            case SimulateAnswer.c: {
                callback(TrialResultEvent.FORCE_PASS, false);
                break;
            }
            case SimulateAnswer.i: {
                callback(TrialResultEvent.FORCE_FAIL, false);
                break;
            }
            case SimulateAnswer.C: {
                callback(TrialResultEvent.PASS, true);
                break;
            }
            case SimulateAnswer.I: {
                callback(TrialResultEvent.FAIL, true);
                break;
            }
            default:
        }

        return simulateAns;
    }

}
