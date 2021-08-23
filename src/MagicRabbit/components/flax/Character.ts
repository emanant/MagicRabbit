import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import ICharacter from "./ICharacter";

/**
 * @class Character
 * @implements {ICharacter}
 * @extends {flax.MovieClip}
 * @classdesc all animations related to character and machine is handled here.
 */
class Character extends flax.MovieClip implements ICharacter {
    
    /** initialize the component
     * @param {string} assetsFile - Spritesheet name
     * @param {string} assetID - AssetID declared in the flash
     */
    constructor(assetsFile: string, assetID: string) {
        super(assetsFile, assetID);
    }
    ctor(assetsFile: string, assetID): void {
        super.ctor(assetsFile, assetID);
        return;
    }

    /**
     * @function animate
     * @param label : optional label for playing a perticuler labeled animation in current character MovieClip
     * @param {boolean} minimal : optional flag for debugging in minimal animation mode
     * @returns {Promise<void>} : promise is resolved when animation has completed
     * playes current character movie clip. This is one approach to playing animations of an component, 
     * it uses the labels setup in Animate. The labels is part of the flax object in mainGame.
     */
    async animate(label?: string, minimal?: boolean): Promise<void> {
        await Helper.GameHelper.playFrame(this, label, minimal);
    }


}

Character.create = undefined;
export default window["Character"] = Character;