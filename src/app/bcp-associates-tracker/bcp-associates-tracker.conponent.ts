import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BCPDetailsUpdate } from '../models/BCPDetailsUpdate';
import { HttpClient } from '@angular/common/http';
import { BcpFileExportService } from '../providers/bcp-file-export-service';
import { ToasterService } from 'angular2-toaster';
import * as moment from 'moment';
import { environment } from 'src/environments/environment.prod';
import { BcpAssociateTrackerService } from '../providers/bcp-associates-tracker.service';
import { BcpDataTrackerService } from '../providers/bcp-data-tracker.service';
import { BcpAttendenceTrackerService } from '../providers/bcp-Attendence-tracker.service';

@Component({
  selector: 'bcp-associates-tracker',
  templateUrl: './bcp-associates-tracker.conponent.html',
  styleUrls: ['./bcp-associates-tracker.scss']
})
export class BcpAssociateTrackerComponent {
  associateTrackerDetail: any[];
  projectDetails: any;
  projectId: any;
  formDigestDetail: any;
  bcpDetailsDisplay: BCPDetailsUpdate[] = [];
  attendenceData: any;
  workLocation: any;
  isLoading = false;
  searchText: string = '';
  searchTextByDepartment: string = '';
  searchTextByLocation: string = '';

  baseUrl = environment.apiBaseUrl;

  constructor(private bcpAssociateTrackerService: BcpAssociateTrackerService,
    private bcpDataTrackerService: BcpDataTrackerService,
    private bcpAttendenceTrackerService: BcpAttendenceTrackerService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClientService: HttpClient,
    private bcpFileExportService: BcpFileExportService,
    private toasterService: ToasterService) { }

  ngOnInit() {
    this.getFormDigest();
    this.route.params.subscribe(params => { this.projectId = params["id"] });
    this.getAttendenceTrackerDetails();
    this.getDataTrackerDetails();
    this.getAssociateTrackerDetails();
  }

  private getAttendenceTrackerDetails() {
    this.isLoading = true;
    this.bcpAttendenceTrackerService.getAttendenceTracker(this.projectId).subscribe(model => {
      this.isLoading = false;
      this.attendenceData = model;
    });
  }

  private getAssociateTrackerDetails() {
    this.isLoading = true;
    this.bcpAssociateTrackerService.getBcpAssociateTracker(this.projectId).subscribe(model => {
      this.isLoading = false;
      this.associateTrackerDetail = model.userDetail;
      this.projectDetails = model.userDetail[0];
      this.workLocation = [...new Set(this.associateTrackerDetail.map(item => item.Location))];
    });
  }

  private getDataTrackerDetails() {
    this.isLoading = true;
    this.bcpDataTrackerService.getDataTracker(this.projectId).subscribe(model => {
      this.isLoading = false;
      this.bcpDetailsDisplay = model.bcpDetailsUpdate;
    });
  }

  navigateToReport() {
    this.router.navigate(['/bcp-report', this.projectId]);
  }

  onDropDownChange(Location) {
    if (Location == "All") {
      this.searchTextByLocation = "";
    } else {
      this.searchTextByLocation = Location;
    }
  }

