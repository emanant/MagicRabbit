// based on HPNNE's classes; leaving these in here for now b/c wouldn't it be great to be using more classes
// so we could take advantage of type-checking. These are mostly used in DataLog.ts.
import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

export class QuestionObject {
    id: string;
    viewID: string;
    currentStage: number;
    currentStimSetRef: string;
    mechanicName: any;

    constructor() {

    }
}

export class TrialInfoObject {
    questionObject: QuestionObject;
    secondsScheduledToday: number;
    secondsRemaining: number;
    sessionScore: number;
    percentComplete: number;
    prevPercentComplete: number;
    consecutiveCorrect: number;
    scoreInc: number;
    bonusScore: number;
    totalStreaks: number;
    highestStreak: number;
    currentStreak: number;
    prevStreak: number;
    protocol: number;
    sessionID: number;

    exercise: string;
    sessionTrials: string[];
    trainingDate: string;
    trainingDay: number;
    timestamp: Date;
    totalUnits: number;
    passedUnits: number;
    totalTrialCount: number;
    randomSeed: number;
    inactivityTime: number;
    trialNumber: number;

    interventions: any;

    constructor() {

    }
}

export interface IProgressionPayload {
    id?: string;
    item?: string;
    mechanic: string;
    viewID: string;
    incorrectImpossible?: boolean;
    hintHighlight?: boolean;
    singleSweep?: string;
    extraLongSweep?: boolean;
    audioFeedback?: boolean;
    playSweep?: boolean;
    activateOR?: boolean;
    playReward?: boolean;
    tutBeforeOr?: string | string[];
    tutAfterOr?: string | string[];
    gameOver?: boolean;
    disableHelp?: boolean;
    replayButtonIntroduced?: boolean;
    automaticExit?: boolean;
}
export interface IGlobalVariables {
    percentComplete: number;
    prevPercentComplete: number;
    sessionScore: number;
    trialPassSessionScore: number;
    scoreInc: number;
    currentStreak: number;
    prevStreak: number;
    highestStreak: number;
    sessionAnswers: boolean[];
    sessionTrials: any[];
    randomSeed: string;
    secondsScheduledToday: number;
    secondsRemaining: number;
    lastTrialTimeSpent: number;
    highestStreakVisibility: boolean;
    backgroundID: number;
    sessionID: string;
    tutBeforeOr: string | string[];
    addlSessionScore: number;
    logInfo: ILogInfo;
    logObj: any;
    reversals: string[];
    reversalsExtended: any[];
    trackingStop: boolean;
    trialNumber: string;
    lastNode: string;
    lastFDI: any;
    componentIntro: any;
    maxAutoplay: number;
    bonusScore: number;
    learnerName: string;
    exercise: string;
    resetGoButton: boolean;
}
export interface ILogInfo {
    logIndex: number;
    lastScore: number;
    trialCount: number;
    totalTrialCount: number;
    secondsTrained: number;
    totalSecondsTrained: number;
    lastNode: string;
}

export enum TrialResultEvent {
    PASS = <any>"pass",
    FAIL = <any>"fail",
    HELP = <any>"help",
    FORCE_PASS = <any>"force pass",
    FORCE_FAIL = <any>"force fail",
    SKIP_TUTORIAL = <any>"skip tutorial"
}

export enum SkinEvent {
    GO_TOUCH = <any>"GO_touch"
}

export interface IPPDebugEvent {
    trialResult: TrialResultEvent;
    progressionData: IProgressionData;
    normalFeedback: boolean;
}

export enum GOEvents {
    GO_ACTIVE = <any>"Go Active",
    GO_INACTIVE = <any>"Go Inactive"
}

