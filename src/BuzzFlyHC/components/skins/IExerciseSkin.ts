import Layer = cc.Layer;
import { Subscribable } from "rxjs/Observable";
import { GameButtonState } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { SkinEvent } from "../../model/ExerciseTypes";

/**
 * @interface IExerciseSkin
 * Exercise skin interface
 */
export default interface IExerciseSkin extends Subscribable<SkinEvent> {
    goButtonState: GameButtonState;

    attachTo(layer: Layer, exercise: string, learnerName: string): void;
    init(learnerName: string): void;
    resetCharacter(): Promise<void>;
    setTimer(totalTime: number, timeLeft: number): void;
    addBG(layer: cc.Layer, bgID: number): void;
    setCharacter(): Promise<void>;
    poseCharacter(poseIndex?: number): Promise<void>;
    showCurrentScore(sessionScore: number): void;
    isButtonActive(): boolean;
}