  submitData(associateId: string, controlIdex) {
    var submitDataDisabled = <HTMLInputElement>document.getElementById("submitData_" + controlIdex);
    submitDataDisabled.disabled = true;

    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    const bcpDetailsDisplay = this.bcpDetailsDisplay[index];

    const bcpDetailsUpdate = {
      CurrentEnabledforWFH: bcpDetailsDisplay.CurrentEnabledforWFH,
      WFHDeviceType: bcpDetailsDisplay.CurrentEnabledforWFH == "Yes" ? bcpDetailsDisplay.WFHDeviceType : "",
      Comments: bcpDetailsDisplay.Comments,
      PersonalReason: bcpDetailsDisplay.CurrentEnabledforWFH == "No" ? bcpDetailsDisplay.PersonalReason : "",
      AssetId: bcpDetailsDisplay.CurrentEnabledforWFH == "Yes" && (bcpDetailsDisplay.WFHDeviceType == "Cognizant Device" || bcpDetailsDisplay.WFHDeviceType == "Customer Device") ? bcpDetailsDisplay.AssetId : "",
      PIIDataAccess: bcpDetailsDisplay.PIIDataAccess,
      Protocol: bcpDetailsDisplay.Protocol,
      BYODCompliance: bcpDetailsDisplay.BYODCompliance,
      Dongles: bcpDetailsDisplay.Dongles,
      UpdateDate: moment().format("DD-MM-YYYY")
    };

    if (bcpDetailsDisplay.UniqueId) {
      this.updateDataTracker(bcpDetailsUpdate, index, controlIdex);
    } else {
      this.insertDataTracker(bcpDetailsUpdate, associateId, controlIdex);
    }
  }

  private insertDataTracker(bcpDetailsUpdate, associateId, controlIdex) {
    this.isLoading = true;
    this.bcpDataTrackerService.insertDataTracker(bcpDetailsUpdate, associateId, this.projectId, this.formDigestDetail.FormDigestValue)
      .subscribe(() => {
        this.isLoading = false;
        var submitDataDisabled = <HTMLInputElement>document.getElementById("submitData_" + controlIdex);
        submitDataDisabled.disabled = false;
        this.toasterService.pop("success", "Associate Details", "Associate Details Updated Successfully");
        this.getDataTrackerDetails();
      }, error => {
        console.log(error);
        this.isLoading = false;
        var submitDataDisabled = <HTMLInputElement>document.getElementById("submitData_" + controlIdex);
        submitDataDisabled.disabled = false;
        this.toasterService.pop("error", "Associate Details", "Error Occurred While Adding Associate Details");
      });
  }

  private updateDataTracker(bcpDetailsUpdate, index, controlIdex) {
    this.isLoading = true;
    const listUpdateId = this.bcpDetailsDisplay[index].UniqueId;
    this.bcpDataTrackerService.updateDataTracker(bcpDetailsUpdate, listUpdateId, this.formDigestDetail.FormDigestValue)
      .subscribe(() => {
        var submitDataDisabled = <HTMLInputElement>document.getElementById("submitData_" + controlIdex);
        submitDataDisabled.disabled = false;
        this.toasterService.pop("success", "Associate Details", "Associate Details Updated Successfully");
        this.isLoading = false;
      }, error => {
        console.log(error);
        var submitDataDisabled = <HTMLInputElement>document.getElementById("submitData_" + controlIdex);
        submitDataDisabled.disabled = false;
        this.toasterService.pop("error", "Associate Details", "Error Occurred While Adding Associate Details");
        this.isLoading = false;
      });
  }

  getAssociateTrackerById(associateId): boolean {
    if (this.attendenceData && this.attendenceData.length > 0) {
      let isExisting = this.attendenceData.filter(x => x.AssociateID == associateId
        && x.UpdateDate == moment().format("DD-MM-YYYY") && x.Attendance == "No");
      return isExisting.length > 0;
    }
    return true;
  }

  addDetailClick(userData, attendence) {
    this.isLoading = true;
    let isExisting = this.attendenceData.filter(x => x.AssociateID == userData.AssociateId
      && x.UpdateDate == moment().format("DD-MM-YYYY"));

    if (isExisting.length > 0) {
      let id = isExisting[0].Id;
      this.bcpAttendenceTrackerService.updateAttendenceTracker(attendence, id, this.formDigestDetail.FormDigestValue)
        .subscribe(() => {
          this.isLoading = false;
          this.toasterService.pop("success", "Attendance Details", "Attendance Details Updated Successfully");
          this.getAttendenceTrackerDetails();
        }, error => {
          console.log(error);
          this.isLoading = false;
          this.toasterService.pop("error", "Attendance Details", "Error Occurred While Updating Attendance Details");
        });
    } else {
      this.bcpAttendenceTrackerService.insertAttendenceTracker(userData.AssociateId, this.projectId, this.formDigestDetail.FormDigestValue)
        .subscribe(() => {
          this.isLoading = false;
          this.toasterService.pop("success", "Attendance Details", "Attendance Details Updated Successfully");
          this.getAttendenceTrackerDetails();
        }, error => {
          console.log(error);
          this.isLoading = false;
          this.toasterService.pop("error", "Attendance Details", "Error Occurred While Updating Attendance Details");
        });
    }
  }

