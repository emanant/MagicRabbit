import IGame from "./IGame";
import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Resources } from "../../Resources";
import { DisplayCache } from "../../service/display/DisplayCache";

/**
 * @class MainGame
 * @implements {IGame}
 * @classdesc creates FlaxDisplay object upon construction.
 * The FlaxDisplay object contains main screen of BuzzFlyHC. It does not contain Character.
 */
export default class Game implements IGame {
    exerciseMain: FlaxDisplay;
    /**
     * @constructor
     */
    constructor() {
        this.exerciseMain = DisplayCache.getCreateDisplay(
            Resources.imageRes.BUZHC_plist, "Exercise_MC");
    }
}
