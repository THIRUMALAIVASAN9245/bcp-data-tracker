import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { BCPDetailsUpdate, BCPDetailsUpdateResponse } from '../models/BCPDetailsUpdate'
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';

@Injectable()
export class BcpChartService {
    baseUrl = environment.apiBaseUrl;
    constructor(private httpClientService: HttpClient) {
    }

    getBCPDataTrackerHistory(projectId: any) {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=Title eq " + projectId + " and IsDeleted eq 0 &$top=5000";
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
            const courseDetails = resspone[0].value.map(item => {
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
                    item.Id,
                    item.IsDeleted == 0 ? "Active" : "Inactive"
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    getBCPDataTrackerHistoryAll() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=IsDeleted eq 0 &$top=10000";
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
            const courseDetails = resspone[0].value.map(item => {
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
                    item.Id,
                    item.IsDeleted == 0 ? "Active" : "Inactive"
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    getAccountAttendanceData(accountId) {

        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=Title eq " + accountId + "&$top=5000";

        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((response: any) => {
            const bCPDailyUpdate = response.value.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AccountName,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });
            return bCPDailyUpdate;
        }));
    }

    getAccountAttendanceDataAll() {

        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$top=20000";

        let getData = this.httpClientService.get(apiURL);
        return getData.pipe(map((response: any) => {
            const bCPDailyUpdate = response.value.map(item => {
                return new BCPDailyUpdate(
                    item.Title,
                    item.AccountName,
                    item.AssociateID,
                    item.Attendance,
                    item.UpdateDate
                );
            });
            return bCPDailyUpdate;
        }));
    }

    getBCPDataTrackerHistoryCount(accountId) {
        const url = this.baseUrl + "_vti_bin/ListData.svc/BCPMasterTrackerFull/$count?$filter=(startswith(AccountID,%27" + accountId + "%27)%20and%20IsDeleted%20eq%200)";
        return this.httpClientService.get(url).pipe(map((respone: any) => {
            if (respone) {
                return respone;
            }
            return 0;
        }));
    }

    getBCPDataTrackerHistoryCountAll() {
        const url = this.baseUrl + "_vti_bin/ListData.svc/BCPMasterTrackerFull/$count?$filter=IsDeleted%20eq%200";
        return this.httpClientService.get(url).pipe(map((respone: any) => {
            if (respone) {
                return respone;
            }
            return 0;
        }));
    }
}