  downloadData() {
    this.bcpFileExportService.exportAsExcelFile(null, this.projectId);
  }

  onChange(value, associateId, columnName, controlIdex) {
    const objIndex = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    const data = this.bcpDetailsDisplay[objIndex];
    this.updateBcpDetails(value, columnName, objIndex, data, controlIdex);
  }

  updateBcpDetails(value, columnName, index, bcpDetailsDisplay, controlIdex) {
    if (columnName == "CurrentEnabledforWFH") {
      bcpDetailsDisplay.CurrentEnabledforWFH = value;
      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var currentEnabledforWFH = <HTMLInputElement>document.getElementById("CurrentEnabledforWFH_" + controlIdex);
      currentEnabledforWFH.value = value;

      if (value == "Yes") {
        var wFHDeviceType = <HTMLInputElement>document.getElementById("WFHDeviceType_" + controlIdex);
        wFHDeviceType.disabled = false;
        wFHDeviceType.value = "";

        var personalReason = <HTMLInputElement>document.getElementById("PersonalReason_" + controlIdex);
        personalReason.disabled = true;
        personalReason.value = "";

        var assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
        assetId.disabled = false;
        assetId.value = "";

      } else if (value == "No") {
        var wFHDeviceType = <HTMLInputElement>document.getElementById("WFHDeviceType_" + controlIdex);
        wFHDeviceType.disabled = true;
        wFHDeviceType.value = "";

        var personalReason = <HTMLInputElement>document.getElementById("PersonalReason_" + controlIdex);
        personalReason.disabled = false;
        personalReason.value = "";

        var assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
        assetId.disabled = true;
        assetId.value = "";
      } else {
        var wFHDeviceType = <HTMLInputElement>document.getElementById("WFHDeviceType_" + controlIdex);
        wFHDeviceType.disabled = true;
        wFHDeviceType.value = "";

        var personalReason = <HTMLInputElement>document.getElementById("PersonalReason_" + controlIdex);
        personalReason.disabled = true;
        personalReason.value = "";

        var assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
        assetId.disabled = true;
        assetId.value = "";
      }
    }
    else if (columnName == "WFHDeviceType") {
      bcpDetailsDisplay.WFHDeviceType = value;

      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          bcpDetailsDisplay.PersonalReason = "";
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var wFHDeviceType = <HTMLInputElement>document.getElementById("WFHDeviceType_" + controlIdex);
      wFHDeviceType.value = value;

      if (value == "Personal Device" || value == "") {
        const assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
        assetId.disabled = true;
        assetId.value = "";

      } else {
        const assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
        assetId.disabled = false;
        assetId.value = "";
      }
    }
    else if (columnName == "AssetId") {
      bcpDetailsDisplay.AssetId = value;
      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var assetId = <HTMLInputElement>document.getElementById("AssetId_" + controlIdex);
      assetId.value = value;
    }
    else if (columnName == "PersonalReason") {
      bcpDetailsDisplay.PersonalReason = value;

      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          bcpDetailsDisplay.WFHDeviceType = "";
          bcpDetailsDisplay.AssetId = "";
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var personalReason = <HTMLInputElement>document.getElementById("PersonalReason_" + controlIdex);
      personalReason.value = value;
    }
    else if (columnName == "PIIDataAccess") {
      this.bcpDetailsDisplay[index].PIIDataAccess = value;
      var pIIDataAccess = <HTMLInputElement>document.getElementById("PIIDataAccess_" + controlIdex);
      pIIDataAccess.value = value;
    }
    else if (columnName == "Protocol") {
      bcpDetailsDisplay.Protocol = value;
      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var protocol = <HTMLInputElement>document.getElementById("Protocol_" + controlIdex);
      protocol.value = value;
    }
    else if (columnName == "BYODCompliance") {
      bcpDetailsDisplay.BYODCompliance = value;
      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var bYODCompliance = <HTMLInputElement>document.getElementById("BYODCompliance_" + controlIdex);
      bYODCompliance.value = value;
    }
    else if (columnName == "Dongles") {
      bcpDetailsDisplay.Dongles = value;
      this.bcpDetailsDisplay.map((todo, associateId) => {
        if (todo.AssociateID == associateId.toString()) {
          this.bcpDetailsDisplay[index] = bcpDetailsDisplay;
        }
      });

      var dongles = <HTMLInputElement>document.getElementById("Dongles_" + controlIdex);
      dongles.value = value;
    }
  }

