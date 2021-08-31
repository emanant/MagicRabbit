import * as _ from "lodash";
import { IBaseNodeOptions } from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/OptionInterfaces";
import Tick from "@scilearn/learnflow-sdk/lib/Tree/Tick";
import Status from "@scilearn/learnflow-sdk/lib/Tree/Status";
import ITickResult from "@scilearn/learnflow-sdk/lib/Tree/ITickResult";
import MetadataNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/MetadataNode";
import RandomizationHelper from "@scilearn/learnflow-sdk/lib/helpers/RandomizationHelper";
import { createLogicalAnd } from "typescript";

/**
 * @DESC BeginnerLevelNode serves Blocks sequentially
 * each Block is a unit
 * Failed unit is immediately repeated upto 3 times until passed.
 * At the end of the exercise failed units are served again.
 */
export default class MRBrginnerLevel extends MetadataNode {
	options: IBaseNodeOptions;
	constructor(id, options: IBaseNodeOptions) {
		super(id, options);
	}

	protected getNextChildIndex(tick: Tick): number {
		let currentChildIndex = tick.blackboard.get("runningChild", tick.tree.id, this.id);
		// serve failed Block immediately upto 3 times
		if (
			currentChildIndex !== undefined &&
			(this.isRunning(currentChildIndex) ||
				(this.isFailure(currentChildIndex) && this.childrenMetadata[currentChildIndex].failCount < 3))
		) {
			return currentChildIndex;
		}
		// serve unvisited nodes
		return this.unvisitedNodes[0];
	}

	// Checks if current child is in running state
	private isRunning(currentChildIndex: number): boolean {
		return this.childrenMetadata[currentChildIndex].status === Status.RUNNING;
	}
	// Checks if current child is in running state
	private isFailure(currentChildIndex: number): boolean {
		return this.childrenMetadata[currentChildIndex].status === Status.FAILURE;
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
		console.log("BL nextchild", nextChildIndex);
		
		result = this.children[nextChildIndex]._execute(tick);

		this.updateChildMetadata(result, nextChildIndex);

		this.updatePassedUnits(result.status, tick, this.children[nextChildIndex].id);
		tick.blackboard.set("childrenMetadata", this.childrenMetadata, tick.tree.id, this.id);


		// BegginerLevel end
		if (this.unvisitedNodes.length === 0) {
			// BegginerLevel passed
			if (this.failedNodes.length === 0) {
				return {
					payload: payload.concat(result.payload),
					status: Status.SUCCESS,
				};
			}
			// BegginerLevel failed
			else if (this.checkIfLevelFailed()) {
				this.updateUnvisitedNodes(tick);
				return {
					payload: payload.concat(result.payload),
					status: Status.FAILURE,
				};
			}
		}

		// BegginerLevel running
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
				!failCount && this.failedNodes.push(servedChildIndex);
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
