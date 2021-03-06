import ITickResult from "@scilearn/learnflow-sdk/lib/Tree/ITickResult";
import { IBaseNodeOptions } from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/OptionInterfaces";
import MetadataNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/MetadataNode";
import Status from "@scilearn/learnflow-sdk/lib/Tree/Status";
import Tick from "@scilearn/learnflow-sdk/lib/Tree/Tick";
import * as _ from "lodash";
/**
 * @desc
 * Round starts with a scrambled word(displayOnly) followed by 10 sequential words.
 * 90% correct criteria (9/10).
 */

export default class MRRound extends MetadataNode {
	options: IMRRoundOptions;
	constructor(id, options: IMRRoundOptions) {
		super(id, options);
		this.options = options;
	}

	protected getNextChildIndex(tick: Tick): number {
		let currentChildIndex = tick.blackboard.get("runningChild", tick.tree.id, this.id) || 0;
		if (currentChildIndex !== undefined && this.isRunning(currentChildIndex)) {
			return currentChildIndex;
		}

		// select next child from unvisitedNodes array
		return this.unvisitedNodes[0];
	}

	// It check current child is in running state
	private isRunning(currentChildIndex: number): boolean {
		return this.childrenMetadata[currentChildIndex].status === Status.RUNNING;
	}

	/**
	 *
	 * @param {Tick} tick
	 * @returns {ITickResult}
	 *    SUCCESS
	 *    FAILURE
	 *    RUNNING
	 * @memberof MRLevel
	 */
	tick(tick: Tick): ITickResult {
		let payload = [];
		let result: ITickResult;
		let nextChildIndex = this.getNextChildIndex(tick);
		// --------------------------------------------------
		tick.blackboard.set("runningChild", nextChildIndex, tick.tree.id, this.id);

		this.setChildMetadata(nextChildIndex, { status: Status.RUNNING });
		result = this.children[nextChildIndex]._execute(tick);
		this.updateChildMetadata(result, nextChildIndex);

		tick.blackboard.set("childrenMetadata", this.childrenMetadata, tick.tree.id, this.id);

		// Round complete
		if (this.unvisitedNodes.length === 0) {
			let unitStatus = this.evaluateNode(tick);
			// Round Passed
			if (unitStatus === Status.FAILURE) {
				this.updateUnvisitedNodes(tick);
				this.reset(tick);
			}
			// Round Failed
			return {
				payload: payload.concat(result.payload),
				status: unitStatus,
			};
		}
		// Round still running
		return {
			status: Status.RUNNING,
			payload: payload.concat(result.payload),
		};
	}

	private updateUnvisitedNodes(tick: Tick): void {
		this.unvisitedNodes = this.failedNodes;
		this.failedNodes = [];
		tick.blackboard.set("unvisitedNodes", this.unvisitedNodes, tick.tree.id, this.id);
		tick.blackboard.set("failedNodes", this.failedNodes, tick.tree.id, this.id);

		this.unvisitedNodes.forEach((childIndex) => {
			this.setChildMetadata(childIndex, {
				status: undefined,
				failCount: 0,
				serveCount: 0,
			});
		});
		tick.blackboard.set("childrenMetadata", this.childrenMetadata, tick.tree.id, this.id);
	}

	updateChildMetadata(result: ITickResult, servedChildIndex): void {
		let failCount = this.childrenMetadata[servedChildIndex].failCount;
		let serveCount = this.childrenMetadata[servedChildIndex].serveCount;

		switch (result.status) {
			case Status.SUCCESS:
				_.remove(this.failedNodes, (childIndex) => childIndex === servedChildIndex);
				this.passedNodes.push(servedChildIndex);
				break;
			case Status.FAILURE:
				this.failedNodes.push(servedChildIndex);
				failCount++;
				break;
		}
		if (result.status !== Status.RUNNING) {
			_.remove(this.unvisitedNodes, (childIndex) => childIndex === servedChildIndex);
			serveCount++;
		}

		this.setChildMetadata(servedChildIndex, {
			serveCount: serveCount,
			failCount: failCount,
			status: result.status,
		});
	}

	protected evaluateNode(tick: Tick): Status {
		var percentCorrect = this.options.percentCorrect;
		var totalPassedTrials = this.passedNodes.length;
		// var totalTrials = TRIALS_PER_BLOCK;
		var totalTrials = this.passedNodes.length + this.unvisitedNodes.length + this.failedNodes.length;
		if (totalPassedTrials / totalTrials >= percentCorrect / 100) {
			return Status.SUCCESS;
		} else {
			return Status.FAILURE;
		}
	}
}

export interface IMRRoundOptions extends IBaseNodeOptions {
	percentCorrect: number;
}
