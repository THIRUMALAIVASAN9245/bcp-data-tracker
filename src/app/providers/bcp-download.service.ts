import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';
import { BCPDetailsUpdate } from '../models/BCPDetailsUpdate';
import * as moment from 'moment'
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDetail } from '../models/user-details';

@Injectable()
export class BcpDownloadService {

    baseUrl = environment.apiBaseUrl;

    masterDataCount = 0;
    dailyUpdateCount = 0;
    recordsToReturn = 4000;
    constructor(private httpClientService: HttpClient) {
    }

    exportAllAccountDetails(masterDataCount: number, dailyUpdateCount: number) {
        var apiURLMaster = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?";
        var apiURLDataTracker = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?";
        var apiURLDaily = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?";

        var masterURLs = [];
        var dataTrackerURLs = [];
        var dailyUpdateURLs = [];
        this.masterDataCount = masterDataCount;
        this.dailyUpdateCount = dailyUpdateCount;

        masterURLs = masterURLs.concat(this.loopURL(this.generateURL(apiURLMaster), this.masterDataCount));
        dataTrackerURLs = dataTrackerURLs.concat(this.loopURL(this.generateURL(apiURLDataTracker), this.masterDataCount));
        dailyUpdateURLs = dailyUpdateURLs.concat(this.loopURL(this.generateURL(apiURLDaily), this.dailyUpdateCount));

        var serviceCalls = [];

        serviceCalls = masterURLs;
        serviceCalls = serviceCalls.concat(dataTrackerURLs);
        serviceCalls = serviceCalls.concat(dailyUpdateURLs);
        return forkJoin(serviceCalls);
    }

    exportAccountDetails(filters: any) {
        var dailyUpdateURLs = [];
        this.dailyUpdateCount = filters.dailyUpdateCount;

        var apiURLMaster = this.getMasterURL(filters);
        // var apiURLUpdate = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=UpdateDate eq '" + today + "'&Title eq " + filters.projectId + " &contains(AssociateID, '" + filters.associateNameOrId + "')&$top=1000";
        // var apiURLDaily = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=Title eq " + filters.projectId + "&$top=4000";
        var apiURLDataTracker = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=Title eq %27" + filters.projectId + "%27&$top=" + this.recordsToReturn;
        var apiURLDaily = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=Title eq %27" + filters.projectId + "%27"; // + "%27 &$top=" + this.recordsToReturn;

        let getMaster = this.httpClientService.get(apiURLMaster);
        var dataTrackerURLs = this.httpClientService.get(apiURLDataTracker);
        dailyUpdateURLs = dailyUpdateURLs.concat(this.loopURL(this.generateURL(apiURLDaily + "&"), this.dailyUpdateCount));

        var serviceCalls = [];
        serviceCalls.push(getMaster);
        serviceCalls.push(dataTrackerURLs);
        serviceCalls = serviceCalls.concat(dailyUpdateURLs);

        return forkJoin(serviceCalls);

        // return forkJoin([getMaster, getUpdate, getDaily]).pipe(map((resspone: any) => {
        //     const exportData = [] as any;
        //     const getMasterDetails = resspone[0].value.map(item => {
        //         return new UserDetail(
        //             item.Title,
        //             item.AccountID,
        //             item.AccountName,
        //             item.AssociateID,
        //             item.AssociateName,
        //             item.ParentCustomerName,
        //             item.Status,
        //             item.AssociateResponsetoPersonalDeviceAvailabilitySurvey,
        //             item.FinalMISDepartment,
        //             item.Location,
        //             item.AddressforShipping,
        //             item.Contact,
        //             item.LaptopRequested,
        //             item.CorporateStatusLaptop,
        //             item.DesktopRequested,
        //             item.CorporateStatusDesktop,
        //             item.RecordType,
        //             item.Sort,
        //             item.Temporary,
        //             item.AlwaysNew2,
        //             item.DuplicateFlag,
        //             item.isDeleted == "N" ? false : true
        //         );
        //     });

        //     const getUpdate = resspone[1].d.results.map(item => {
        //         return new BCPDetailsUpdate(
        //             item.AccountID,
        //             item.AssociateID,
        //             item.CurrentEnabledforWFH,
        //             item.WFHDeviceType,
        //             item.Comments,
        //             item.IstheResourceProductivefromHome,
        //             item.PersonalReason,
        //             item.AssetId,
        //             item.PIIDataAccess,
        //             item.Protocol,
        //             item.BYODCompliance,
        //             item.Dongle,
        //             item.UpdateDate,
        //             ""
        //         );
        //     });

        //     const getDaily = resspone[2].d.results.map(item => {
        //         return new BCPDailyUpdate(
        //             item.Title,
        //             item.AssociateID,
        //             item.Attendance,
        //             item.UpdateDate
        //         );
        //     });

        //     exportData.push(getMasterDetails);
        //     exportData.push(getUpdate);
        //     exportData.push(getDaily);

        //     return exportData;
        // }));
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

        return apiURLMaster += "AccountID eq " + filters.projectId + "&$top=" + this.recordsToReturn;
    }

