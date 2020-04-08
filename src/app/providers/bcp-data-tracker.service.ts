import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { environment } from 'src/environments/environment.prod';
import { BCPDetailsUpdate, BCPDetailsUpdateResponse } from '../models/BCPDetailsUpdate';


@Injectable()
export class BcpDataTrackerService {

    baseUrl = environment.apiBaseUrl;

    constructor(private httpClientService: HttpClient) {
    }

    getDataTracker(projectId: any) {
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=(startswith(AccountID,%27" + projectId + "%27)%20and%20IsDeleted%20eq%200)&$top=5000";
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
            const courseDetails = resspone[0].d.results.map(item => {
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
                    item.Id,
                    item.IsDeleted == 0 ? "Active" : "Inactive"
                );
            });

            return new BCPDetailsUpdateResponse(courseDetails, 10)
        }));
    }

    insertDataTracker(bcpDataUpdate, associateId, projectId, formDigestValue) {
        const listName = "BCPDataTracker";
        var itemType = this.getItemTypeForListName(listName);
        var item = {
            "__metadata": { "type": itemType },
            "Title": projectId,
            "AssociateID": associateId,
            "CurrentEnabledforWFH": bcpDataUpdate.CurrentEnabledforWFH,
            "WFHDeviceType": bcpDataUpdate.WFHDeviceType,
            "Comments": bcpDataUpdate.Comments,
            "IstheResourceProductivefromHome": bcpDataUpdate.IstheResourceProductivefromHome,
            "PersonalReason": bcpDataUpdate.PersonalReason,
            "AssetId": bcpDataUpdate.AssetId,
            "PIIDataAccess": bcpDataUpdate.PIIDataAccess,
            "Protocol": bcpDataUpdate.Protocol,
            "BYODCompliance": bcpDataUpdate.BYODCompliance,
            "Dongle": bcpDataUpdate.Dongles,
            "UpdateDate": moment().format("DD-MM-YYYY")
        };

        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json;charset=UTF-8;odata=verbose',
            'Cache-Control': 'no-cache',
            'accept': 'application/json;odata=verbose',
            "X-HTTP-Method": "POST",
            "X-RequestDigest": formDigestValue
        });
        let options = {
            headers: httpHeaders,
        };
        var siteUrl = this.baseUrl + "_api/lists/getbytitle('" + listName + "')/items";
        return this.httpClientService.post<any>(siteUrl, JSON.stringify(item), options)
            .pipe(map((resspone: any) => {
                return resspone;
            }));
    }

    updateDataTracker(bcpDataUpdate, listUpdateId, formDigestValue) {
        const listName = "BCPDataTracker";
        var itemType = this.getItemTypeForListName(listName);
        var item = {
            "__metadata": { "type": itemType },
            "CurrentEnabledforWFH": bcpDataUpdate.CurrentEnabledforWFH,
            "WFHDeviceType": bcpDataUpdate.WFHDeviceType,
            "Comments": bcpDataUpdate.Comments,
            "IstheResourceProductivefromHome": bcpDataUpdate.IstheResourceProductivefromHome,
            "PersonalReason": bcpDataUpdate.PersonalReason,
            "AssetId": bcpDataUpdate.AssetId,
            "PIIDataAccess": bcpDataUpdate.PIIDataAccess,
            "Protocol": bcpDataUpdate.Protocol,
            "BYODCompliance": bcpDataUpdate.BYODCompliance,
            "Dongle": bcpDataUpdate.Dongles,
            "UpdateDate": moment().format("DD-MM-YYYY")
        };

        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json;charset=UTF-8;odata=verbose',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json;odata=verbose',
            "X-HTTP-Method": "MERGE",
            "If-Match": "*",
            "X-RequestDigest": formDigestValue
        });
        let options = {
            headers: httpHeaders,
        };
        var siteUrl = this.baseUrl + "_api/lists/getbytitle('" + listName + "')/items(" + listUpdateId + ")";
        return this.httpClientService.post<any>(siteUrl, JSON.stringify(item), options)
            .pipe(map((resspone: any) => {
                return resspone;
            }));
    }

    private getItemTypeForListName(name) {
        return "SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";
    }
}