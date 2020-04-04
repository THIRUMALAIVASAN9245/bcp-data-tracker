import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment.prod';

import { UserDetail, UserDetailResponse } from '../models/user-details';
import { BCPDetailsUpdate, BCPDetailsUpdateResponse } from '../models/BCPDetailsUpdate';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';

import * as moment from 'moment'
import { BCPAccountMaster } from '../models/BCPAccountMaster';

@Injectable()
export class UserDetailsService {

    baseUrl = environment.apiBaseUrl;

    constructor(private httpClientService: HttpClient) {
    }

    getAccountMaster() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPAccountMaster')/items?$orderby=AccountName%20asc&$top=1000";
        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((resspone: any) => {
            const bCPAccountMaster = resspone.value.map(item => {
                return new BCPAccountMaster(
                    item.Title,
                    item.AccountName,
                    item.ImagePath
                );
            });
            return bCPAccountMaster;
        }));
    }

    getUsers(projectId: any) {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$filter=AccountID eq " + projectId + "&$top=5000";
        var apiURLLast = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$top=1&$select=Id&$orderby=Created%20desc";
        let getCourses = this.httpClientService.get(apiURL);
        let getCoursesCountLast = this.httpClientService.get(apiURLLast);

        return forkJoin([getCourses, getCoursesCountLast]).pipe(map((resspone: any) => {
            const courseDetails = resspone[0].value.map(item => {
                return new UserDetail(
                    item.MarketUnit,
                    item.AccountID,
                    item.AccountName,
                    item.AssociateID,
                    item.AssociateName,
                    item.ParentCustomerName,
                    item.Status,
                    item.AssociateResponsetoPersonalDeviceAvailabilitySurvey,
                    item.FinalMISDepartment,
                    item.Location,
                    item.AddressforShipping,
                    item.Contact,
                    item.LaptopRequested,
                    item.CorporateStatusLaptop,
                    item.DesktopRequested,
                    item.CorporateStatusDesktop,
                    item.CorporateStatusDesktop,
                    item.CorporateStatusDesktop,
                    item.Temporary,
                    item.AlwaysNew2,
                    item.DuplicateFlag
                );
            });

            return new UserDetailResponse(courseDetails, 10)
        }));
    }

    getLatestRecordDateAvailable(projectId) {
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=(startswith(AccountID,%27" + projectId + "%27))&$orderby=Created desc&$top=1";
        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((resspone: any) => {
            debugger
            const AccountLatestData = resspone.d.map(item => {
                return new BCPDetailsUpdate(
                    item.Title,
                    item.AssociateID,
                    item.CurrentEnabledforWFH,
                    item.WFHDeviceType,
                    item.Comments,
                    item.IstheResourceProductivefromHome,
                    item.PersonalReason,
                    item.AssetId,
                    item.PIIDataAccess,
                    item.Protocol,
                    item.BYODCompliance,
                    item.Dongle,
                    item.UpdateDate,
                    item.Id
                );
            });
            return AccountLatestData;
        }));
    }

    getProjectMembersToday(projectId, date) {
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=((substringof(%27" + date + "%27,UpdateDate)%20eq%20true)%20and%20startswith(AccountID,%27" + projectId + "%27))&$top=1000";
        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((resspone: any) => {
            const AccountLatestData = resspone.d.map(item => {
                return new BCPDetailsUpdate(
                    item.Title,
                    item.AssociateID,
                    item.CurrentEnabledforWFH,
                    item.WFHDeviceType,
                    item.Comments,
                    item.IstheResourceProductivefromHome,
                    item.PersonalReason,
                    item.AssetId,
                    item.PIIDataAccess,
                    item.Protocol,
                    item.BYODCompliance,
                    item.Dongle,
                    item.UpdateDate,
                    item.Id
                );
            });
            return AccountLatestData;
        }));
    }

    getBCPUpdateAll(projectId: any) {
        const date = moment().format("DD-MM-YYYY");
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=((substringof(%27" + date + "%27,UpdateDate)%20eq%20true)%20and%20startswith(AccountID,%27" + projectId + "%27))&$top=1000";

        var apiURLLast = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$top=1&$select=Id&$orderby=Created%20desc";
        let getCourses = this.httpClientService.get(apiURL);
        let getCoursesCountLast = this.httpClientService.get(apiURLLast);

        return forkJoin([getCourses, getCoursesCountLast]).pipe(map((resspone: any) => {
            debugger;
            const courseDetails = resspone[0].d.map(item => {
                return new BCPDetailsUpdate(
                    item.AccountID,
                    item.AssociateID,
                    item.CurrentEnabledforWFH,
                    item.WFHDeviceType,
                    item.Comments,
                    item.IstheResourceProductivefromHome,
                    item.PersonalReason,
                    item.AssetId,
                    item.PIIDataAccess,
                    item.Protocol,
                    item.BYODCompliance,
                    item.Dongle,
                    item.UpdateDate,
                    item.Id
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    getBCPDetailsUpdateData(associateID, date): Observable<BCPDetailsUpdate> {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=AssociateID eq " + associateID + "&$orderby=Created%20desc&$top=1";
        return this.httpClientService.get(apiURL).pipe(map((respone: any) => {
            if (respone && respone.value) {
                return respone.value;
            }
            return [];
        }));
    }

    getAllBCPDailyUpdateDataCount(accountId) {
        const url = this.baseUrl + "_vti_bin/ListData.svc/BCPDailyUpdate/$count?$filter=((Title%20eq%20%27" + accountId + "%27))";
        return this.httpClientService.get(url).pipe(map((respone: any) => {
            debugger
            if (respone) {
                return respone;
            }
            return 0;
        }));
    }

    getMasterURL(filters: any) {
        var apiURLMaster = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$filter=";

        if (filters.associateNameOrId.trim() != "") {
            if (isNaN(parseInt(filters.associateNameOrId))) {
                apiURLMaster += "substringof('" + filters.associateNameOrId + "', AssociateName) and ";
            }
            else {
                apiURLMaster += "substringof('" + filters.associateNameOrId + "', AssociateID) and ";
            }
        }

        if (filters.department.trim() != "") {
            apiURLMaster += "substringof('" + filters.department + "',FinalMISDepartment) and ";
        }

        if (filters.location.trim() != "") {
            apiURLMaster += "Location eq '" + filters.location + "' and ";
        }

        return apiURLMaster += "AccountID eq " + filters.projectId + "&$top=4000";
    }

    getMasterDetailsToExport(filters: any, bCPDailyUpdateCount) {
        debugger;
        const today = moment().format("DD-MM-YYYY");
        var apiURLMaster = this.getMasterURL(filters);
        // var apiURLUpdate = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=UpdateDate eq '" + today + "'&Title eq " + filters.projectId + " &contains(AssociateID, '" + filters.associateNameOrId + "')&$top=1000";
        // var apiURLDaily = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=UpdateDate eq '" + today + "'&Title eq " + filters.projectId + " &contains(AssociateID, '" + filters.associateNameOrId + "')&$top=1000";

        var apiURLUpdate = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true)%20and%20startswith(AccountID,%27" + filters.projectId + "%27))&$top=1000";
        var apiURLDaily = this.baseUrl + "_vti_bin/listdata.svc/BCPDailyUpdate?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true)%20and%20startswith(Title,%27" + filters.projectId + "%27))&$top=1000";

        const getMasterCall = [];
        let getMaster = this.httpClientService.get(apiURLMaster);
        let getUpdate = this.httpClientService.get(apiURLUpdate);
        let getDaily = this.httpClientService.get(apiURLDaily);

        getMasterCall.push(getMaster);
        getMasterCall.push(getUpdate);
        getMasterCall.push(getDaily);

        const httpCallCount = Math.round(bCPDailyUpdateCount / 4500);
        var numberOfCallCount = Array.from(new Array(httpCallCount), (x, i) => i + 1);
        if (numberOfCallCount.length == 0) {
            numberOfCallCount.push(1);
        }

        numberOfCallCount.forEach((CallCount, index) => {
            const itemCount = index * 4500;
            const apiCall = this.baseUrl + "_vti_bin/ListData.svc/BCPDailyUpdate?$skip=" + itemCount + "&$top=4500&$filter=((Title%20eq%20%27" + filters.projectId + "%27))";
            getMasterCall.push(this.httpClientService.get(apiCall));
        });

        return forkJoin(getMasterCall).pipe(map((resspone: any) => {
            debugger;
            const exportData = [] as any;
            const getMasterDetails = resspone[0].value.map(item => {
                return new UserDetail(
                    item.Title,
                    item.AccountID,
                    item.AccountName,
                    item.AssociateID,
                    item.AssociateName,
                    item.ParentCustomerName,
                    item.Status,
                    item.AssociateResponsetoPersonalDeviceAvailabilitySurvey,
                    item.FinalMISDepartment,
                    item.Location,
                    item.AddressforShipping,
                    item.Contact,
                    item.LaptopRequested,
                    item.CorporateStatusLaptop,
                    item.DesktopRequested,
                    item.CorporateStatusDesktop,
                    item.RecordType,
                    item.Sort,
                    item.Temporary,
                    item.AlwaysNew2,
                    item.DuplicateFlag
                );
            });

            const getUpdate = resspone[1].d.map(item => {
                return new BCPDetailsUpdate(
                    item.AccountID,
                    item.AssociateID,
                    item.CurrentEnabledforWFH,
                    item.WFHDeviceType,
                    item.Comments,
                    item.IstheResourceProductivefromHome,
                    item.PersonalReason,
                    item.AssetId,
                    item.PIIDataAccess,
                    item.Protocol,
                    item.BYODCompliance,
                    item.Dongle,
                    item.UpdateDate,
                    ""
                );
            });

            const getDaily = resspone[2].d.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });

            debugger;
            const allMasterDetail = [];
            resspone.forEach((responsesCount, responsesCountIndex) => {
                if (responsesCountIndex > 2) {
                    allMasterDetail.push(...resspone[responsesCountIndex].d.results);
                }
            });

            const getallMasterDetailDaily = allMasterDetail.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });

            exportData.push(getMasterDetails);
            exportData.push(getUpdate);
            // exportData.push(getDaily);
            exportData.push(getallMasterDetailDaily);

            return exportData;
        }));
    }

    getAllBCPDailyUpdateDataCountAll() {
        const url = this.baseUrl + "_vti_bin/ListData.svc/BCPDailyUpdate/$count";
        return this.httpClientService.get(url).pipe(map((respone: any) => {
            debugger
            if (respone) {
                return respone;
            }
            return 0;
        }));
    }

    getMasterDetailsToExportAll(bCPDailyUpdateCount) {
        const today = moment().format("DD-MM-YYYY");
        var apiURLMaster = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$top=4000";
        // var apiURLUpdate = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=UpdateDate eq '" + today + "'&$top=4000";
        // var apiURLDaily = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=UpdateDate eq '" + today + "'&$top=4000";

        var apiURLUpdate = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true))&$top=5000";
        var apiURLDaily = this.baseUrl + "_vti_bin/listdata.svc/BCPDailyUpdate?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true))&$top=5000";

        const getMasterCall = [];
        let getMaster = this.httpClientService.get(apiURLMaster);
        let getUpdate = this.httpClientService.get(apiURLUpdate);
        let getDaily = this.httpClientService.get(apiURLDaily);

        getMasterCall.push(getMaster);
        getMasterCall.push(getUpdate);
        getMasterCall.push(getDaily);

        const httpCallCount = Math.round(bCPDailyUpdateCount / 1000);
        var numberOfCallCount = Array.from(new Array(httpCallCount), (x, i) => i + 1);

        const apiCall = this.baseUrl + "_vti_bin/ListData.svc/BCPDailyUpdate?$skip=0&$top=4500";
        getMasterCall.push(this.httpClientService.get(apiCall));

        numberOfCallCount.forEach((CallCount, index) => {
            const itemCount = CallCount * 1000;
            const apiCall = this.baseUrl + "_vti_bin/ListData.svc/BCPDailyUpdate?$skip=" + itemCount + "&$top=4500";
            getMasterCall.push(this.httpClientService.get(apiCall));
        });

        return forkJoin(getMasterCall).pipe(map((resspone: any) => {
            const exportData = [] as any;
            const getMasterDetails = resspone[0].value.map(item => {
                return new UserDetail(
                    item.Title,
                    item.AccountID,
                    item.AccountName,
                    item.AssociateID,
                    item.AssociateName,
                    item.ParentCustomerName,
                    item.Status,
                    item.AssociateResponsetoPersonalDeviceAvailabilitySurvey,
                    item.FinalMISDepartment,
                    item.Location,
                    item.AddressforShipping,
                    item.Contact,
                    item.LaptopRequested,
                    item.CorporateStatusLaptop,
                    item.DesktopRequested,
                    item.CorporateStatusDesktop,
                    item.RecordType,
                    item.Sort,
                    item.Temporary,
                    item.AlwaysNew2,
                    item.DuplicateFlag
                );
            });

            const getUpdate = resspone[1].d.results.map(item => {
                return new BCPDetailsUpdate(
                    item.AccountID,
                    item.AssociateID,
                    item.CurrentEnabledforWFH,
                    item.WFHDeviceType,
                    item.Comments,
                    item.IstheResourceProductivefromHome,
                    item.PersonalReason,
                    item.AssetId,
                    item.PIIDataAccess,
                    item.Protocol,
                    item.BYODCompliance,
                    item.Dongle,
                    item.UpdateDate,
                    ""
                );
            });

            const getDaily = resspone[2].d.results.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });

            debugger;
            const allMasterDetail = [];
            resspone.forEach((responsesCount, responsesCountIndex) => {
                if (responsesCountIndex > 2) {
                    allMasterDetail.push(...resspone[responsesCountIndex].d.results);
                }
            });

            const getallMasterDetailDaily = allMasterDetail.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });

            exportData.push(getMasterDetails);
            exportData.push(getUpdate);
            // exportData.push(getDaily);
            exportData.push(getallMasterDetailDaily);

            return exportData;
        }));
    }


    getAttendanceToday(projectId) {
        let date = moment().format("DD-MM-YYYY");
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDailyUpdate?$filter=((substringof(%27" + date + "%27,UpdateDate)%20eq%20true)%20and%20startswith(AccountID,%27" + projectId + "%27))&$top=1";
        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((resspone: any) => {
            const AccountLatestData = resspone.value.map(item => {
                return new BCPDailyUpdate(
                    item.AccountId,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });
            return AccountLatestData;
        }));
    }

    getUpdatedUsers(accountId: string): any {
        debugger;
        const today = moment().format("DD-MM-YYYY");
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDailyUpdate?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true)%20and%20startswith(Title,%27" + accountId + "%27))&$top=1000";

        return this.httpClientService.get(apiURL).pipe(map((response: any) => {
            return response.d;
        }));
    }
}