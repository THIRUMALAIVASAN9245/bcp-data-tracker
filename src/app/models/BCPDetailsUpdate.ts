export interface IBCPDetailsUpdate {
    AccountId: string,
    AssociateID: string,
    CurrentEnabledforWFH: string,
    WFHDeviceType: string,
    Comments: string,
    IstheResourceProductivefromHome: string,
    PersonalReason: string,
    AssetId: string,
    PIIDataAccess: string,
    Protocol: string,
    BYODCompliance: string,
    Dongles: string,
    UpdateDate: string,
    UniqueId: string
}

export class BCPDetailsUpdate implements IBCPDetailsUpdate {

    constructor(
        public AccountId: string,
        public AssociateID: string,
        public CurrentEnabledforWFH: string,
        public WFHDeviceType: string,
        public Comments: string,
        public IstheResourceProductivefromHome: string,
        public PersonalReason: string,
        public AssetId: string,
        public PIIDataAccess: string,
        public Protocol: string,
        public BYODCompliance: string,
        public Dongles: string,
        public UpdateDate: string,
        public UniqueId: string) {
    }
}

export interface IBCPDetailsUpdateResponse {
    bcpDetailsUpdate: BCPDetailsUpdate[],
    count: number
}

export class BCPDetailsUpdateResponse implements IBCPDetailsUpdateResponse {

    constructor(
        public bcpDetailsUpdate: BCPDetailsUpdate[],
        public count: number) {
    }
}