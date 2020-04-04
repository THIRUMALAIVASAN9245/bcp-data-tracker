export interface IBCPAccountMaster {
    AccountId: string,
    AccountName: string,
    ImagePath: string
}

export class BCPAccountMaster implements IBCPAccountMaster {

    constructor(
        public AccountId: string,
        public AccountName: string,
        public ImagePath: string) {
    }
}