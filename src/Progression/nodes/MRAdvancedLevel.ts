import * as _ from "lodash";
import { IBaseNodeOptions } from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/OptionInterfaces";
import Tick from "@scilearn/learnflow-sdk/lib/Tree/Tick";
import Status from "@scilearn/learnflow-sdk/lib/Tree/Status";
import ITickResult from "@scilearn/learnflow-sdk/lib/Tree/ITickResult";
import MetadataNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/MetadataNode";
import RandomizationHelper from "@scilearn/learnflow-sdk/lib/helpers/RandomizationHelper";

/**
 * @DESC BeginnerBlockNode serves BlockNode randomly
 * Failed texts are served again at the end of level
 */

const ROUNDS_PER_BLOCK = 20;
export default class MRAdvancedLevel extends MetadataNode {
	options: IBaseNodeOptions;
	constructor(id, options: IBaseNodeOptions) {
		super(id, options);
	}

	public open(tick: Tick): void {
		this.initFromState(tick);
		this.initChildMetadata(tick);
	}

	protected initFromState(tick: Tick): void {
		this.childrenMetadata = tick.blackboard.get("childrenMetadata", tick.tree.id, this.id);
		this.unvisitedNodes =
			tick.blackboard.get("unvisitedNodes", tick.tree.id, this.id) ||
			RandomizationHelper.shuffle(_.range(this.children.length)).slice(0, ROUNDS_PER_BLOCK);
		this.passedNodes = tick.blackboard.get("passedNodes", tick.tree.id, this.id) || [];
		this.failedNodes = tick.blackboard.get("failedNodes", tick.tree.id, this.id) || [];
	}

	public enter(tick: Tick): void {
		this.initFromState(tick);
		this.initChildMetadata(tick);
	}

	protected getNextChildIndex(tick: Tick): number {
		let currentChildIndex = tick.blackboard.get("runningChild", tick.tree.id, this.id);
		if (currentChildIndex !== undefined && this.isRunning(currentChildIndex)) {
			return currentChildIndex;
		}

		// serve failed Block(Round) immediately upto 3 times
		if (this.failedNodes.length) {
			const lastFailedChildIndex = this.failedNodes[this.failedNodes.length - 1];
			// pbt not reached
			if (this.childrenMetadata[lastFailedChildIndex].failCount === 0) {
				return lastFailedChildIndex;
			}
		}
		return this.unvisitedNodes[0];
	}

	// Checks if current child is in running state
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
	 * @memberof RandomRepeatUntilSuccess
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

		this.updatePassedUnits(result.status, tick, this.children[nextChildIndex].id);
		tick.blackboard.set("childrenMetadata", this.childrenMetadata, tick.tree.id, this.id);

		// AdvancedLevel end
		if (this.unvisitedNodes.length === 0) {
			// AdvancedLevel passed
			if (this.failedNodes.length === 0) {
				return {
					payload: payload.concat(result.payload),
					status: Status.SUCCESS,
				};
			}
			// AdvancedLevel failed
			else if (this.checkIfLevelFailed()) {
				this.updateUnvisitedNodes(tick);
				return {
					payload: payload.concat(result.payload),
					status: Status.FAILURE,
				};
			}
		}
		// AdvancedLevel running
		return {
			status: Status.RUNNING,
			payload: payload.concat(result.payload),
		};
	}

	private updateUnvisitedNodes(tick): void {
		if (this.unvisitedNodes.length === 0) {
			this.unvisitedNodes = this.failedNodes.slice();
			this.failedNodes = [];
			tick.blackboard.set("unvisitedNodes", this.unvisitedNodes, tick.tree.id, this.id);
			tick.blackboard.set("failedNodes", this.failedNodes, tick.tree.id, this.id);
			this.unvisitedNodes.forEach((childIndex) => {
				this.setChildMetadata(childIndex, {
					status: undefined,
				});
			});
			tick.blackboard.set("childrenMetadata", this.childrenMetadata, tick.tree.id, this.id);
		}
	}

	updateChildMetadata(result: ITickResult, servedChildIndex): void {
		let failCount = this.childrenMetadata[servedChildIndex].failCount;
		let serveCount = this.childrenMetadata[servedChildIndex].serveCount;

		switch (result.status) {
			case Status.SUCCESS:
				this.passedNodes.push(servedChildIndex);
				_.remove(this.failedNodes, (childIndex) => childIndex === servedChildIndex);
				break;
			case Status.FAILURE:
				failCount = (failCount + 1) % 3;
				if (failCount === 1) {
					this.failedNodes.push(servedChildIndex);
				}
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

	private checkIfLevelFailed(): boolean {
		let levelFailed = !!this.failedNodes.length;
		this.failedNodes.forEach((child) => {
			if (this.childrenMetadata[child].failCount !== 0) {
				levelFailed = false;
			}
		});
		return levelFailed;
	}

	// increment passed unit on success
	private updatePassedUnits(status: Status, tick: Tick, id: string): void {
		if (status === Status.SUCCESS) {
			tick.blackboard.set("passedUnits", (tick.blackboard.get("passedUnits") || 0) + 1);
			// // for debugging
			// TODO: why is this a number?
			// let passedUnitsArr = tick.blackboard.get("passedUnitsArr");
			// console.log(typeof passedUnitsArr);
			// tick.blackboard.set("passedUnitsArr", passedUnitsArr.push(id));
		}
	}
}
