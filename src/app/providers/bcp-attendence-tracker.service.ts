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
export class BcpAttendenceTrackerService {

    baseUrl = environment.apiBaseUrl;

    constructor(private httpClientService: HttpClient) {
    }

    getAttendenceTracker(accountId: string): any {
        debugger;
        const today = moment().format("DD-MM-YYYY");
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDailyUpdate?$filter=((substringof(%27" + today + "%27,UpdateDate)%20eq%20true)%20and%20startswith(Title,%27" + accountId + "%27))&$top=5000";

        return this.httpClientService.get(apiURL).pipe(map((response: any) => {
            return response.d;
        }));
    }

    insertAttendenceTracker(associateId, projectId, formDigestValue) {
        let listName = "BCPDailyUpdate";
        var itemType = this.getItemTypeForListName(listName);
        let item = {
            "__metadata": { "type": itemType },
            "Title": projectId,
            "AssociateID": associateId,
            "Attendance": "No",
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

    deleteAttendenceTracker(listUpdateId, formDigestValue) {
        let listName = "BCPDailyUpdate";
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json;charset=UTF-8;odata=verbose',
            'Cache-Control': 'no-cache',
            'accept': 'application/json;odata=verbose',
            "X-HTTP-Method": "DELETE",
            "If-Match": "*",
            "X-RequestDigest": formDigestValue
        });
        let options = {
            headers: httpHeaders,
        };

        var siteUrl = this.baseUrl + "_api/lists/getbytitle('" + listName + "')/items(" + listUpdateId + ")";
        return this.httpClientService.delete<any>(siteUrl, options)
            .pipe(map((resspone: any) => {
                return resspone;
            }));
    }

    updateAttendenceTracker(attendence, listUpdateId, formDigestValue) {
        let listName = "BCPDailyUpdate";
        var itemType = this.getItemTypeForListName(listName);
        let item = {
            "__metadata": { "type": itemType },
            "Attendance": attendence
        };

        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json;charset=UTF-8;odata=verbose',
            'Cache-Control': 'no-cache',
            'accept': 'application/json;odata=verbose',
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