import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

/**
 * @interface {IMechanic}
 * @extends {cc.Layer}
 * every mechanic of game needs to implement this interface
 */
export interface IMechanic extends cc.Layer {
    startMechanic(progressionData: IProgressionData): Promise<void>;
}
