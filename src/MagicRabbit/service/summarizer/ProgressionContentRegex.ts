export class ProgressionContentRegex {

    static getCompletionUnit(id: string): string {
        return "1";
    }

    static getTrialRef(nodeData: any): string {
        let setRef = ProgressionContentRegex.getSetRef(nodeData);
        let stageRef = ProgressionContentRegex.getStageRef(nodeData);
        let stimRef = 1;
        return `${setRef}_${stageRef}_${stimRef}`;
    }

    private static getLevelRef(nodeData: any): string {
        return nodeData.freq;
    }

    private static getSetRef(nodeData: any): string {
        return nodeData.freq + "_" + nodeData.duration;
    }

    private static getStageRef(nodeData: any): string {
        return nodeData.item.lastIndexOf("S") === -1
        ? nodeData.item
        : nodeData.item.substring(nodeData.item.lastIndexOf("S") + 1);
    }
}
