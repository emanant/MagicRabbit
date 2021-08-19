import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { IGlobalVariables, IProgressionPayload } from "../../model/ExerciseTypes";
import { LevelProxy } from "./LevelProxy";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { Resources } from "../../../BuzzFlyHC/Resources";

export default class AudioProxy {

    private debugging = false;

    set idDebugging(isDebugging: boolean) {
        this.debugging = isDebugging;
    }

    async playTutorial(progressionData: IProgressionData, which: string): Promise<void> {
        let globalVariables: IGlobalVariables = progressionData.globalVariables;
        let progressionPayload: IProgressionPayload = progressionData.payload;
        if (progressionPayload[which]) {
            await this.playInstructions(progressionPayload[which]);
        } else if (globalVariables[which]) {
            await this.playInstructions(globalVariables[which]);
        }
    }

    private async playInstructions(instruction: string | string[]): Promise<void> {
        if (typeof (instruction) === "string") {
            instruction = [instruction];
        }
        await this.playInstructionFromIndex(instruction, 0);
    }

    private async playInstructionFromIndex(instructionArr: string[], currentIndex: number): Promise<void> {
        if (!(currentIndex >= instructionArr.length || this.debugging)) {
            try {
                // TODO: undefined gets passed into the array if the trial has no audio 
                // maybe after more dev testing we can see if there is a better way around this
                if (this.validInstructionAudioValue(instructionArr[currentIndex])) {
                    let path = LevelProxy.determineAudioPathFromInstructionFile(instructionArr[currentIndex]);
                    if (path === LevelProxy.ERROR_FILE_NOT_FOUND) {
                        throw new Error("File not found: " + path);
                    } else {
                        await Helper.AudioHelper.playAudioFromZip(
                            Resources.zipAsset, path, LevelProxy.GamePath + "res/", undefined, false);
                        await this.playInstructionFromIndex(instructionArr, currentIndex + 1);
                    }
                } else {
                    await this.playInstructionFromIndex(instructionArr, currentIndex + 1);
                }
            } catch (exception) {
                console.log(exception);
            }
        };
    }

    private validInstructionAudioValue(instruction: string): boolean {
        return instruction !== "false" && instruction !== "undefined";
    }

}
