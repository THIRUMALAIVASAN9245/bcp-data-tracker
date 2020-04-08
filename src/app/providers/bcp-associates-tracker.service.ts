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
export class BcpAssociateTrackerService {

    baseUrl = environment.apiBaseUrl;

    constructor(private httpClientService: HttpClient) {
    }

    getBcpAssociateTracker(projectId: any) {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$filter=AccountID eq " + projectId + " and isDeleted eq 0&$top=5000";
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
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

    getBcpAssociateTrackerAll() {
        var apiURL = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$filter=isDeleted eq 0&$top=10000";
        let getCourses = this.httpClientService.get(apiURL);

        return forkJoin([getCourses]).pipe(map((resspone: any) => {
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


    getBCPUpdateAll(projectId: any) {
        const date = moment().format("DD-MM-YYYY");
        var apiURL = this.baseUrl + "_vti_bin/listdata.svc/BCPDataTracker?$filter=((substringof(%27" + date + "%27,UpdateDate)%20eq%20true)%20and%20startswith(AccountID,%27" + projectId + "%27)%20and%20IsDeleted%20eq%200)&$top=1000";

        var apiURLLast = this.baseUrl + "_api/lists/getbytitle('BCPDataTracker')/items?$top=1&$select=Id&$orderby=Created%20desc";
        let getCourses = this.httpClientService.get(apiURL);
        let getCoursesCountLast = this.httpClientService.get(apiURLLast);

        return forkJoin([getCourses, getCoursesCountLast]).pipe(map((resspone: any) => {
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
}