export interface IUserDetail {
    MarketUnit: string,
    AccountID: string,
    AccountName: string,
    AssociateId: string,
    AssociateName: string,
    ParentCustomerName: string,
    Status: string,
    AssociateResponsetoPersonalDeviceAvailabilitySurvey: string,
    FinalMISDepartment: string,
    Location: string,
    AddressforShipping: string,
    Contact: string,
    LaptopRequested: string,
    CorporateStatusLaptop: string,
    DesktopRequested: string,
    CorporateStatusDesktop: string,
    RecordType: string,
    Sort: string,
    Temporary: string,
    AlwaysNew2: string,
    DuplicateFlag: string
}

export class UserDetail implements IUserDetail {

    constructor(
        public MarketUnit: string,
        public AccountID: string,
        public AccountName: string,
        public AssociateId: string,
        public AssociateName: string,
        public ParentCustomerName: string,
        public Status: string,
        public AssociateResponsetoPersonalDeviceAvailabilitySurvey: string,
        public FinalMISDepartment: string,
        public Location: string,
        public AddressforShipping: string,
        public Contact: string,
        public LaptopRequested: string,
        public CorporateStatusLaptop: string,
        public DesktopRequested: string,
        public CorporateStatusDesktop: string,
        public RecordType: string,
        public Sort: string,
        public Temporary: string,
        public AlwaysNew2: string,
        public DuplicateFlag: string) {
    }
}

export interface IUserDetailResponse {
    userDetail: IUserDetail[],
    count: number
}

export class UserDetailResponse implements IUserDetailResponse {

    constructor(
        public userDetail: IUserDetail[],
        public count: number) {
    }
}