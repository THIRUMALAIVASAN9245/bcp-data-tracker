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
  bCPMasterDataCount: number = 0;
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

    this.getDataCound();
  }

  private getDataCound() {
    this.bcpDownloadService.getMasterDetailsCount().subscribe(masterDetailCount => {
      this.bCPMasterDataCount = masterDetailCount;
      this.bcpDownloadService.getDailyUpdateCount().subscribe(dailyUpdateCount => {
        this.bCPDailyUpdateCount = dailyUpdateCount;
      })
    });
  }


  navigateAccountDetails(accountId) {
    this.router.navigate(['/bcm-user-tracker', accountId]);
  }

  downloadData() {
    this.associateDetails = [];
    this.bCPDailyUpdate = [];
    this.bcpDownloadService.exportAllAccountDetails(this.bCPMasterDataCount, this.bCPDailyUpdateCount).subscribe(model => {
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
    var masterDetails = model[0].value;
    for (var index = 0; index < masterDetails.length; index++) {
      var details = masterDetails[index];

      var activityDetails = this.bcpDownloadService.getAssciateActivity(model[1].value, details.AssociateID);
      var latestRecord;
      if (activityDetails != undefined && activityDetails.length > 0) {
        latestRecord = this.bcpDownloadService.getLatestRecord(activityDetails);
      }

      var data = this.bcpDownloadService.associateDetailsSheet(details, latestRecord);
      this.associateDetails.push(data);

      const getAddten = model[2].value.filter(atten => atten.AssociateID == masterDetails[index].AssociateID);
      if (getAddten && getAddten.length > 0) {
        getAddten.forEach(element => {
          var data = this.bcpDownloadService.attendanceDetailsSheet(element);
          this.bCPDailyUpdate.push(data);
        });
      }
    }
  }
}