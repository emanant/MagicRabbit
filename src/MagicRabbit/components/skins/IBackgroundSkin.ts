/**
 * @interface IBackgroundSkin
 * interface for background
 */
export default interface IBackgroundSkin {
    attachBGTo(layer: cc.Layer, backgroundID: number): void;
}
