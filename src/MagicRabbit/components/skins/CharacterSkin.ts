import ICharacterSkin from "./ICharacterSkin";
import { Resources } from "../../Resources";
import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { DisplayCache } from "../../service/display/DisplayCache";

let tempInit;
import ICharacter from "../flax/ICharacter";
import Character from "../flax/Character";
tempInit = Character;
import Helper from "@scilearn/learnflow-sdk/lib/helpers";

/**
 * @class CharacterSkin
 * @implements {ICharacterSkin}
 * @classdesc provides all the necessary functions to plot character on screen and animate character.
 * cc.layer contains mainGame component and mainGame contains character component.
 * character movieClip contains gymbo and machine.
 * While performing machine change sequence we split character into two components : character & machine.
 */
export default class CharacterSkin implements ICharacterSkin {
    // starting coordinate for character after reset or during initial draw
    private defaultPosition = { x: 100, y: 20 };

    private charAnimationList = ["T1"];
    private currentCharIndex = 0;
    // FlaxDisplay object that contains character, platform, machine, pullBar, locker, etc.
    private mainGame: FlaxDisplay;

    /**
     * @constructor
     * @param {FlaxDisplay} maingame : mainGame is passed in constrtuct
     */
    constructor(mainGame: FlaxDisplay) {
        this.mainGame = mainGame;
    }

    /**
     * @function initCharacter
     * character is added to screen in same position it was left after last trial.
     */
    async initCharacter(): Promise<void> {
        console.log("initializing character skin");

        // simulate character frame change of 0
        this.currentCharIndex = 0;
        if (this.mainGame.character) {
            this.mainGame.removeChild(this.mainGame.character);
        }

        let char = await this.getCharacter("character");
        // position this as per the game's requirement
        this.mainGame.character = char;
        this.mainGame.character.setPosition(cc.p(450, 390));
        let character: ICharacter = this.mainGame.character;
        this.mainGame.addChild(character, 100);
    }

    /**
     * @function plotCharacter
     * @param {number} position : position of character/machine
     * @param {number} zIndex : z index of character/machine
     * sets position, zindex and machine horn of character movie clip and adds it to screen.
     */
    private plotCharacter(position: cc.Point, zIndex: number): void {
        let character: ICharacter = this.mainGame.character;
        character.setPosition(position);
        this.mainGame.addChild(this.mainGame.character, zIndex);
    }

    /**
     * @function removeCharacter
     * removes character from screen
     */
    private removeCharacter(): void {
        if (this.mainGame.character) {
            this.mainGame.removeChild(this.mainGame.character);
            this.mainGame.character = null;
        }
    }

    /**
     * @function pose
     * @param {number} poseIndex
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * performs character pose animation.
     */
    async pose(poseIndex?: number): Promise<void> {
        let totalPose = 3;
        let pose = poseIndex && poseIndex > 0 && poseIndex <= totalPose
            ? poseIndex : Math.floor(Math.random() * totalPose) + 1;
        await this.changeCharacter("_pose_" + pose.toString());

        let poseDelay = 0.5;
        await Helper.GameHelper.delayedCall(poseDelay);
    }

    /**
     * @function changeCharacter
     * @param {string} label : label to identify character movie clip for current machine
     * Changes character movie clip to perform animations or poses and also sets horn to appropriate position
     */
    private async changeCharacter(label: string): Promise<void> {
        let baseAnim = this.charAnimationList[this.currentCharIndex];
        let character: ICharacter = this.mainGame.character;
        let position: cc.Point = character.getPosition();
        let z = character.zIndex;
        this.mainGame.removeChild(this.mainGame.character);

        let char = await this.getCharacter(baseAnim + label);
        this.mainGame.character = char;
        character = this.mainGame.character;
        character.setPosition(position);
        this.mainGame.addChild(character, z);
    }

    /**
     * @function reset
     * resets character to _default position, also resets platform.
     * it will remove machine from the screen.
     */
    async reset(): Promise<void> {
        let character: ICharacter = this.mainGame.character;
        let position = character.getPosition();
        let z = character.zIndex;
        let animIndex = this.charAnimationList[this.currentCharIndex];
        this.removeCharacter();
        let char = await this.getCharacter(animIndex + "_default");
        this.mainGame.character = char;
        this.plotCharacter(position, z);
    }

    // This is another way to trigger the animations of a flax.Movieclip
    // flax component. We essentially load the plist/png where the flax 
    // component resides and load it into the display cache. See changeCharacter
    // on how we then add it to mainGame and then trigger the animations
    private async getCharacter(label: string): Promise<any> {
        let charPlist = Resources.imageRes.BUZHC_character_plist_early;
        let char: FlaxDisplay = DisplayCache.getCreateDisplay(charPlist, label);
        return char;
    }
}
