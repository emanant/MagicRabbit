import { IProgressionData } from "@scilearn/learnflow-sdk/lib/helpers/TypesAndIdentifiers";

export default interface ILoadingSkin {
    primaryLoading(progressionData: IProgressionData): Promise<void>;
    stopLoading(progressionData?: IProgressionData): void;
    startSecondaryLoading(): void;
}
