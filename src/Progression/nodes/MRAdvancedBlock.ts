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
export default class MRBrginnerBlock extends MetadataNode {
    options: IBaseNodeOptions;
    constructor(id, options: IBaseNodeOptions) {
        super(id, options);
        this.options = options;
    }

    public open(tick: Tick): void {
        this.initFromState(tick);
        this.initChildMetadata(tick);
    }

    protected initFromState(tick: Tick): void {
        this.childrenMetadata = tick.blackboard.get("childrenMetadata", tick.tree.id, this.id);
        this.unvisitedNodes =
            tick.blackboard.get("unvisitedNodes", tick.tree.id, this.id) || RandomizationHelper.shuffle(_.range(this.children.length)).slice(0, 20);
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

        const lastFailedChildIndex = this.failedNodes[this.failedNodes.length - 1];
        const pbtReached = this.childrenMetadata[lastFailedChildIndex].failCount === 0;

        // serve last failed node or select next unvisited child
        return pbtReached ? this.unvisitedNodes[0] : lastFailedChildIndex;
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

        // AdvancedBlock end
        if (this.unvisitedNodes.length === 0) {
            // AdvancedBlock passed
            if (this.failedNodes.length === 0) {
                return {
                    payload: payload.concat(result.payload),
                    status: Status.SUCCESS,
                };
            }
            // AdvancedBlock failed
            else if (this.checkIfAdvancedBlockFailed()) {
                this.updateUnvisitedNodes(tick);
                return {
                    payload: payload.concat(result.payload),
                    status: Status.FAILURE,
                };
            }
        }
        // AdvancedBlock running
        return {
            status: Status.RUNNING,
            payload: payload.concat(result.payload),
        };
    }

    // serve failed texts again
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
            case Status.RUNNING:
                break;
            case Status.SUCCESS:
                _.remove(this.failedNodes, (childIndex) => childIndex === servedChildIndex);
                this.passedNodes.push(servedChildIndex);
            case Status.FAILURE:
                failCount = (failCount + 1) % 3;
                if (failCount === 1) {
                    this.failedNodes.push(servedChildIndex);
                }
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

    private checkIfAdvancedBlockFailed(): boolean {
        let advancedBlockFailed = true;
        this.failedNodes.forEach((child) => {
            if (this.childrenMetadata[child].failCount != 0) {
                advancedBlockFailed = false;
            }
        });
        return advancedBlockFailed;
    }

    // increment passed unit on success
    private updatePassedUnits(status: Status, tick: Tick, id: string): void {
        if (status === Status.SUCCESS) {
            tick.blackboard.set("passedUnits", (tick.blackboard.get("passedUnits") || 0) + 1);
            // for debugging
            tick.blackboard.set("passedUnitsArr", (tick.blackboard.get("passedUnitsArr") || []).push(id));
        }
    }
}
