export interface IBCPDailyUpdate {
    AccountId: string,
    AccountName: string,
    AssociateID: string,
    Attendance: string,
    UpdateDate: string
}

export class BCPDailyUpdate implements IBCPDailyUpdate {

    constructor(
        public AccountId: string,
        public AccountName: string,
        public AssociateID: string,
        public Attendance: string,
        public UpdateDate: string) {
    }
}

export interface IDailyUpdateResponse {
    dailyUpdate: IBCPDailyUpdate[],
    count: number
}

export class DailyUpdateResponse implements IDailyUpdateResponse {

    constructor(
        public dailyUpdate: IBCPDailyUpdate[],
        public count: number) {
    }
}