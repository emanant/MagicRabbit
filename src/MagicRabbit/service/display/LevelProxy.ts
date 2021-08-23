import AppConstants from "@scilearn/learnflow-sdk/lib/manager/AppConstants";
import globalResources from "@scilearn/learnflow-sdk/lib/res/globalResources";
import { SimulateAnswer } from "@scilearn/learnflow-sdk/lib/helpers/debugger/SimulateAnswer";

/**
 * @namespace LevelProxy
 * stores different paths
 */
export namespace LevelProxy {
    // path of game
    export let GamePath: string;
    // path of root folder audio files
    export let audioPath: string;
    export let staticSoundPath: string;
    export let ngffwdCommonSounds: string;
    export let pathToCommonSounds: string;

    // audio file prefixes and suffixes
    export let GenericAudioPrefix = "BUZHC_";
    export let ReplayAudioPrefix = "replay";
    // add feederMeter, progressMeter, streak?

    export let MP3FileType = ".mp3";

    // audio file directories and paths
    export let CrossExerciseAudioDirectory: string;
    export let SingleSweepAudioPath: string;

    // display mappings
    export let displays: any = {};

    // debugger attributes
    export let debugKeyObserver;
    export let simulateAnswer: SimulateAnswer | undefined;

    // other file directories
    export let ResDirectoryPath: string;

    /**
     * @function initAllPath
     * @param {string} path : path of game
     */
    export function initAllPath(path: string): void {
        LevelProxy.GamePath = path;
        LevelProxy.ResDirectoryPath = GamePath + "res/";
        audioPath = path + "res/audio/";
        staticSoundPath = path + "res/preloadSounds/";
        pathToCommonSounds = "./commonRes/res/";
        ngffwdCommonSounds = pathToCommonSounds + "sounds";

        CrossExerciseAudioDirectory = ngffwdCommonSounds + "/" + AppConstants.APP_LANGUAGE + "/";

        // not technically a path, but a path + prefix...
        // not used in template, but an example of how to retrieve the trial audio
        SingleSweepAudioPath = audioPath + "singleSweepAudio/" + GenericAudioPrefix;
    }

    // misc
    export let ERROR_FILE_NOT_FOUND = "File is not found.";

    export function getCrossExerciseAudioPath(audioFile: string): string {
        let audioPath = ERROR_FILE_NOT_FOUND;
        if (!!audioFile.match(LevelProxy.ReplayAudioPrefix)) {
            audioPath = globalResources.soundRes.replay;
        }
        return audioPath;
    }

    export function isCrossExerciseAudio(audioFile: string): boolean {
        let replayAudio = !!audioFile.match(LevelProxy.ReplayAudioPrefix);
        return replayAudio;
    }

    export function determineAudioPathFromInstructionFile(audioFile: string): string {
        // make this a switch statement?
        if (isCrossExerciseAudio(audioFile)) {
            return getCrossExerciseAudioPath(audioFile);
        } else {
            return ERROR_FILE_NOT_FOUND;
        }
    }

}

