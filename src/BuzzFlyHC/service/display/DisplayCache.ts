import { FlaxDisplay } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Resources } from "../../Resources";
import { LevelProxy } from "./LevelProxy";

export namespace DisplayCache {

    export function createDisplays(): void {
        // key must match the instance name
        LevelProxy.displays.BUZHC_Exercise_MC = <FlaxDisplay>flax.assetsManager.createDisplay(
            Resources.imageRes.BUZHC_plist, "Exercise_MC");
        LevelProxy.displays.loading = flax.assetsManager.createDisplay(
            Resources.imageRes.Generic_loading_plist, "loading");
    }

    export function getCreateDisplay(plistPath: string | null, name: string, label?: string): any {
        try {
            if (!plistPath) {
                throw new Error("Empty plist path provided: " + plistPath);
            }

            label = !label ? name : label;

            if (LevelProxy.displays[name] && LevelProxy.displays[name].opacity !== 255) {
                console.log("removing asset with less opacity");
                LevelProxy.displays[name].removeFromParent();
                delete LevelProxy.displays[name];
            }
            if (!LevelProxy.displays[name]) {
                LevelProxy.displays[name] = flax.assetsManager.createDisplay(plistPath, label);
            }

            if (LevelProxy.displays[name].currentFrame !== 0) {
                LevelProxy.displays[name].removeAllChildren();
            }
            LevelProxy.displays[name].removeFromParent();
            LevelProxy.displays[name].gotoAndStop(0);

            return LevelProxy.displays[name];
        } catch (ex) {
            console.log(ex);
        }
    }

}
