import AppConstants from "@scilearn/learnflow-sdk/lib/manager/AppConstants";
import { LevelProxy } from "./service/display/LevelProxy";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import { SkinResources } from "./model/ResourceClassObjects";

/**
 * @namespace Resource
 * namespace for all audio and graphics resources
 */
export namespace Resources {

    export let imageRes: SkinResources = new SkinResources();
    export let zipAsset;

    export function initImageAndAudioAssets(gamePath: string): void {
        // main UI
        imageRes.BUZHC_png = gamePath + "res/" + AppConstants.RESOURCE_FOLDER + "/BUZHC_main.png";
        imageRes.BUZHC_plist = gamePath + "res/" + AppConstants.RESOURCE_FOLDER + "/BUZHC_main.plist";

        // character animations
        imageRes.BUZHC_character_png_early = gamePath + "res/" +
            AppConstants.RESOURCE_FOLDER + "/BUZHC_character_early.png";
        imageRes.BUZHC_character_plist_early = gamePath + "res/" +
            AppConstants.RESOURCE_FOLDER + "/BUZHC_character_early.plist";

        // background
        imageRes.BUZHC_bg_png = gamePath + "res/" + AppConstants.RESOURCE_FOLDER + "/BUZHC_bg.png";
        imageRes.BUZHC_bg_plist = gamePath + "res/" + AppConstants.RESOURCE_FOLDER + "/BUZHC_bg.plist";
    }

    /**
     * @function loadResources
     * @param {string} gamePath The path of the game
     * @returns {Promise<void>} promise is resolved when all resources have loaded
     * Loading all the game specific resources
     */
    export async function loadResources(gamePath: string): Promise<void> {
        initImageAndAudioAssets(gamePath);

        await loadEarlyRewardAssets(gamePath);
    }

    export async function loadLoadingAssets(gamePath: string): Promise<void> {
        let pathToRes: string = gamePath + "res/";
        let loadingZip: string = pathToRes + AppConstants.RESOURCE_FOLDER + "GenericLoading" + ".zip";

        imageRes.Generic_loading_plist = pathToRes + AppConstants.RESOURCE_FOLDER + "GenericLoading/Loading.plist";
        imageRes.Generic_loading_png = pathToRes + AppConstants.RESOURCE_FOLDER + "GenericLoading/Loading.png";

        await Helper.GameHelper.loadFromZip(loadingZip, pathToRes);
    }

    async function loadEarlyRewardAssets(gamePath: string): Promise<void> {
        let pathToRes: string = gamePath + "res/";
        let zip = ".zip";
        let rewardEarly: string = pathToRes + AppConstants.RESOURCE_FOLDER + zip;
        let sharedCrossAssets: string = LevelProxy.ngffwdCommonSounds + zip;

        await Helper.GameHelper.loadFromZip(sharedCrossAssets, LevelProxy.pathToCommonSounds);
        await Helper.GameHelper.loadFromZip(rewardEarly, pathToRes);
        await Helper.GameHelper.loadFromZip(pathToRes + "preloadSounds" + zip, pathToRes);
        zipAsset = await Helper.GameHelper.getZipObject(pathToRes + "audio" + zip);
    }
}
