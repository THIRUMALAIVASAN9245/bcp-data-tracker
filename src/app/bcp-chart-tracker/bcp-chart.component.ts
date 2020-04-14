import { Component, OnInit } from '@angular/core';
import { BcpChartService } from '../providers/bcp-chart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';
import { BcpAssociateTrackerService } from '../providers/bcp-associates-tracker.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { BCPDetailsGraph } from '../models/BCPDetailsGraph';
import { UserDetail, IUserDetail } from '../models/user-details';
import { BcpAccountMasterService } from '../providers/bcp-account-master.service';
import { environment } from 'src/environments/environment.prod';
import { BCPAccountMaster } from '../models/BCPAccountMaster';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var require: any;
@Component({
    selector: 'app-bcp-chart',
    templateUrl: './bcp-chart.component.html',
    styleUrls: ['./bcp-chart.component.scss']
})
export class BcpChartComponent implements OnInit {
    constructor(private bcpChartService: BcpChartService,
        private bcpAssociateTrackerService: BcpAssociateTrackerService,
        private bcpAccountMasterService: BcpAccountMasterService,
        private router: Router,
        private route: ActivatedRoute) { }

    keyword = 'name';
    projectId: any;
    availableDate: any = [];
    attendanceData: any = [];
    TotalAttendanceDownloadData: any = [];
    deviceType: any = [];
    accountCount: any;
    protocolData: any = [];
    wfhData: any = [];
    piiAccessData: any = [];
    byodData: any = [];
    projectDetails: any;
    isLoading = false;
    baseApplicationUrl = environment.apiBaseImageUrl;
    activeAccounts: BCPAccountMaster[] = [];
    activeUserDetails: IUserDetail[] = [];
    holidayListAllLocation: Date[] = [new Date("01/26/2020"), new Date("04/10/2020"), new Date("05/01/2020"), new Date("08/15/2020"), new Date("10/02/2020"), new Date("12/25/2020")];
    // holidayLocationWise: any = [];
    chennaiCount: any;
    bangaloreCount: any;

    chart1;
    chart2;
    chart3;
    chart4;
    chart5;
    chart6;
    chart7;

    ngOnInit() {
        this.route.params.subscribe(params => { this.projectId = params["id"] });
        if (this.projectId == null || this.projectId.trim() === "0" || this.projectId.trim() === "") {
            this.bcpAssociateTrackerService.getBcpAssociateTrackerAll().subscribe(data => {
                this.bcpAccountMasterService.getAccountMaster().subscribe(model => {
                    debugger;
                    this.activeUserDetails = data.userDetail;
                    this.activeAccounts = model;
                    var tempAccount: IUserDetail[] = [];
                    this.activeAccounts.forEach(element => {
                        var temp = this.activeUserDetails.filter(x => x.AccountID === element.AccountId);
                        tempAccount.push.apply(tempAccount, temp);
                    });
                    this.activeUserDetails = tempAccount;
                    this.chennaiCount = this.activeUserDetails.filter(x => x.Location == "Chennai").length;
                    this.bangaloreCount = this.activeUserDetails.filter(x => x.Location == "Bangalore").length;
                    this.accountCount = this.activeUserDetails.length;
                    this.getBcpDetailsUpdateDataAll();
                });
            });
        } else {
            this.bcpAssociateTrackerService.getBcpAssociateTracker(this.projectId).subscribe(data => {
                this.accountCount = data.userDetail.length;
                this.chennaiCount = data.userDetail.filter(x => x.Location == "Chennai").length;
                this.bangaloreCount = data.userDetail.filter(x => x.Location == "Bangalore").length;
                this.getBcpDetailsUpdateData(this.projectId);
            });
        }

        if (this.projectId != 0) {
            this.bcpAccountMasterService.getAccountMasterById(this.projectId).subscribe(data => {
                debugger;
                this.projectDetails = data[0];
            });
        }
        // this.setHolidayForLocation();
    }

    // setHolidayForLocation() {
    //     this.holidayLocationWise.push({ date: "14-04-2020", location: "Chennai" });
    // }

    DownloadChartReport(fileType) {
        debugger;
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.getSVG = function (charts, accountDetail) {
            var svgArr = [],
                top = 0,
                width = 0;

            Highcharts.each(charts, function (chart, index) {
                debugger;
                if (index == 0 && accountDetail) {
                    debugger;
                    var svg = chart.getSVG(),
                        // Get width/height of SVG for export
                        svgWidth = +svg.match(
                            /^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1],
                        svgHeight = +svg.match(
                            /^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1];

                    svg = svg.replace(
                        '<svg',
                        '<g transform="translate(20,' + 150 + ')" '
                    );
                    svg = svg.replace('</svg>', '</g>');

                    top += svgHeight + 180;
                    width = Math.max(width, svgWidth);
                    svgArr.push(svg);

                    let Title = "MIS Dashboard Report";
                    Title = Title.replace(/\n/g, '</tspan><tspan x="0" dy="1.2em">');
                    const txtTitle = '<text x= "' + 0 + '" y = "' + (10 + 20) + '" styles = "' + Title + '"><tspan x="35%" dy="1.2em">' + Title + '</tspan></text>';
                    svgArr.push(txtTitle);

                    let AccountId = "Account ID : " + accountDetail.AccountId;
                    AccountId = AccountId.replace(/\n/g, '</tspan><tspan x="0" dy="1.2em">');
                    const txtId = '<text x= "' + 0 + '" y = "' + 70 + '" styles = "' + AccountId + '"><tspan x="50" dy="1.2em">' + AccountId + '</tspan></text>';
                    svgArr.push(txtId);

                    let AccountName = "Account Name : " + accountDetail.AccountName;
                    AccountName = AccountName.replace(/\n/g, '</tspan><tspan x="0" dy="1.2em">');
                    const txtName = '<text x= "' + 0 + '" y = "' + 90 + '" styles = "' + AccountName + '"><tspan x="50" dy="1.2em">' + AccountName + '</tspan></text>';
                    svgArr.push(txtName);

                } else if (index == 0 && accountDetail == undefined) {
                    debugger;
                    var svg = chart.getSVG(),
                        // Get width/height of SVG for export
                        svgWidth = +svg.match(
                            /^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1],
                        svgHeight = +svg.match(
                            /^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1];

                    svg = svg.replace(
                        '<svg',
                        '<g transform="translate(20,' + 75 + ')" '
                    );
                    svg = svg.replace('</svg>', '</g>');

                    top += svgHeight + 80;
                    width = Math.max(width, svgWidth);

                    svgArr.push(svg);

                    let Title = "MIS Dashboard – UK&I Insurance Accounts";
                    Title = Title.replace(/\n/g, '</tspan><tspan x="0" dy="1.2em">');
                    const txtId = '<text x= "' + 0 + '" y = "' + (10 + 20) + '" styles = "' + Title + '"><tspan x="20%" dy="1.2em">' + Title + '</tspan></text>';
                    svgArr.push(txtId);

                } else {
                    var svg = chart.getSVG(),
                        // Get width/height of SVG for export
                        svgWidth = +svg.match(
                            /^<svg[^>]*width\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1],
                        svgHeight = +svg.match(
                            /^<svg[^>]*height\s*=\s*\"?(\d+)\"?[^>]*>/
                        )[1];

                    svg = svg.replace(
                        '<svg',
                        '<g transform="translate(20,' + top + ')" '
                    );
                    svg = svg.replace('</svg>', '</g>');

                    top += svgHeight + 10;
                    width = Math.max(width, svgWidth);

                    svgArr.push(svg);
                }

            });

            return '<svg height="' + top + '" width="' + (width + 40) +
                '" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                svgArr.join('') + '</svg>';
        };

        /**
         * Create a global exportCharts method that takes an array of charts as an
         * argument, and exporting options as the second argument
         */
        Highcharts.exportCharts = function (charts, options) {


            // charts.forEach(chart => {
            //     chart.update({
            //         chart: {
            //             borderColor: '#656565',
            //             borderWidth: 1,
            //             paddingBottom: 20
            //         }
            //     });
            // });

            // Merge the options
            options = Highcharts.merge(Highcharts.getOptions().exporting, options);

            // Post to export server
            Highcharts.post(options.url, {
                filename: options.filename || 'MIS Dashboard Report',
                type: options.type,
                width: options.width,
                svg: Highcharts.getSVG(charts, options.accountDetail)
            });

        };

        // Highcharts.exportCharts([this.chart1, this.chart2], {
        //     type: 'application/pdf',
        //     accountDetail: this.projectDetails
        // });

        Highcharts.exportCharts([this.chart4, this.chart2, this.chart1, this.chart3, this.chart5, this.chart6, this.chart7], {
            type: fileType,
            accountDetail: this.projectDetails
        });
    }

