import { UnitStatus } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

export interface ICompletionUnit {
    id: string;
    total: number;
    correct: number;
    status: UnitStatus;
}