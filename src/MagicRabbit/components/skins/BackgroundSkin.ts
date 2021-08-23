import IBackgroundSkin from "./IBackgroundSkin";
import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import AppConstants from "@scilearn/learnflow-sdk/lib/manager/AppConstants";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { Resources } from "../../Resources";
import { DisplayCache } from "../../service/display/DisplayCache";

// array for background colors
let colorArray = [
    "#6DE7E6",
    "#164D9C",
    "#B07113",
    "#103670"
];
/**
 * @class BackgroundSkin
 * @implements {IBackgroundSkin}
 * @classdesc this class is responsible for adding background of game
 */
export default class BackgroundSkin implements IBackgroundSkin {
    /**
     * @function attachBGTo
     * @param {cc.Layer} layer : layer on which we want to plot background
     * loads background from flash file and adds on the layer 
     */
    attachBGTo(layer: cc.Layer, backgroundID: number): void {
        // This is an example of implementing the background. Your exercise assets
        // might require a different set up. At which point you can adjust these changes
        // as needed.
        let background = DisplayCache.getCreateDisplay(Resources.imageRes.BUZHC_bg_plist, "background");
        background.setAnchorPoint(0.5, 0.5);
        background.setPosition(AppConstants.DEVICE_WIDTH / 2, AppConstants.DEVICE_HEIGHT / 2);

        // an example of randomizing the background color, not required for all exercises
        let randomColor = 1;
        if (background.skies) {
            if (colorArray.length !== background.skies.totalFrames) {
                console.warn("background color entry(" + colorArray.length +
                    ") and total frame(" + background.skies.totalFrames + ") mismatch .... taking random background");
                randomColor = Math.floor(Math.random() * Math.min(background.skies.totalFrames, colorArray.length));
            } else if (!backgroundID || backgroundID <= 0 || backgroundID > background.skies.totalFrames) {
                console.warn("background ID invalid.... taking random background");
                randomColor = Math.floor(Math.random() * colorArray.length);
            } else {
                randomColor = backgroundID;
            }
        }

        let backgroundLayer = new cc.LayerColor(Helper.GameHelper.hexToRgb(colorArray[randomColor - 1].toString()));
        if (background.skies) { background.skies.gotoAndStop(randomColor - 1); }
        layer.addChild(backgroundLayer);
        layer.addChild(background);
    }
}
