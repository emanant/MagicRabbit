import IScoreSkin from "./IScoreSkin";
import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { IScoreText } from "@scilearn/learnflow-sdk/lib/helpers/flaxComponents/ScoreText";
/**
 * @class ScoreSkin
 * @implements {IScoreSkin}
 * @classdesc performs all action related to score
 */
export default class ScoreSkin implements IScoreSkin {

    private mainGame: FlaxDisplay;

    constructor(mainGame: FlaxDisplay) {
        this.mainGame = mainGame;
    }

    showCurrentScore(sessionScore: number): void {
        let scoreText: IScoreText = this.mainGame.sessionScore;
        scoreText.setScoreGraphics(sessionScore);
    }

}
