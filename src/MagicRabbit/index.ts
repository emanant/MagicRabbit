import IView from "@scilearn/learnflow-sdk/lib/manager/IView";
import { LevelProxy } from "./service/display/LevelProxy";
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";
import { Resources } from "./Resources";
import { DebuggerLog } from "./service/debug/DebuggerLog";
import { ProgressionEventService } from "./service/display/ProgressionEventService";
import Helper from "@scilearn/learnflow-sdk/lib/helpers";
import NormalMechanic from "./components/mechanics/NormalMechanic";
import LoadingSkin from "./components/skins/LoadingSkin";

/**
 * @class MagicRabbit
 * @implements {IView}
 * @classdesc class of whole exercise game
 */
export default class MagicRabbit extends cc.Layer implements IView {
	/**
	 * @constructor
	 * sets path in LevelProxy so that other components can use it.
	 * sets DEFAULT_SOUNDS_FOLDER which plays sound when gets sound flag while doing frame animation in entire game
	 */
	loadingSkin: LoadingSkin;

	constructor(gamePath: string) {
		super();
		LevelProxy.initAllPath(gamePath);
		this.loadingSkin = new LoadingSkin();

		// sets up the path to look for the Animate sound files that are used
		// during animations
		DEFAULT_SOUNDS_FOLDER = LevelProxy.staticSoundPath;
	}

	private setupMechanic(): NormalMechanic {
		let mechanic: NormalMechanic = new NormalMechanic();
		this.addChild(mechanic);
		return mechanic;
	}

	/**
	 * @function run
	 * @param {IBucket} viewItem : current item being played
	 * @param {ViewObj} viewObj : object passed from GameManager
	 * @returns {ProductEvents[]} : promise is resolved when player has completed the game trial
	 * runs the sub-mechanic for one trial, this method is ran in the learnflow-sdk
	 */
	async run(progressionData: IProgressionData): Promise<any> {
		console.log("********run the trial");
		let mechanic = this.setupMechanic();

		DebuggerLog.setDebuggerInfo(progressionData);

		// mechanic referenced in the content.yaml's viewID for each node
		await mechanic.startMechanic(progressionData);
		await Helper.GameHelper.delayedCall(0.3);
		this.removeChild(mechanic);
		return ProgressionEventService.events;
	}

	/**
	 * @function loadGraphics
	 * @return {Promise<{}>} : promise is resolved when resources are loaded
	 */
	loadGraphics(): Promise<{}> {
		return new Promise((resolve) => {
			Resources.loadResources(LevelProxy.GamePath).then(() => {
				return resolve();
			});
		});
	}

	loadLoadingAssets(): Promise<{}> {
		return new Promise((resolve) => {
			Resources.loadLoadingAssets(LevelProxy.GamePath).then(() => {
				return resolve();
			});
		});
	}

	primaryLoading(progressionData: IProgressionData): Promise<{}> {
		return new Promise((resolve) => {
			this.loadingSkin.primaryLoading().then(() => {
				return resolve();
			});
		});
	}

	stopLoading(progressionData: IProgressionData): void {
		this.loadingSkin.stopLoading();
	}

	/**
	 * @function completePrevTrialLog
	 * @return any | null :
	 * When a new exercise begins, the exercise tends to send a trial event BEFORE a trial happens.  This method
	 * is a check to make sure that there are sessionTrials existing before it sends a new event post.
	 *
	 * That means at the beginning of a new session make sure to re-initialize sessionTrials to [].
	 */
	completePrevTrialLog(progressionData: IProgressionData, progression: any): any | null {
		if (progressionData.globalVariables.sessionTrials && progressionData.globalVariables.sessionTrials.length > 0) {
			return progression.state.get("logObj");
		}
		return null;
	}
}
