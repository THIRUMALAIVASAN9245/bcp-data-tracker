import { Component } from '@angular/core';
import { BCPAccountMaster } from '../models/BCPAccountMaster';
import { Router } from '@angular/router';
import { AssociateDetails } from '../models/AssociateDetails';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';
import { BcpFileExportService } from '../providers/bcp-file-export-service';
import { BcpAccountMasterService } from '../providers/bcp-account-master.service';
import { BcpDownloadService } from '../providers/bcp-download.service';

@Component({
  selector: 'bcm-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  title = 'bcp-data-track';
  accountMasterData: any;
  response = [];
  searchText: string = '';
  associateDetails: AssociateDetails[] = [];
  bCPDailyUpdate: BCPDailyUpdate[] = [];
  bCPDailyUpdateCount: number = 0;

  constructor(
    private bcpAccountMasterService: BcpAccountMasterService,
    private bcpDownloadService: BcpDownloadService,
    private router: Router,
    private bcpFileExportService: BcpFileExportService) {
  }

  ngOnInit() {
    this.bcpAccountMasterService.getAccountMaster().subscribe((res: BCPAccountMaster[]) => {
      if (res && res.length > 0) {
        this.accountMasterData = res;
      }
    });
  }

  navigateAccountDetails(accountId) {
    this.router.navigate(['/bcm-user-tracker', accountId]);
  }

  downloadData() {
    this.associateDetails = [];
    this.bCPDailyUpdate = [];
    this.bcpDownloadService.exportAllAccountDetails(this.bCPDailyUpdateCount, 0).subscribe(model => {
      this.mergeData(model);
      const sheetOneResponse = this.associateDetails.length > 0 ? this.associateDetails : [new AssociateDetails("", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "")];
      const sheetTwoResponse = this.bCPDailyUpdate.length > 0 ? this.bCPDailyUpdate : [new BCPDailyUpdate("", "", "", "")];

      var dataOne = [];
      var dataTwo = [];
      for (var index = 0; index < this.accountMasterData.length; index++) {
        if (dataOne.length > 0) {
          dataOne = dataOne.concat(sheetOneResponse.filter(x => x.AccountID == this.accountMasterData[index].AccountId));
        }
        else {
          dataOne = sheetOneResponse.filter(x => x.AccountID == this.accountMasterData[index].AccountId);
        }
        if (dataTwo.length > 0) {
          dataTwo = dataTwo.concat(sheetTwoResponse.filter(x => x.AccountId == this.accountMasterData[index].AccountId));
        }
        else {
          dataTwo = sheetTwoResponse.filter(x => x.AccountId == this.accountMasterData[index].AccountId);
        }
      }
      var data = [dataOne, dataTwo];

      this.bcpFileExportService.exportAsExcelFile(data, "AllAccount");
    });
  }

  mergeData(model: any) {
    for (var index = 0; index < model[0].length; index++) {
      debugger;
      var details = model[0][index];

      var activityDetails = this.getAssciateActivity(model[1], details.AssociateId);
      var latestRecord;
      if (activityDetails != undefined && activityDetails.length > 0) {
        latestRecord = this.getLatestRecord(activityDetails);
      }
      var data = new AssociateDetails(
        model[0][index].MarketUnit,
        model[0][index].AssociateId,
        model[0][index].AssociateName,
        model[0][index].AccountID,
        model[0][index].AccountName,
        model[0][index].ParentCustomerName,
        model[0][index].Status,
        model[0][index].AssociateResponsetoPersonalDeviceAvailabilitySurvey,
        model[0][index].FinalMISDepartment,
        model[0][index].Location,
        latestRecord ? latestRecord.CurrentEnabledforWFH : "",
        latestRecord ? latestRecord.WFHDeviceType : "",
        latestRecord ? latestRecord.Comments : "",
        latestRecord ? latestRecord.IstheResourceProductivefromHome : "",
        model[0][index].AddressforShipping,
        model[0][index].Contact,
        model[0][index].LaptopRequested,
        model[0][index].CorporateStatusLaptop,
        model[0][index].DesktopRequested,
        model[0][index].CorporateStatusDesktop,
        model[0][index].RecordType,
        model[0][index].Sort,
        model[0][index].Temporary,
        model[0][index].AlwaysNew2,
        model[0][index].DuplicateFlag,
        latestRecord ? latestRecord.PersonalReason : "",
        latestRecord ? latestRecord.AssetId : "",
        latestRecord ? latestRecord.PIIDataAccess : "",
        latestRecord ? latestRecord.Protocol : "",
        latestRecord ? latestRecord.BYODCompliance : "",
        latestRecord ? latestRecord.Dongles : "");

      this.associateDetails.push(data);

      const getAddten = model[2].filter(atten => atten.AssociateID == model[0][index].AssociateId);
      if (getAddten && getAddten.length > 0) {
        if (this.bCPDailyUpdate.length > 0) {
          this.bCPDailyUpdate = this.bCPDailyUpdate.concat(getAddten);
        }
        else {
          this.bCPDailyUpdate = getAddten;
        }
      }
    }
  }

  getAssciateActivity(model: any, associateId: any) {
    var filterDetails = [];
    for (var index = 0; index < model.length; index++) {
      if (associateId == model[index].AssociateID) {
        filterDetails.push(model[index]);
      }
    }

    return filterDetails;
  }

  getLatestRecord(dataCollection: any) {
    var latestDate = new Date(Math.max.apply(null, dataCollection.map(
      function (e) {
        var parts = e.UpdateDate.split('-');
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    )));

    for (var index = 0; index < dataCollection.length; index++) {
      var parts = dataCollection[index].UpdateDate.split('-');
      var date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (latestDate.getTime() == date.getTime()) {
        return dataCollection[index];
      }
    }
  }
}