  getCurrentEnabledforWFHYes(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].CurrentEnabledforWFH == "Yes";
  }

  getCurrentEnabledforWFHNo(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].CurrentEnabledforWFH == "No";
  }

  getWFHDeviceTypePd(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].WFHDeviceType == "Personal Device";
  }

  getWFHDeviceTypeCod(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].WFHDeviceType == "Cognizant Device";
  }

  getWFHDeviceTypeCud(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].WFHDeviceType == "Customer Device";
  }

  getWFHDeviceTypeCognizantBYOD(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].WFHDeviceType == "Cognizant BYOD";
  }

  getPersonalReasonNd(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "No device";
  }

  getPersonalReasonUpl(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "unplanned leave";
  }

  getPersonalReasonpl(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "planned leave";
  }

  getPersonalReasonWio(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "working at office";
  }

  getPersonalReasonConnectivity(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "Connectivity";
  }

  getPersonalReasonCOVID19(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PersonalReason == "COVID19";
  }

  getPIIDataAccessYes(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PIIDataAccess == "Yes";
  }

  getPIIDataAccessNo(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].PIIDataAccess == "No";
  }

  getAssetId(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].AssetId;
  }

  getCurrentEnabledforWFHDisabledYes(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].CurrentEnabledforWFH == "Yes";
  }

  getCurrentEnabledforWFHDisabledNo(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].CurrentEnabledforWFH == "No";
  }

  getWFHDeviceTypeDisabled(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] &&
      (this.bcpDetailsDisplay[index].WFHDeviceType == "Personal Device" || this.bcpDetailsDisplay[index].CurrentEnabledforWFH == "No");
  }

  getBYODComplianceYes(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].BYODCompliance == "Yes";
  }

  getBYODComplianceNo(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].BYODCompliance == "No";
  }

  getProtocolA(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol A";
  }

  getProtocolB1(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol B.1";
  }

  getProtocolB2(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol B.2";
  }

  getProtocolB3(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol B.3";
  }

  getProtocolB4(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol B.4";
  }

  getProtocolC1(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol C.1";
  }

  getProtocolC2(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol C.2";
  }

  getProtocolC3(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol C.3";
  }

  getProtocolC4(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol C.4";
  }

  getProtocolD(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Protocol == "Protocol D";
  }

  getDongles(associateId) {
    const index = this.bcpDetailsDisplay.findIndex((obj => obj.AssociateID == associateId));
    return this.bcpDetailsDisplay && this.bcpDetailsDisplay[index] && this.bcpDetailsDisplay[index].Dongles;
  }

  private getFormDigest(): void {
    let options = {
      "accept": "application/json;odata=verbose",
      "contentType": "text/xml"
    };
    var siteUrl = this.baseUrl + "_api/contextinfo";
    this.isLoading = true;
    this.httpClientService.post(siteUrl, options).subscribe((response: Response) => {
      this.isLoading = false;
      this.formDigestDetail = response;
    }, error => {
      this.isLoading = false;
      console.log(error);
    });
  }
}