export enum ReportJobType {
    None = 0,
}

export interface ReportJobData {
    type: ReportJobType;
    data?: {};
}