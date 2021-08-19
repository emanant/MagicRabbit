import {
    IGamePost, ITrialPostAlerts, UnitStatus, UnitType
} from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

export enum ALERT_STAGES {
    STAGE_1 = <any>"Alert01",
    STAGE_2 = <any>"Alert02",
    STAGE_3 = <any>"Alert03",
    STAGE_4 = <any>"Alert04",
    STAGE_5 = <any>"Alert05",
    STAGE_6 = <any>"Alert06",
    STAGE_7 = <any>"Alert07"
}

export enum NUM_STAGES_TO_PASS {
    STANDARD_SET = 45
}

export class IUnitObj {
    id: string;
    correctNum: number;
    status: UnitStatus;
}

// TODO:  Update this with the name of your exercise
// For example BuzzFlyHCResponseTrialResponseTime
export const TRIAL_RESPONSE_TIME = "<YourBuzzFlyHC>TrialResponseTime";

export class GamePost implements IGamePost {
    currentScore: number;
    todayScore: number;
    totalScore: number;
    streakCount: number;
    percentThru: number;
    unitType: UnitType;
    unitStatus: UnitStatus;
    scopeStageRef?: string;
    scopeStimSetRef?: string;
    alerts?: ITrialPostAlerts[];
    interventionName?: string;
    interventionCriteria?: string;
    displayOnly: boolean;
    points: number;
    bonusPoints: number;
    totalUnits: number;
    passedUnits: number;
    responseTime: number;
    correct: boolean;
    response: string;
    target?: string;
    stimRef?: string;
    trialRef: string;
    nodeId: string;
    autoPlayEnabled: boolean;
    autoPlayGoal: number;
    autoPlayStreak: number;
    helpClicks: number;
    replayClicks: number;
    trialAttemptCount: number;
    trialErrorCount: number;
    completionUnitId: string;
    completionUnitStatus: UnitStatus;
    completionUnitTotal: number;
    completionUnitCorrect: number;
    correctCount?: number;
    totalCorrectCount?: number;
    trackingOn: boolean;
    reversalOccured: boolean;
}

export interface IGamePostParam {
    displayOnly?: boolean;
    interventionFlag?: boolean;
    itemStr?: string;
    levelRef?: string;
    stageRef?: string;
    trialRef?: string;
    interventionName?: string;
    stimSetRef?: string;
    stimRef?: string;
}
