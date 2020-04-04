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

    getUpdate(projectId: any) {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$filter=Title eq " + projectId + "&$top=5000";        
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
            debugger;
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
                    item.Id
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    getUpdateAll() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$top=5000";
        var apiURLLast = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$top=1&$select=Id&$orderby=Created%20desc";
        let getCourses = this.httpClientService.get(apiURL);
        let getCoursesCountLast = this.httpClientService.get(apiURLLast);

        return forkJoin([getCourses, getCoursesCountLast]).pipe(map((resspone: any) => {
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
                    item.Id
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    getAccountAttendanceData(accountId) {
        
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPDailyUpdate')/items?$filter=Title eq " + accountId +"&$top=5000";

        return this.httpClientService.get(apiURL).pipe(map((response: any) => {
            console.log(response);
            return response.value;
        }));
    }
}