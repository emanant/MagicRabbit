import Point = cc.Point;

/**
 * @interface ICharacter
 * interface for Character.
 */
export default interface ICharacter {
    getContentSize(): cc.Size;
    getAnchorPoint(): cc.Point;
    getPosition(): cc.Point;
    setPosition(x: Point | number, y?: number): void;
    zIndex: number;
    animate(label?: string, minimal?: boolean): Promise<void>;
    gotoAndStop(frameOrLabel): void;
}
