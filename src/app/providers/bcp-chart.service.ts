import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { BCPDetailsUpdate, BCPDetailsUpdateResponse } from '../models/BCPDetailsUpdate'

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

        return this.httpClientService.get(apiURL).pipe(map((response: any) => {
            console.log(response);
            return response.value;
        }));
    }

    getAccountAttendanceDataAll() {

        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items";

        return this.httpClientService.get(apiURL).pipe(map((response: any) => {
            console.log(response);
            return response.value;
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