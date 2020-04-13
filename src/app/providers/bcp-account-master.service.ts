import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { map } from 'rxjs/operators';
import { BCPAccountMaster } from '../models/BCPAccountMaster';

@Injectable()
export class BcpAccountMasterService {

    baseUrl = environment.apiBaseUrl;

    constructor(private httpClientService: HttpClient) {
    }

    getAccountMaster() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPAccountMaster')/items?$filter=isDeleted eq 0&$orderby=AccountName%20asc&$top=5000";
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

    getInActiveAccountMaster() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPAccountMaster')/items?$filter=isDeleted eq 1&$orderby=AccountName%20asc&$top=5000";
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


    getAccountMasterById(accountId) {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPAccountMaster')/items?$filter=Title eq " + accountId;
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
}