    loopURL(api: string, httpCallCount: number) {
        var getMasterCall = [];
        var callCount = this.httpCallCount(httpCallCount);
        var numberOfCallCount = Array.from(new Array(callCount), (x, i) => i + 1)
        numberOfCallCount.forEach((CallCount, index) => {
            const itemCount = index * this.recordsToReturn;
            const apiCall = api + itemCount + "&%24top=" + this.recordsToReturn;
            getMasterCall.push(this.httpClientService.get(apiCall));
        });
        if (callCount == 0) {
            getMasterCall.push(this.getDataFromUrl(api + 0 + "&$top=" + this.recordsToReturn));
        }
        return getMasterCall;
    }

    generateURL(url: string) {
        return url + "%24skiptoken=Paged%3dTRUE%26p_ID%3d";
    }

    getDataFromUrl(url: string) {
        return this.httpClientService.get(url);
    }

    httpCallCount(count: any) {
        return Math.ceil(count / this.recordsToReturn);
    }

    forkJoin(serviceCalls: any) {

        return forkJoin(serviceCalls).pipe(map((response: any) => {
            const exportData = [] as any;
            var masterDataCount = this.httpCallCount(this.masterDataCount);
            var dailyTrackerCount = this.httpCallCount(this.dailyUpdateCount);
            var allMasterDetail = [];
            if (masterDataCount == 0) {
                allMasterDetail.push(response[0].value);
            }
            for (var index = 0; index < masterDataCount; index++) {
                allMasterDetail.push(...response[index].value);
            }
            const getMasterDetails = allMasterDetail.map(item => {
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
                    item.DuplicateFlag,
                    item.isDeleted == "N" ? false : true
                );
            });

            var dataTracker = [];
            if (masterDataCount == 0) {
                dataTracker.push(response[1].value);
            }

            for (var index = masterDataCount; index < masterDataCount + masterDataCount; index++) {
                dataTracker.push(...response[index].value);
            }

            const getUpdate = dataTracker.map(item => {
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

            var dailyUpdate = [];
            if (dailyTrackerCount == 0) {
                dailyUpdate.push(response[2].value);
            }
            for (var index = masterDataCount * 2; index < masterDataCount * 2 + dailyTrackerCount; index++) {
                dailyUpdate.push(...response[index].value);
            }

            const getDaily = dailyUpdate.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });

            exportData.push(getMasterDetails);
            exportData.push(getUpdate);
            exportData.push(getDaily);

            return exportData;
        }));
    }

    getDailyUpdateCount() {
        const url = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/ItemCount";
        return this.httpClientService.get(url).pipe(map((response: any) => {
            if (response && response.value) {
                return response.value;
            }
        }));
    }

    getMasterDetailsCount() {
        const url = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/ItemCount";
        return this.httpClientService.get(url).pipe(map((response: any) => {
            if (response && response.value) {
                return response.value;
            }
        }));
    }
}