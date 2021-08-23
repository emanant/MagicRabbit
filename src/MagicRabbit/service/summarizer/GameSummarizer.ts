export default class GameSummarizer {
    static regenerate(gameVals: any): GameSummarizer {
        throw new Error("Method not implemented.");
    }

    private readonly POINTS_PER_TRIAL: number = 1;

    private points: number = 0;
    private bonusPoints: number = 0;
    private todayScore: number = 0;
    private currentScore: number = 0;
    private totalScore: number = 0;
    private percentThru: number = 0;
    private previousPercentThru: number = 0;

    updateWithSuccess(): void {
        // points earned with EACH trial
        this.points = this.POINTS_PER_TRIAL;

        // add points to different totals
        this.todayScore += this.POINTS_PER_TRIAL;
        this.currentScore += this.POINTS_PER_TRIAL;
        this.totalScore += this.POINTS_PER_TRIAL;

        this.previousPercentThru = this.percentThru;
        // Note:  not the real way to calculate percent through
        this.percentThru = this.percentThru + 1;

        this.bonusPoints = 5;
    }

    updateWithFailure(): void {
        this.points = 0;
        this.bonusPoints = 0;
    }

    get pointsPerTrial(): number {
        return this.points;
    }

    get bonusPointsPerTrial(): number {
        return this.bonusPoints;
    }

    get scoreCurrent(): number {
        return this.currentScore;
    }

    get scoreToday(): number {
        return this.todayScore;
    }

    get scoreTotal(): number {
        return this.totalScore;
    }

    get percentComplete(): number {
        return this.percentThru;
    }

    get previousPercentComplete(): number {
        return this.previousPercentThru;
    }
}
