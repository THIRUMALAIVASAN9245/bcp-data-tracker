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

    constructor(private httpClientService: HttpClient) {
    }

    getMasterDetailsToExportAll(bCPDailyUpdateCount) {
        const today = moment().format("DD-MM-YYYY");
        var apiURLMaster = this.baseUrl + "_api/lists/getbytitle('BCPMasterTrackerFull')/items?$top=4000";
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

}