    downloadProtocolReport() {
        if (this.protocolData.length > 0) {
            this.exportExcel(this.protocolData, this.projectId == 0 ? "AllAccount_" : this.projectId + "Protocol", "ProtocolReport");
        }
    }

    getLastNdays(days: number) {
        var daysSeries = [];
        debugger;
        for (let i = 1; i <= days; i++) {
            var date = new Date();
            date.setDate(date.getDate() - i);
            if (this.holidayListAllLocation.find(x => x.getDate() !== date.getDate())) {
                daysSeries.push(date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear());
            }
        }
        return daysSeries;
    }

    exportExcel(json: any[], fileName: string, sheetName: string) {
        var wb = { SheetNames: [], Sheets: {} };
        const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = worksheet1;
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_export_' + EXCEL_EXTENSION);
    }

    NavigateToUserTracker() {
        if (this.projectId == "0") {
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/bcm-user-tracker', this.projectId]);
        }
    }

    stringToDate(dateString: string) {
        var dateParts = dateString.split('-');
        return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
    }

    fillMissingDates(actualDatesinDb: any[]) {

        debugger;

        let datesAfterInsertingHolidays = [];

        actualDatesinDb.forEach((element) => {
            var dateAttend = this.stringToDate(element);
            if (dateAttend.getDay() !== 6 && dateAttend.getDay() !== 0) {
                datesAfterInsertingHolidays.push(moment(dateAttend).format("DD-MM-YYYY"));
            }
        });

        return datesAfterInsertingHolidays;

        // for (let i = 0; i < actualDatesinDb.length - 1; i++) {
        //     var start = moment(this.stringToDate(actualDatesinDb[i]));
        //     var end = moment(this.stringToDate(actualDatesinDb[i + 1]));
        //     var diff = Math.abs(end.diff(start, 'days'));
        //     if (diff > 1) {
        //         if (new Date(start.toLocaleString()).getDay() !== 6 && new Date(start.toLocaleString()).getDay() !== 0) {
        //             datesAfterInsertingHolidays.push(start.format("DD-MM-YYYY"));
        //         }
        //         for (let j = 1; j <= diff; j++) {
        //             var missingDate = moment(start, "DD-MM-YYYY").add('days', j).toLocaleString();
        //             if (new Date(missingDate).getDay() !== 6 && new Date(missingDate).getDay() !== 0) {
        //                 datesAfterInsertingHolidays.push(moment(new Date(missingDate)).format("DD-MM-YYYY"));
        //             }
        //             diff--;
        //         }
        //     } else {
        //         if (new Date(start.toLocaleString()).getDay() !== 6 && new Date(start.toLocaleString()).getDay() !== 0) {
        //             datesAfterInsertingHolidays.push(start.format("DD-MM-YYYY"));
        //         }
        //     }
        // }
        // if (!datesAfterInsertingHolidays.includes(this.stringToDate(moment().format("DD-MM-YYYY")))) {
        //     datesAfterInsertingHolidays.push(moment().format("DD-MM-YYYY"));
        // }
        // return datesAfterInsertingHolidays;
    }

