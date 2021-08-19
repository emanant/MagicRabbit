
// TODO: Modifying any game state is *NOT* allowed here!

import AppConstants from "@scilearn/learnflow-sdk/lib/manager/AppConstants";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import ILoadingSkin from "./ILoadingSkin";
import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Resources } from "../../Resources";
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { DisplayCache } from "../../service/display/DisplayCache";

/**
 * @class LoadingSkin
 * @classdesc implements IHelpSkin and provide functions to change state of help screen elements
 * @implements {IHelpSkin}
 */
export default class LoadingSkin implements ILoadingSkin {

    private loadingMovieClip: FlaxDisplay;
    private scene: cc.Scene | null = null;

    private setupSceneAndListener(): void {
        this.scene = cc.director.getRunningScene();
        this.scene.addChild(this.loadingMovieClip);
        let event: cc.EventListener = Helper.EventHelper.addMouseTouchEvent((event, touch, state) => {
            return true;
        }, this.loadingMovieClip);
    }

    async primaryLoading(): Promise<void> {
        console.log("*********primary loading");
        this.initLoadingMovieClip();
        this.setupSceneAndListener();
        await Helper.GameHelper.playFrame(this.loadingMovieClip);
        this.startSecondaryLoading();
    }

    stopLoading(): void {
        console.log("*********stop loading");
        this.loadingMovieClip.stop();
        if (this.scene) {
            this.scene.removeChild(this.loadingMovieClip);
        }
    }

    startSecondaryLoading(): void {
        console.log("*********secondary loading");
        Helper.GameHelper.playFrame(this.loadingMovieClip, "loop").then(() => {
            this.startSecondaryLoading();
        });
    }

    private initLoadingMovieClip(): void {
        this.loadingMovieClip = DisplayCache.getCreateDisplay(Resources.imageRes.Generic_loading_plist, "loading");
        this.loadingMovieClip.setPosition(0, AppConstants.DEVICE_HEIGHT);
    }

}
