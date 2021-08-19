import ITickResult from "@scilearn/learnflow-sdk/lib/Tree/ITickResult";
import { IBaseNodeOptions } from "@scilearn/learnflow-sdk/lib/Tree/Nodes/Abstracts/OptionInterfaces";
import MetadataNode from "@scilearn/learnflow-sdk/lib/Tree/Nodes/MetadataNode";
import Status from "@scilearn/learnflow-sdk/lib/Tree/Status";
import Tick from "@scilearn/learnflow-sdk/lib/Tree/Tick";
import * as _ from "lodash";
/**
 * @desc
 * Level will serve beginner/advanced blockNodes in order.
 * Level fails if a block node fails.
 * level will be served again at the end with failed block nodes
 */

export default class MRLevel extends MetadataNode {
    options: IBaseNodeOptions;
    constructor(id, options: IBaseNodeOptions) {
        super(id, options);
        this.options = options;
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

        // level end
        if (this.unvisitedNodes.length === 0) {
            // level passed
            if (this.failedNodes.length === 0) {
                return {
                    payload: payload.concat(result.payload),
                    status: Status.SUCCESS,
                };
            }
            // level failed
            else {
                this.updateUnvisitedNodes(tick);
                return {
                    payload: payload.concat(result.payload),
                    status: Status.FAILURE,
                };
            }
        }
        // level still running
        return {
            status: Status.RUNNING,
            payload: payload.concat(result.payload),
        };
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

    private updateUnvisitedNodes(tick: Tick): void {
        this.unvisitedNodes = this.failedNodes;
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

    updateChildMetadata(result: ITickResult, servedChildIndex): void {
        let failCount = this.childrenMetadata[servedChildIndex].failCount;
        let serveCount = this.childrenMetadata[servedChildIndex].serveCount;

        switch (result.status) {
            case Status.RUNNING:
                break;
            case Status.SUCCESS:
                _.remove(this.failedNodes, (childIndex) => childIndex === servedChildIndex);
                this.passedNodes.push(servedChildIndex);
            case Status.FAILURE:
                this.failedNodes.push(servedChildIndex);
                failCount++;
            default:
                _.remove(this.unvisitedNodes, (childIndex) => childIndex === servedChildIndex);
                serveCount++;
                break;
        }

        this.setChildMetadata(servedChildIndex, {
            serveCount: serveCount,
            failCount: failCount,
            status: result.status,
        });
    }
}