    getBcpDetailsUpdateDataAll() {
        this.isLoading = true;
        this.bcpChartService.getBCPDataTrackerHistoryAll().subscribe(data => {
            // this.bcpAssociateTrackerService.getBcpAssociateTrackerAll().subscribe(model => {
            debugger;
            let chartData = [];
            // this.activeUserDetails = model.userDetail;
            // this.inActiveAccounts.forEach(element => {
            //     this.activeUserDetails = this.activeUserDetails.filter(x => x.AccountID !== element.AccountId);
            // });
            data.bcpDetailsUpdate.forEach(bcpDetails => {
                var bcpUserDetail: UserDetail = this.activeUserDetails.find(x => x.AssociateId === bcpDetails.AssociateID);
                if (bcpUserDetail != null) {
                    var bcpModelDetails = new BCPDetailsGraph(
                        bcpUserDetail.AccountID,
                        bcpUserDetail.AccountName,
                        bcpUserDetail.AssociateId,
                        bcpUserDetail.AssociateName,
                        bcpDetails.CurrentEnabledforWFH,
                        bcpDetails.WFHDeviceType,
                        bcpDetails.Comments,
                        bcpDetails.IstheResourceProductivefromHome,
                        bcpDetails.PersonalReason,
                        bcpDetails.AssetId,
                        bcpDetails.PIIDataAccess,
                        bcpDetails.Protocol,
                        bcpDetails.BYODCompliance,
                        bcpDetails.Dongles,
                        bcpDetails.UpdateDate,
                        bcpDetails.UniqueId);
                    chartData.push(bcpModelDetails);
                }
            });
            this.getChartData(chartData);
            this.isLoading = false;
            // });
        });
        this.isLoading = true;
        this.bcpChartService.getAccountAttendanceDataAll().subscribe((response: BCPDailyUpdate[]) => {
            // var uniqueUpdateDate = this.fillMissingDates([...new Set(response.map(item => item.UpdateDate))]);
            var uniqueUpdateDate = this.fillMissingDates(this.getLastNdays(10));
            uniqueUpdateDate = uniqueUpdateDate.reverse();
            uniqueUpdateDate = uniqueUpdateDate.slice(Math.max(uniqueUpdateDate.length - 5, 0));
            debugger;
            const responseAccount: BCPDailyUpdate[] = response;
            var tempAccount: BCPDailyUpdate[] = [];
            this.activeAccounts.forEach(element => {
                var temp = responseAccount.filter(x => x.AccountId == element.AccountId);
                tempAccount.push.apply(tempAccount, temp);
                console.log(tempAccount.length);
            });
            uniqueUpdateDate.forEach((updateDate: any) => {
                // var holiday = this.holidayLocationWise.find(x => x.date == updateDate)
                // if (holiday != null) {
                //     var totalCount = response.filter(item => item.UpdateDate == updateDate && item.Attendance == "No").length;
                //     if (this.chennaiCount > 0) {
                //         totalCount += this.chennaiCount;
                //     }
                //     if (this.bangaloreCount > 0) {
                //         totalCount += this.bangaloreCount;
                //     }
                //     const percent = (totalCount / this.accountCount) * 100;
                //     const roundPer = parseFloat(percent.toString()).toFixed(2);
                //     this.attendanceData.push({ date: updateDate, count: +roundPer });
                // } else {
                const uniqueYes = tempAccount.filter(item => item.UpdateDate == updateDate && item.Attendance == "No");
                if (uniqueYes != null && uniqueYes.length > 0) {
                    const uniqueYesCount = this.accountCount - uniqueYes.length;
                    const percent = (uniqueYesCount / this.accountCount) * 100;
                    const roundPer = parseFloat(percent.toString()).toFixed(2);
                    this.attendanceData.push({ date: updateDate, count: +roundPer });
                } else {
                    const roundPer = parseFloat("100").toFixed(2);
                    this.attendanceData.push({ date: updateDate, count: +roundPer });
                }
                // }
            });
            this.attendanceGraph(this.attendanceData);
            this.isLoading = false;
        });
    }


    getBcpDetailsUpdateData(projectId) {
        this.bcpChartService.getBCPDataTrackerHistory(projectId).subscribe(data => {
            this.bcpAssociateTrackerService.getBcpAssociateTracker(projectId).subscribe(model => {
                let chartData = [];
                data.bcpDetailsUpdate.forEach(bcpDetails => {
                    var bcpUserDetail: UserDetail = model.userDetail.find(x => x.AssociateId === bcpDetails.AssociateID);
                    if (bcpUserDetail != null) {
                        var bcpModelDetails = new BCPDetailsGraph(
                            bcpUserDetail.AccountID,
                            bcpUserDetail.AccountName,
                            bcpUserDetail.AssociateId,
                            bcpUserDetail.AssociateName,
                            bcpDetails.CurrentEnabledforWFH,
                            bcpDetails.WFHDeviceType,
                            bcpDetails.Comments,
                            bcpDetails.IstheResourceProductivefromHome,
                            bcpDetails.PersonalReason,
                            bcpDetails.AssetId,
                            bcpDetails.PIIDataAccess,
                            bcpDetails.Protocol,
                            bcpDetails.BYODCompliance,
                            bcpDetails.Dongles,
                            bcpDetails.UpdateDate,
                            bcpDetails.UniqueId);
                        chartData.push(bcpModelDetails);
                    }
                });
                this.getChartData(chartData);
            });
        });
        this.bcpChartService.getAccountAttendanceData(projectId).subscribe((response: BCPDailyUpdate[]) => {
            // var uniqueUpdateDate = this.fillMissingDates([...new Set(response.map(item => item.UpdateDate))]);
            debugger;
            var uniqueUpdateDate = this.fillMissingDates(this.getLastNdays(10));
            uniqueUpdateDate = uniqueUpdateDate.reverse();
            uniqueUpdateDate = uniqueUpdateDate.slice(Math.max(uniqueUpdateDate.length - 5, 0));
            uniqueUpdateDate.forEach((updateDate: any) => {
                // var holiday = this.holidayLocationWise.find(x => x.date == updateDate)
                // if (holiday != null) {
                //     var totalCount = response.filter(item => item.UpdateDate == updateDate && item.Attendance == "No").length;
                //     if (this.chennaiCount > 0) {
                //         totalCount += this.chennaiCount;
                //     }
                //     if (this.bangaloreCount > 0) {
                //         totalCount += this.bangaloreCount;
                //     }
                //     const percent = (totalCount / this.accountCount) * 100;
                //     const roundPer = parseFloat(percent.toString()).toFixed(2);
                //     this.attendanceData.push({ date: updateDate, count: +roundPer });
                // } else {
                const uniqueYes = response.filter(item => item.UpdateDate == updateDate && item.Attendance == "No");
                if (uniqueYes != null && uniqueYes.length > 0) {
                    const uniqueYesCount = this.accountCount - uniqueYes.length;
                    const percent = (uniqueYesCount / this.accountCount) * 100;
                    const roundPer = parseFloat(percent.toString()).toFixed(2);
                    this.attendanceData.push({ date: updateDate, count: +roundPer });
                } else {
                    const roundPer = parseFloat("100").toFixed(2);
                    this.attendanceData.push({ date: updateDate, count: +roundPer });
                }
                // }
            });
            this.attendanceGraph(this.attendanceData);
        });
    }

    getChartData(chartData: BCPDetailsGraph[]) {
        console.log(chartData);
        this.getWFHReadiness(chartData);
        this.getDeviceType(chartData);
        this.getPersonalReason(chartData);
        this.getProtocolType(chartData);
        this.getPiiAcess(chartData);
        this.getBYODCompliance(chartData);
    }

