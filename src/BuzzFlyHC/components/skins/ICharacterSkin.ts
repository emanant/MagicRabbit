
/**
 * @interface ICharacterSkin
 * interface for character skin.
 */
export default interface ICharacterSkin {
    initCharacter(): Promise<void>;
    pose(poseIndex?: number): Promise<void>;
    reset(): Promise<void>;
}