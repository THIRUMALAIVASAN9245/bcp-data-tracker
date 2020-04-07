export interface IBCPDetailsGraph {
    AccountId: string,
    AccountName: string,
    AssociateID: string,
    AssociateName: string,
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

export class BCPDetailsGraph implements IBCPDetailsGraph {

    constructor(
        public AccountId: string,
        public AccountName: string,
        public AssociateID: string,
        public AssociateName: string,
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

export interface IBCPDetailsGraphResponse {
    bcpDetailsGraph: BCPDetailsGraph[],
    count: number
}

export class BCPDetailsGraphResponse implements IBCPDetailsGraphResponse {

    constructor(
        public bcpDetailsGraph: BCPDetailsGraph[],
        public count: number) {
    }
}