    private getWFHReadiness(chartData: BCPDetailsGraph[]) {
        debugger;
        var wfhRedinessYes;
        var wfhRedinessNo;
        var wfhRedinessOthers;
        var othersFinalCount;

        var unknownData = chartData.filter(item => (item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.toLowerCase() != "yes")
            && (item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.toLowerCase() != "no")
            && item.CurrentEnabledforWFH != null && !(item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.trim() == ""));
        unknownData.forEach(x => {
            this.wfhData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, CurrentEnabledforWFH: "Others" });
        });

        var uniqueYes = chartData.filter((item: BCPDetailsGraph) => item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.toLowerCase() === "yes");
        uniqueYes.forEach(x => {
            this.wfhData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, CurrentEnabledforWFH: "Yes" });
        });
        var uniqueNo = chartData.filter(item => item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.toLowerCase() == "no");
        uniqueNo.forEach(x => {
            this.wfhData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, CurrentEnabledforWFH: "No" });
        });
        var uniqueOthers = chartData.filter(item => item.CurrentEnabledforWFH == null || (item.CurrentEnabledforWFH != null && item.CurrentEnabledforWFH.trim() == ""));
        uniqueOthers.forEach(x => {
            this.wfhData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, CurrentEnabledforWFH: "Others" });
        });
        // const uniqueNoCount = chartData.length - uniqueYes.length;
        // const uniqueOthersCount = chartData.length - (uniqueNoCount + uniqueYes.length);
        wfhRedinessYes = parseFloat(((uniqueYes.length / chartData.length) * 100).toFixed(2));
        wfhRedinessNo = parseFloat(((uniqueNo.length / chartData.length) * 100).toFixed(2));
        othersFinalCount = unknownData.length + uniqueOthers.length;
        wfhRedinessOthers = parseFloat(((othersFinalCount / chartData.length) * 100).toFixed(2));
        this.workFromHomeGraph(wfhRedinessYes, wfhRedinessNo, wfhRedinessOthers);
    }

    WFHReadinessExcelSheetData() {
        console.log(this.wfhData);
        if (this.wfhData.length > 0) {
            this.exportExcel(this.wfhData, this.projectId == 0 ? "AllAccount_" : this.projectId + "WFHReadiness", "WFHReadinessDetails");
        }
    }

    private getPiiAcess(chartData: BCPDetailsGraph[]) {
        debugger
        var PIIDataAccessYes;
        var PIIDataAccessNo;
        var PIIDataAccessOthers;
        var othersFinalCount;

        var unknownData = chartData.filter(item => (item.PIIDataAccess != null && item.PIIDataAccess.toLowerCase() != "yes")
            && (item.PIIDataAccess != null && item.PIIDataAccess.toLowerCase() != "no")
            && item.PIIDataAccess != null && !(item.PIIDataAccess != null && item.PIIDataAccess.trim() == ""));
        unknownData.forEach(x => {
            this.piiAccessData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PIIDataAccess: "Others" });
        });

        var uniqueYes = chartData.filter(item => item.PIIDataAccess != null && item.PIIDataAccess.toLowerCase() == "yes");
        uniqueYes.forEach(x => {
            this.piiAccessData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PIIDataAccess: "Yes" });
        });
        var uniqueNo = chartData.filter(item => item.PIIDataAccess != null && item.PIIDataAccess.toLowerCase() == "no");
        uniqueNo.forEach(x => {
            this.piiAccessData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PIIDataAccess: "No" });
        });
        var uniqueOthers = chartData.filter(item => item.PIIDataAccess == null || (item.PIIDataAccess != null && item.PIIDataAccess.trim() == ""));
        uniqueOthers.forEach(x => {
            this.piiAccessData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PIIDataAccess: "Others" });
        });
        // const uniqueNoCount = chartData.length - uniqueYes.length;
        // const uniqueOthersCount = chartData.length - (uniqueNoCount + uniqueYes.length);
        PIIDataAccessYes = parseFloat(((uniqueYes.length / chartData.length) * 100).toFixed(2));
        PIIDataAccessNo = parseFloat(((uniqueNo.length / chartData.length) * 100).toFixed(2));
        othersFinalCount = unknownData.length + uniqueOthers.length;
        PIIDataAccessOthers = parseFloat(((othersFinalCount / chartData.length) * 100).toFixed(2));
        this.piiAccessGraph(PIIDataAccessYes, PIIDataAccessNo, PIIDataAccessOthers);
    }

    PiiAcessExcelSheetData() {
        console.log(this.piiAccessData);
        if (this.piiAccessData.length > 0) {
            this.exportExcel(this.piiAccessData, this.projectId == 0 ? "AllAccount_" : this.projectId + "PIIDataAccess", "PIIDataAccessDetails");

        }
    }

    private getBYODCompliance(chartData: BCPDetailsGraph[]) {
        debugger
        var BYODComplianceYes;
        var BYODComplianceNo;
        var BYODComplianceOthers;
        var othersFinalCount;

        var unknownData = chartData.filter(item => (item.BYODCompliance != null && item.BYODCompliance.toLowerCase() != "yes")
            && (item.BYODCompliance != null && item.BYODCompliance.toLowerCase() != "no")
            && item.BYODCompliance != null && !(item.BYODCompliance != null && item.BYODCompliance.trim() == ""));
        unknownData.forEach(x => {
            this.byodData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, BYODCompliance: "Others" });
        });

        var uniqueYes = chartData.filter(item => item.BYODCompliance != null && item.BYODCompliance.toLowerCase() === "yes");
        uniqueYes.forEach(x => {
            this.byodData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, BYODCompliance: "Yes" });
        });
        var uniqueNo = chartData.filter(item => item.BYODCompliance != null && item.BYODCompliance.toLowerCase() === "no");
        uniqueNo.forEach(x => {
            this.byodData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, BYODCompliance: "No" });
        });
        var uniqueOthers = chartData.filter(item => item.BYODCompliance == null || (item.BYODCompliance != null && item.BYODCompliance.trim() == ""));
        uniqueOthers.forEach(x => {
            this.byodData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, BYODCompliance: "Others" });
        });
        // const uniqueNoCount = chartData.length - uniqueYes.length;
        // const uniqueOthersCount = chartData.length - (uniqueNoCount + uniqueYes.length);
        BYODComplianceYes = parseFloat(((uniqueYes.length / chartData.length) * 100).toFixed(2));
        BYODComplianceNo = parseFloat(((uniqueNo.length / chartData.length) * 100).toFixed(2));
        othersFinalCount = unknownData.length + uniqueOthers.length;
        BYODComplianceOthers = parseFloat(((othersFinalCount / chartData.length) * 100).toFixed(2));
        this.BYODComplianceGraph(BYODComplianceYes, BYODComplianceNo, BYODComplianceOthers);
    }

    BYODComplianceExcelSheetData() {
        console.log(this.byodData);
        if (this.byodData.length > 0) {
            this.exportExcel(this.byodData, this.projectId == 0 ? "AllAccount_" : this.projectId + "BYODCompliance", "BYODComplianceDetails");
        }
    }

    private getDeviceType(chartData: BCPDetailsGraph[]) {
        var personalDevice = [];
        var cognizantDevice = [];
        var customerDevice = [];
        var cognizantBYODs = [];
        var others = [];
        var othersFinalCount;
        this.deviceType = [];
        debugger;

        var unknownData = chartData.filter(item => (item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() != "personal device")
            && (item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() != "cognizant device")
            && (item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() != "customer device")
            && (item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() != "cognizant byod")
            && item.WFHDeviceType != null && !(item.WFHDeviceType != null && item.WFHDeviceType.trim() == ""));
        unknownData.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });

        var personaltemp = chartData.filter(item => item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() == "personal device");
        personaltemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });
        // personalDevice.push({ count: personaltemp.length, data: personaltemp });
        var cognizantDevicetemp = chartData.filter(item => item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() == "cognizant device");
        cognizantDevicetemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });
        // cognizantDevice.push({ count: cognizantDevicetemp.length, data: personaltemp });
        var customerDevicetemp = chartData.filter(item => item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() == "customer device");
        customerDevicetemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });
        // customerDevice.push({ count: customerDevicetemp.length, data: personaltemp });
        var cognizantBOYDstemp = chartData.filter(item => item.WFHDeviceType != null && item.WFHDeviceType.toLowerCase() == "cognizant byod");
        cognizantBOYDstemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });
        // cognizantBYODs.push({ count: cognizantBOYDstemp.length, data: personaltemp });
        var othersType = chartData.filter(item => item.WFHDeviceType == null || (item.WFHDeviceType != null && item.WFHDeviceType.trim() == ""));
        othersType.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, DeviceType: x.WFHDeviceType });
        });

        // if()

        var personalDevicePer = parseFloat(((personaltemp.length / chartData.length) * 100).toFixed(2));
        personalDevice.push({ Count: personaltemp.length, Percentage: personalDevicePer });
        var cognizantDevicePer = parseFloat(((cognizantDevicetemp.length / chartData.length) * 100).toFixed(2));
        cognizantDevice.push({ Count: cognizantDevicetemp.length, Percentage: cognizantDevicePer });
        var customerDevicePer = parseFloat(((customerDevicetemp.length / chartData.length) * 100).toFixed(2));
        customerDevice.push({ Count: customerDevicetemp.length, Percentage: customerDevicePer });
        var cognizantBYODsPer = parseFloat(((cognizantBOYDstemp.length / chartData.length) * 100).toFixed(2));
        cognizantBYODs.push({ Count: cognizantBOYDstemp.length, Percentage: cognizantBYODsPer });
        othersFinalCount = unknownData.length + othersType.length;
        var othersTypePer = parseFloat(((othersFinalCount / chartData.length) * 100).toFixed(2));
        others.push({ Count: othersFinalCount, Percentage: othersTypePer });

        this.deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs, others);
    }

    private getPersonalReason(chartData: BCPDetailsGraph[]) {
        // var noDevice = [];
        // var unplannedLeave = [];
        // var plannedLeave = [];
        // var workingAtOffice = [];
        // var connectivity = [];
        debugger;
        // var dateLatest = [];

        // dateLatest = this.fillMissingDates([...new Set(chartData.map(item => item.UpdateDate))]);

        // dateLatest = dateLatest.slice().sort((a: string, b: string) => {
        //     return Date.parse(b) - Date.parse(a);
        // });

        const dateLatest = moment().format("DD-MM-YYYY");

        var nodevice = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "no device" && item.UpdateDate == dateLatest);
        nodevice.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "No device" });
        });
        // noDevice.push({ count: nodevice.length, data: nodevice });
        var unplanned = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "unplanned leave" && item.UpdateDate == dateLatest);
        unplanned.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "Unplanned leave" });
        });
        // unplannedLeave.push({ count: unplanned.length, data: unplanned });
        var planned = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "planned leave" && item.UpdateDate == dateLatest);
        planned.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "Planned leave" });
        });
        // plannedLeave.push({ count: planned.length, data: planned });
        var workAtOffice = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "working at office" && item.UpdateDate == dateLatest);
        workAtOffice.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "Working at office" });
        });
        // workingAtOffice.push({ count: workAtOffice.length, data: workAtOffice });
        var connect = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "connectivity" && item.UpdateDate == dateLatest);
        connect.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "Connectivity" });
        });
        // connectivity.push({ count: connect.length, data: connect });
        var covid = chartData.filter(item => item.PersonalReason != null && item.PersonalReason.toLowerCase() == "covid19" && item.UpdateDate == dateLatest);
        covid.forEach(x => {
            this.availableDate.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, PersonalLeave: "COVID19" });
        });
        // covid19.push({ count: covid.length, data: covid });

        this.personalReasonGraph(dateLatest, nodevice.length, unplanned.length, planned.length, workAtOffice.length, connect.length, covid.length);
    }

    private getProtocolType(chartData: BCPDetailsGraph[]) {
        var protocolA = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol a");

        protocolA.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol A" });
        });

        var protocolB1 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol b.1");

        protocolB1.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol B.1" });
        });

        var protocolB2 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol b.2");

        protocolB2.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol B.2" });
        });

        var protocolB3 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol b.3");

        protocolB3.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol B.3" });
        });

        var protocolB4 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol b.4");

        protocolB4.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol B.4" });
        });

        var protocolC1 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol c.1");

        protocolC1.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol C.1" });
        });

        var protocolC2 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol c.2");

        protocolC2.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol C.2" });
        });

        var protocolC3 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol c.3");

        protocolC3.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol C.3" });
        });

        var protocolC4 = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol c.4");

        protocolC4.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol C.4" });
        });

        var protocolD = chartData.filter(item => item.Protocol != null && item.Protocol.toLowerCase() == "protocol d");

        protocolD.forEach(x => {
            this.protocolData.push({ AccountID: x.AccountId, AccountName: x.AccountName, AssociateId: x.AssociateID, AssociateName: x.AssociateName, Date: x.UpdateDate, Protocol: "Protocol D" });
        });

        this.protocolGraph(chartData, protocolA.length, protocolB1.length, protocolB2.length, protocolB3.length,
            protocolB4.length, protocolC1.length, protocolC2.length, protocolC3.length, protocolC4.length, protocolD.length);
    }

    exportContainer1() {
        if (this.deviceType.length > 0) {
            this.exportExcel(this.deviceType, this.projectId == 0 ? "AllAccount_" : this.projectId + "DeviceType", "DeviceType");
        }
    }

    deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs, others) {
        // var Yaxis_personal = [];
        // var Yaxis_cts = [];
        // var Yaxis_cus = [];
        // var Yaxis_byod = [];
        // var fileName = "";
        // var sheetName = "Device Availability";
        // var resultGraph = [];
        // personalDevice.forEach(element => {
        //     Yaxis_personal.push(element.count);
        // });
        // cognizantDevice.forEach(element => {
        //     Yaxis_cts.push(element.count);
        // });
        // customerDevice.forEach(element => {
        //     Yaxis_cus.push(element.count);
        // });
        // cognizantBYODs.forEach(element => {
        //     Yaxis_byod.push(element.count);
        // });

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart1 = Highcharts.chart('container1', {
            chart: {
                // borderColor: '#656565',
                borderWidth: 1,
                plotBackgroundColor: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Device Usage %',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y} [{point.custom:.2f}%]</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                // series: {
                //     cursor: 'pointer',
                //     point: {
                //         events: {
                //             click: function () {
                //                 if (this.series.name == "Cognizant BYOD") {
                //                     resultGraph = cognizantBYODs[0].data;
                //                     fileName = "BYOD";
                //                 } else if (this.series.name == "Cognizant Device") {

                //                     resultGraph = cognizantDevice[0].data;
                //                     fileName = "Cognizant";
                //                 } else if (this.series.name == "Customer Device") {
                //                     resultGraph = customerDevice[0].data;
                //                     fileName = "Customer";
                //                 } else if (this.series.name == "Personal Device") {
                //                     resultGraph = personalDevice[0].data;
                //                     fileName = "Personal";
                //                 }
                //                 var wb = { SheetNames: [], Sheets: {} };
                //                 const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(resultGraph);
                //                 wb.SheetNames.push(sheetName);
                //                 wb.Sheets[sheetName] = worksheet1;
                //                 const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                //                 const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
                //                 FileSaver.saveAs(data, fileName + '_export_' + EXCEL_EXTENSION);
                //             }
                //         }
                //     }
                // },
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y} [{point.custom:.2f}%]'
                    }
                }
            },
            series: [{
                name: 'Usage',
                colorByPoint: true,
                data: [{
                    name: 'Personal Device',
                    y: personalDevice[0].Count,
                    custom: personalDevice[0].Percentage,
                    color: '#1C6DA4'
                },
                {
                    name: 'Cognizant Device',
                    y: cognizantDevice[0].Count,
                    custom: cognizantDevice[0].Percentage,
                    color: '#2B9B2B'
                },
                {
                    name: 'Customer Device',
                    y: customerDevice[0].Count,
                    custom: customerDevice[0].Percentage,
                    color: '#F57B0E'
                },
                {
                    name: 'Cognizant BYOD',
                    y: cognizantBYODs[0].Count,
                    custom: cognizantBYODs[0].Percentage,
                    color: '#D02627'
                },
                {
                    name: 'Others',
                    y: others[0].Count,
                    custom: others[0].Percentage,
                    color: '#666666'
                }]
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.exportContainer1.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }

    piiAccessGraph(PIIDataAccessYes, PIIDataAccessNo, PIIDataAccessOthers) {
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart6 = Highcharts.chart('container6', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'PII Exposure %',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y:.2f}%'
                    }
                },
            },
            series: [{
                name: 'PII Exposure',
                colorByPoint: true,
                data: [{
                    name: 'Yes',
                    y: PIIDataAccessYes,
                    color: '#D9614F'
                }, {
                    name: 'No',
                    y: PIIDataAccessNo,
                    color: '#B34C62'
                }, {
                    name: 'Others',
                    y: PIIDataAccessOthers,
                    color: '#666666'
                }]
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.PiiAcessExcelSheetData.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }

    workFromHomeGraph(wfhRedinessYes, wfhRedinessNo, wfhRedinessOthers) {
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart2 = Highcharts.chart('container2', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Work From Home %',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.2f}%'
                    }
                }
            },
            series: [{
                name: 'Associates WFH Enabled %',
                colorByPoint: true,
                data: [{
                    name: 'Yes',
                    y: wfhRedinessYes,
                    color: '#533563'
                }, {
                    name: 'No',
                    y: wfhRedinessNo,
                    color: '#E1347A'
                }, {
                    name: 'Others',
                    y: wfhRedinessOthers,
                    color: '#666666'
                }]
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.WFHReadinessExcelSheetData.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }
    BYODComplianceGraph(BYODComplianceYes, BYODComplianceNo, BYODComplianceOthers) {
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart7 = Highcharts.chart('container7', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'BYODCompliance %',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.2f}%'
                    }
                }
            },
            series: [{
                name: 'BYOD Compliance',
                colorByPoint: true,
                data: [{
                    name: 'Yes',
                    y: BYODComplianceYes,
                    color: '#671A88'
                }, {
                    name: 'No',
                    y: BYODComplianceNo,
                    color: '#859209'
                }, {
                    name: 'Others',
                    y: BYODComplianceOthers,
                    color: '#666666'
                }]
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.BYODComplianceExcelSheetData.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }

    personalLeaveExcelSheetData() {
        if (this.availableDate.length > 0) {
            this.exportExcel(this.availableDate, this.projectId == 0 ? "AllAccount_" : this.projectId + "PersonalReason", "PersonalReason");
        }
    }

    personalReasonGraph(dateLatest, noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19) {
        // var noDeviceYaxis = [];
        // var unplannedLeaveYaxis = [];
        // var plannedLeaveYaxis = [];
        // var workingAtOfficeYaxis = [];
        // var connectivityYaxis = [];
        // var covidYaxis = [];
        // var fileName = "";
        // var sheetName = "Personal Reason";
        // var resultGraph = [];

        // noDevice.forEach(element => {
        //     noDeviceYaxis.push(element.count);
        // });
        // unplannedLeave.forEach(element => {
        //     unplannedLeaveYaxis.push(element.count);
        // });
        // plannedLeave.forEach(element => {
        //     plannedLeaveYaxis.push(element.count);
        // });
        // workingAtOffice.forEach(element => {
        //     workingAtOfficeYaxis.push(element.count);
        // });
        // connectivity.forEach(element => {
        //     connectivityYaxis.push(element.count);
        // });
        // covid19.forEach(element => {
        //     covidYaxis.push(element.count);
        // });
        dateLatest = moment(dateLatest, "DD-MM-YYYY").format("DD MMM YYYY");

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart3 = Highcharts.chart('container3', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                type: 'bar'
            },
            title: {
                text: ' Absenteeism Reason [' + dateLatest + ']',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                categories: ['No device', 'Unplanned leave', 'Planned leave', 'Working at office', 'Connectivity', 'COVID19'],

                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                },
                stackLabels: {
                    style: {
                        color: '#F13CD7',
                        fontWeight: 'bold'
                    },
                    enabled: true,
                    crop: false,
                    overflow: 'none',
                    x: 0
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                bar: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                },
                // series: {
                //     cursor: 'pointer',
                //     point: {
                //         events: {
                //             click: function (event) {
                //                 if (this.series.name == "No device") {
                //                     resultGraph = noDevice[0].data;
                //                     fileName = "Nodevice";
                //                 }
                //                 else if (this.series.name == "COVID19") {
                //                     resultGraph = covid19[0].data;
                //                     fileName = "COVID19";
                //                 }
                //                 else if (this.series.name == "Unplanned leave") {
                //                     resultGraph = unplannedLeave[0].data;
                //                     fileName = "Unplanned";
                //                 }
                //                 else if (this.series.name == "Planned leave") {
                //                     resultGraph = plannedLeave[0].data;
                //                     fileName = "Planned";
                //                 }
                //                 else if (this.series.name == "Working at office") {
                //                     resultGraph = workingAtOffice[0].data;
                //                     fileName = "WAO";
                //                 }
                //                 else if (this.series.name == "Connectivity") {
                //                     resultGraph = connectivity[0].data;
                //                     fileName = "Connectivity";
                //                 }

                //                 var wb = { SheetNames: [], Sheets: {} };
                //                 const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(resultGraph);
                //                 wb.SheetNames.push(sheetName);
                //                 wb.Sheets[sheetName] = worksheet1;
                //                 const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                //                 const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
                //                 FileSaver.saveAs(data, fileName + '_export_' + EXCEL_EXTENSION);
                //             }
                //         }
                //     }
                // }
            },
            series: [{
                showInLegend: false,
                data: [noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19],
                color: '#E73D80'
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.personalLeaveExcelSheetData.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }

    attendanceGraph(attendance) {
        var xaxis = [];
        var yaxis = [];
        attendance.forEach(element => {
            var dateAttend = moment(element.date, "DD-MM-YYYY").format("MMM DD");
            xaxis.push(dateAttend);
            // xaxis.push(element.date);
            yaxis.push(element.count);
        });
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart4 = Highcharts.chart('container4', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                type: 'column'
            },
            title: {
                text: 'Attendance %',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                categories: xaxis
            },
            yAxis: {
                title: {
                    text: ' Attendance % '
                },
                stackLabels: {
                    style: {
                        color: '#7089A9',
                        fontWeight: 'bold'
                    },
                    enabled: true,
                    formatter: function () {
                        return this.total + "%";
                    }
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false,
                    }
                }
                // series: {
                //     point: {
                //         events: {
                //             click: (currentValue) => {
                //                 this.attendanceDownloadByDate(currentValue.point.category);
                //             }
                //         }
                //     }
                // }
            },
            series: [{
                showInLegend: false,
                data: yaxis,
                color: '#7089A9'
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [
                            {
                                text: "Export to Excel",
                                onclick: this.attendanceDownloadByDate.bind(this)
                            },
                            {
                                text: 'Export to PDF',
                                onclick: function () {
                                    this.exportChart({
                                        type: 'application/pdf'
                                    });
                                }
                            },
                            {
                                text: 'Export to JPG',
                                onclick: function () {
                                    this.exportChart({
                                        type: 'JPG'
                                    });
                                }
                            },
                            {
                                text: 'Export to PNG',
                                onclick: function () {
                                    this.exportChart({
                                        type: 'PNG'
                                    });
                                }
                            },
                            {
                                text: 'Print your chart',
                                onclick: function () {
                                    this.print();
                                }
                            }
                        ]
                    }
                }
            }
        });
    }

    attendanceDownloadByDate() {
        let PresentMembers = [];
        let AbsentMembers = [];
        this.TotalAttendanceDownloadData = [];
        debugger;
        if (this.projectId == null || (this.projectId != null && this.projectId.trim() == "0")) {
            this.bcpAssociateTrackerService.getBcpAssociateTrackerAll().subscribe(model => {
                let totalAccountMembers = model.userDetail;
                this.bcpChartService.getAccountAttendanceDataAll().subscribe((response: BCPDailyUpdate[]) => {
                    let uniqueUpdateDate;
                    debugger;
                    uniqueUpdateDate = this.fillMissingDates([...new Set(response.map(item => item.UpdateDate))]);
                    uniqueUpdateDate.forEach(selectedDate => {
                        debugger;
                        let membersAbsentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                        PresentMembers = totalAccountMembers.filter(x => !membersAbsentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                            .map(a => ({
                                AccountID: a.AccountID,
                                AccountName: a.AccountName,
                                AssociateId: a.AssociateId,
                                AssociateName: a.AssociateName,
                                Date: selectedDate,
                                Attendance: "Yes"
                            }));

                        let membersPresentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                        AbsentMembers = totalAccountMembers.filter(x => membersPresentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                            .map(a => ({
                                AccountID: a.AccountID,
                                AccountName: a.AccountName,
                                AssociateId: a.AssociateId,
                                AssociateName: a.AssociateName,
                                Date: selectedDate,
                                Attendance: "No"
                            }));

                        this.TotalAttendanceDownloadData.push.apply(this.TotalAttendanceDownloadData, AbsentMembers.concat(PresentMembers))

                    });

                    if (this.TotalAttendanceDownloadData.length > 0) {
                        this.exportExcel(this.TotalAttendanceDownloadData, this.projectId == 0 ? "AllAccount_" : this.projectId + "Attendance", "AttendanceDetails");

                    }
                });
            });
        }
        else {
            this.bcpAssociateTrackerService.getBcpAssociateTracker(this.projectId).subscribe(model => {
                let totalAccountMembers = model.userDetail;
                this.bcpChartService.getAccountAttendanceData(this.projectId).subscribe((response: BCPDailyUpdate[]) => {
                    debugger;
                    let uniqueUpdateDate;
                    uniqueUpdateDate = this.fillMissingDates([...new Set(response.map(item => item.UpdateDate))]);
                    uniqueUpdateDate.forEach(selectedDate => {
                        debugger;
                        let membersAbsentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                        PresentMembers = totalAccountMembers.filter(x => !membersAbsentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                            .map(a => ({
                                AccountID: a.AccountID,
                                AccountName: a.AccountName,
                                AssociateId: a.AssociateId,
                                AssociateName: a.AssociateName,
                                Date: selectedDate,
                                Attendance: "Yes"
                            }));

                        let membersPresentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                        AbsentMembers = totalAccountMembers.filter(x => membersPresentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                            .map(a => ({
                                AccountID: a.AccountID,
                                AccountName: a.AccountName,
                                AssociateId: a.AssociateId,
                                AssociateName: a.AssociateName,
                                Date: selectedDate,
                                Attendance: "No"
                            }));

                        this.TotalAttendanceDownloadData.push.apply(this.TotalAttendanceDownloadData, AbsentMembers.concat(PresentMembers))

                    });

                    if (this.TotalAttendanceDownloadData.length > 0) {
                        this.exportExcel(this.TotalAttendanceDownloadData, this.projectId == 0 ? "AllAccount_" : this.projectId + "Attendance", "AttendanceDetails");
                    }
                });
            });
        }
    }

    protocolGraph(chartData, protocolA, protocolB1, protocolB2, protocolB3, protocolB4, protocolC1, protocolC2, protocolC3, protocolC4, protocolD) {

        // var fileName = "";
        // var sheetName = "Protocol Details";
        // var resultGraph = [];

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        this.chart5 = Highcharts.chart('container5', {
            chart: {
                plotBackgroundColor: null,
                // borderColor: '#656565',
                borderWidth: 1,
                type: 'bar'
            },
            title: {
                text: 'Mode of Connectivity',
                style: {
                    color: '#535D7C',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                categories: [
                    'Protocol A', 'Protocol B.1', 'Protocol B.2', 'Protocol B.3', 'Protocol B.4',
                    'Protocol C.1', 'Protocol C.2', 'Protocol C.3', 'Protocol C.4', 'Protocol D'
                ],
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                },
                stackLabels: {
                    style: {
                        color: '#646ED6',
                        fontWeight: 'bold'
                    },
                    enabled: true,
                    crop: false,
                    overflow: 'none',
                    x: 0
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                bar: {
                    stacking: 'normal',
                    pointPadding: 0,
                    groupPadding: 0,
                    dataLabels: {
                        enabled: false
                    }
                },
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
                // series: {
                //     cursor: 'pointer',
                //     point: {
                //         events: {
                //             click: function () {
                //                 var protocol;
                //                 if (this.x == '0') {
                //                     protocol = "A";
                //                 }
                //                 else if (this.x == '1') {
                //                     protocol = "B1";
                //                 }
                //                 else if (this.x == '2') {
                //                     protocol = "B2";
                //                 }
                //                 else if (this.x == '3') {
                //                     protocol = "B3";
                //                 }
                //                 else if (this.x == '4') {
                //                     protocol = "B4";
                //                 }
                //                 else if (this.x == '5') {
                //                     protocol = "C1";
                //                 }
                //                 else if (this.x == '6') {
                //                     protocol = "C2";
                //                 }
                //                 else if (this.x == '7') {
                //                     protocol = "C3";
                //                 }
                //                 else if (this.x == '8') {
                //                     protocol = "C4";
                //                 }
                //                 else if (this.x == '9') {
                //                     protocol = "D";
                //                 }


                //                 if (protocolA == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolA");
                //                     fileName = "ProtocolA";
                //                 }

                //                 else if (protocolB1 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolB1");
                //                     fileName = "ProtocolB1";
                //                 }

                //                 else if (protocolB2 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolB2");
                //                     fileName = "ProtocolB2";
                //                 }

                //                 else if (protocolB3 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolB3");
                //                     fileName = "ProtocolB3";
                //                 }

                //                 else if (protocolB4 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolB4");
                //                     fileName = "ProtocolB4";
                //                 }

                //                 else if (protocolC1 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolC1");
                //                     fileName = "ProtocolC1";
                //                 }

                //                 else if (protocolC2 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolC2");
                //                     fileName = "ProtocolC2";
                //                 }

                //                 else if (protocolC3 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolC3");
                //                     fileName = "ProtocolC3";
                //                 }

                //                 else if (protocolC4 == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolC4");
                //                     fileName = "ProtocolC4";
                //                 }

                //                 else if (protocolD == this.y) {
                //                     resultGraph = chartData.filter(x => x.Protocol == "ProtocolD");
                //                     fileName = "ProtocolD";
                //                 }

                //                 var wb = { SheetNames: [], Sheets: {} };
                //                 const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(resultGraph);
                //                 wb.SheetNames.push(sheetName);
                //                 wb.Sheets[sheetName] = worksheet1;
                //                 const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                //                 const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
                //                 FileSaver.saveAs(data, fileName + '_export_' + EXCEL_EXTENSION);
                //             }
                //         }
                //     }
                // },                
            },
            series: [{
                showInLegend: false,
                data: [protocolA, protocolB1, protocolB2, protocolB3, protocolB4, protocolC1, protocolC2, protocolC3,
                    protocolC4, protocolD],
                color: '#646ED6'
            }],
            exporting: {
                buttons: {
                    contextButton: {
                        menuItems: [{
                            text: "Export to Excel",
                            onclick: this.downloadProtocolReport.bind(this)
                        },
                        {
                            text: 'Export to PDF',
                            onclick: function () {
                                this.exportChart({
                                    type: 'application/pdf'
                                });
                            }
                        },
                        {
                            text: 'Export to JPG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'JPG'
                                });
                            }
                        },
                        {
                            text: 'Export to PNG',
                            onclick: function () {
                                this.exportChart({
                                    type: 'PNG'
                                });
                            }
                        },
                        {
                            text: 'Print your chart',
                            onclick: function () {
                                this.print();
                            }
                        }]
                    }
                }
            }
        });
    }
}