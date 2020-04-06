import { Component, OnInit } from '@angular/core';
import { BcpChartService } from '../providers/bcp-chart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';
import { BcpAssociateTrackerService } from '../providers/bcp-associates-tracker.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { BcpGraphExportService } from '../providers/bcp-graph-export.service';
import { BCPDetailsUpdate } from '../models/BCPDetailsUpdate';

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
        private router: Router,
        private route: ActivatedRoute,
        private bcpGraphExportService: BcpGraphExportService) { }

    keyword = 'name';
    projectId: any;
    chartData: BCPDetailsUpdate[] = [];
    availableDate: any = [];
    attendanceData: any = [];
    TotalAttendanceDownloadData: any = [];
    deviceType: any = [];
    accountCount: any;
    protocolData: any = [];

    ngOnInit() {
        this.route.params.subscribe(params => { this.projectId = params["id"] });
        this.bcpChartService.getBCPDataTrackerHistoryCount(this.projectId).subscribe(data => {
            this.accountCount = data;
            this.getBcpDetailsUpdateData(this.projectId);
        });
    }

    downloadProtocolReport() {
        if (this.protocolData.length > 0) {
            var wb = { SheetNames: [], Sheets: {} };
            const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.protocolData);
            wb.SheetNames.push("ProtocolReport");
            wb.Sheets["ProtocolReport"] = worksheet1;
            const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
            FileSaver.saveAs(data, 'Protocol' + '_export_' + EXCEL_EXTENSION);
        }
    }

    NavigateToUserTracker() {
        this.router.navigate(['/bcm-user-tracker', this.projectId]);
    }

    getBcpDetailsUpdateData(projectId) {
        this.chartData = [];
        this.bcpChartService.getBCPDataTrackerHistory(projectId).subscribe(data => {
            this.chartData = data.bcpDetailsUpdate;
            this.getChartData(data.bcpDetailsUpdate);
        });
        this.bcpChartService.getAccountAttendanceData(projectId).subscribe((response: BCPDailyUpdate[]) => {
            const uniqueUpdateDate = [...new Set(response.map(item => item.UpdateDate))];
            uniqueUpdateDate.forEach((updateDate: any) => {
                const uniqueYes = response.filter(item => item.UpdateDate == updateDate && item.Attendance == "No");
                const uniqueYesCount = this.accountCount - uniqueYes.length;
                const percent = (uniqueYesCount / this.accountCount) * 100;
                const roundPer = parseFloat(percent.toString()).toFixed(2);
                this.attendanceData.push({ date: updateDate, count: +roundPer });
            });
            this.attendanceGraph(this.attendanceData);
        });
    }

    getChartData(chartData) {
        const uniqueUpdateDate = [...new Set(chartData.map(item => item.UpdateDate))];

        this.getWFHReadiness(chartData, uniqueUpdateDate);
        this.getDeviceType(chartData, uniqueUpdateDate);
        this.getPersonalReason(chartData, uniqueUpdateDate);
        this.getProtocolType(chartData);
    }

    private getWFHReadiness(chartData, uniqueUpdateDate) {
        var wfhRedinessYes = [];
        var wfhRedinessNo = [];
        uniqueUpdateDate.forEach((updateDate: any) => {
            var uniqueYes = chartData.filter(item => item.UpdateDate == updateDate && item.CurrentEnabledforWFH == "Yes");
            wfhRedinessYes.push({ date: updateDate, count: uniqueYes.length });
            var uniqueNo = chartData.filter(item => item.UpdateDate == updateDate && item.CurrentEnabledforWFH == "No");
            wfhRedinessNo.push({ date: updateDate, count: uniqueNo.length });
        });
        this.workFromHomeGraph(wfhRedinessYes, wfhRedinessNo);
    }

    private getDeviceType(chartData, uniqueUpdateDate) {
        var personalDevice = [];
        var cognizantDevice = [];
        var customerDevice = [];
        var cognizantBYODs = [];
        this.deviceType = [];

        var personaltemp = chartData.filter(item => item.WFHDeviceType == "Personal Device");
        personaltemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AssociateId: x.AssociateID, DeviceType: x.WFHDeviceType });
        });
        personalDevice.push({ count: personaltemp.length, data: personaltemp });
        var cognizantDevicetemp = chartData.filter(item => item.WFHDeviceType == "Cognizant Device");
        cognizantDevicetemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AssociateId: x.AssociateID, DeviceType: x.WFHDeviceType });
        });
        cognizantDevice.push({ count: cognizantDevicetemp.length, data: personaltemp });
        var customerDevicetemp = chartData.filter(item => item.WFHDeviceType == "Customer Device");
        customerDevicetemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AssociateId: x.AssociateID, DeviceType: x.WFHDeviceType });
        });
        customerDevice.push({ count: customerDevicetemp.length, data: personaltemp });
        var cognizantBOYDstemp = chartData.filter(item => item.WFHDeviceType == "Cognizant BYOD");
        cognizantBOYDstemp.forEach(x => {
            this.deviceType.push({ AccountID: x.AccountId, AssociateId: x.AssociateID, DeviceType: x.WFHDeviceType });
        });
        console.log(this.deviceType);
        cognizantBYODs.push({ count: cognizantBOYDstemp.length, data: personaltemp });

        this.deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs);
    }

    private getPersonalReason(chartData, uniqueUpdateDate) {
        var noDevice = [];
        var unplannedLeave = [];
        var plannedLeave = [];
        var workingAtOffice = [];
        var connectivity = [];
        var covid19 = [];
        // var currentDate = moment().format("DD-MM-YYYY");

        var nodevice = chartData.filter(item => item.PersonalReason == "No device");
        nodevice.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "No device" });
        });
        noDevice.push({ count: nodevice.length, data: nodevice });
        var unplanned = chartData.filter(item => item.PersonalReason == "unplanned leave");
        unplanned.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "Unplanned leave" });
        });
        unplannedLeave.push({ count: unplanned.length, data: unplanned });
        var planned = chartData.filter(item => item.PersonalReason == "planned leave");
        planned.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "Planned leave" });
        });
        plannedLeave.push({ count: planned.length, data: planned });
        var workAtOffice = chartData.filter(item => item.PersonalReason == "working at office");
        workAtOffice.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "Working at office" });
        });
        workingAtOffice.push({ count: workAtOffice.length, data: workAtOffice });
        var connect = chartData.filter(item => item.PersonalReason == "Connectivity");
        connect.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "Connectivity" });
        });
        connectivity.push({ count: connect.length, data: connect });
        var covid = chartData.filter(item => item.PersonalReason == "COVID19");
        covid.forEach(x => {
            this.availableDate.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, PersonalLeave: "COVID19" });
        });
        covid19.push({ count: covid.length, data: covid });

        this.personalReasonGraph(noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19);
    }
    private getProtocolType(chartData) {
        var protocolA = chartData.filter(item => item.Protocol == "Protocol A");

        protocolA.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol A" });
        });

        var protocolB1 = chartData.filter(item => item.Protocol == "Protocol B.1");

        protocolB1.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol B.1" });
        });

        var protocolB2 = chartData.filter(item => item.Protocol == "Protocol B.2");

        protocolB2.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol B.2" });
        });

        var protocolB3 = chartData.filter(item => item.Protocol == "Protocol B.3");

        protocolB3.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol B.3" });
        });

        var protocolB4 = chartData.filter(item => item.Protocol == "Protocol B.4");

        protocolB4.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol B.4" });
        });

        var protocolC1 = chartData.filter(item => item.Protocol == "Protocol C.1");

        protocolC1.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol C.1" });
        });

        var protocolC2 = chartData.filter(item => item.Protocol == "Protocol C.2");

        protocolC2.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol C.2" });
        });

        var protocolC3 = chartData.filter(item => item.Protocol == "Protocol C.3");

        protocolC3.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol C.3" });
        });

        var protocolC4 = chartData.filter(item => item.Protocol == "Protocol C.4");

        protocolC4.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol C.4" });
        });

        var protocolD = chartData.filter(item => item.Protocol == "Protocol D");

        protocolD.forEach(x => {
            this.protocolData.push({ ProjectId: x.AccountId, AssociateId: x.AssociateID, Protocol: "Protocol D" });
        });

        this.protocolGraph(chartData, protocolA.length, protocolB1.length, protocolB2.length, protocolB3.length,
            protocolB4.length, protocolC1.length, protocolC2.length, protocolC3.length, protocolC4.length, protocolD.length);
    }

    exportContainer1() {
        console.log(this.deviceType);
        var result = this.deviceType.map(item => ({
            AccountID: item.Title,
            AssociateID: item.AssociateID,
            DeviceType: item.WFHDeviceType
        }));
        var wb = { SheetNames: [], Sheets: {} };
        const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(result);
        wb.SheetNames.push("DeviceType");
        wb.Sheets["DeviceType"] = worksheet1;
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, 'Device' + '_export_' + EXCEL_EXTENSION);
    }

    deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs) {
        // // var xaxis = [];
        var Yaxis_personal = [];
        var Yaxis_cts = [];
        var Yaxis_cus = [];
        var Yaxis_byod = [];
        personalDevice.forEach(element => {
            // // xaxis.push(element.date);
            Yaxis_personal.push(element.count);
        });
        cognizantDevice.forEach(element => {
            Yaxis_cts.push(element.count);
        });
        customerDevice.forEach(element => {
            Yaxis_cus.push(element.count);
        });
        cognizantBYODs.forEach(element => {
            Yaxis_byod.push(element.count);
        });

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container1', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Personal/Customer/Cognizant Device Availability'
            },
            xAxis: {
                categories: ['Devices']
            },
            yAxis: {
                title: {
                    text: ' Count '
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                alert('Device: ' + this.x + ', value: ' + this.y);
                                console.log('Device: ' + this.category + ', value: ' + this.y + "Series name - " + this.series.name);
                                console.log(this.deviceType);
                                console.log("Series name - " + this.series.name);
                                if (this.series.name == "Cognizant BYOD") {

                                    var result = cognizantBYODs[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        DeviceType: item.WFHDeviceType
                                    }));
                                    console.log('BYOD' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Device Availability");
                                } else if (this.series.name == "Cognizant Device") {

                                    var result = cognizantDevice[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        DeviceType: item.WFHDeviceType
                                    }));
                                    console.log('Cognizant Device' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Device Availability");
                                } else if (this.series.name == "Customer Device") {
                                    console.log('Customer Device' + this.deviceType);
                                    var result = customerDevice[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        DeviceType: item.WFHDeviceType
                                    }));
                                    console.log('Customer Device' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Device Availability");
                                } else if (this.series.name == "Personal Device") {
                                    var result = personalDevice[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        DeviceType: item.WFHDeviceType
                                    }));
                                    console.log('Personal Device' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Device Availability");
                                }
                            }
                        }
                    }
                },
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                name: 'Personal Device',
                data: Yaxis_personal
            },
            {
                name: 'Cognizant Device',
                data: Yaxis_cts
            },
            {
                name: 'Customer Device',
                data: Yaxis_cus
            },
            {
                name: 'Cognizant BYOD',
                data: Yaxis_byod
            }]
        });
    }

    workFromHomeGraph(wfhRedinessYes, wfhRedinessNo) {
        var xaxis = [];
        var yAxisDataYes = [];
        var yAxisDataNo = [];
        wfhRedinessYes.forEach(element => {
            xaxis.push(element.date);
            yAxisDataYes.push(element.count);
        });
        wfhRedinessNo.forEach(element => {
            yAxisDataNo.push(element.count);
        });
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container2', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Work From Home'
            },
            xAxis: {
                categories: xaxis
            },
            yAxis: {
                title: {
                    text: ' Count '
                }
            }, credits: {
                enabled: false
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                name: 'Work From Home -yes',
                data: yAxisDataYes
            }, {
                name: 'Work From Home -No',
                data: yAxisDataNo
            }
            ]
        });
    }

    personalLeaveExcelSheetData() {
        console.log(this.availableDate);
        var result = this.availableDate.map(item => ({
            AccountID: item.Title,
            AssociateID: item.AssociateID,
            PersonalLeave: item.PersonalLeave
        }));
        var wb = { SheetNames: [], Sheets: {} };
        const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(result);
        wb.SheetNames.push("PersonalReason");
        wb.Sheets["PersonalReason"] = worksheet1;
        const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, 'Personal' + '_export_' + EXCEL_EXTENSION);
    }

    personalReasonGraph(noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19) {
        // var xaxis = [];
        var noDeviceYaxis = [];
        var unplannedLeaveYaxis = [];
        var plannedLeaveYaxis = [];
        var workingAtOfficeYaxis = [];
        var connectivityYaxis = [];
        var covidYaxis = [];

        noDevice.forEach(element => {
            // xaxis.push(element.date);
            noDeviceYaxis.push(element.count);
        });
        unplannedLeave.forEach(element => {
            unplannedLeaveYaxis.push(element.count);
        });
        plannedLeave.forEach(element => {
            plannedLeaveYaxis.push(element.count);
        });
        workingAtOffice.forEach(element => {
            workingAtOfficeYaxis.push(element.count);
        });
        connectivity.forEach(element => {
            connectivityYaxis.push(element.count);
        });
        covid19.forEach(element => {
            covidYaxis.push(element.count);
        });
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container3', {
            chart: {
                type: 'column'
            },
            title: {
                text: ' Personal Reason'
            },
            xAxis: {
                categories: ['Reason']
            },
            yAxis: {
                title: {
                    text: ' Count '
                }
            }, credits: {
                enabled: false
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                },
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function (event) {
                                if (this.series.name == "No device") {
                                    console.log(noDevice[0].data);
                                    var result = noDevice[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                                else if (this.series.name == "COVID19") {
                                    console.log(covid19[0].data);
                                    var result = covid19[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                                else if (this.series.name == "Unplanned leave") {
                                    console.log(unplannedLeave[0].data);
                                    var result = unplannedLeave[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                                else if (this.series.name == "Planned leave") {
                                    console.log(plannedLeave[0].data);
                                    var result = plannedLeave[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                                else if (this.series.name == "Working at office") {
                                    console.log(workingAtOffice[0].data);
                                    var result = workingAtOffice[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                                else if (this.series.name == "Connectivity") {
                                    console.log(connectivity[0].data);
                                    var result = connectivity[0].data.map(item => ({
                                        AccountID: item.Title,
                                        AssociateID: item.AssociateID,
                                        PersonalLeave: item.PersonalLeave
                                    }));
                                    console.log('Result1' + result);
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Personal Reason");
                                }
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'No device',
                data: noDeviceYaxis
            },
            {
                name: 'Unplanned leave',
                data: unplannedLeaveYaxis
            },
            {
                name: 'Planned leave',
                data: plannedLeaveYaxis
            },
            {
                name: 'Working at office',
                data: workingAtOfficeYaxis
            },
            {
                name: 'Connectivity',
                data: connectivityYaxis
            },
            {
                name: 'COVID19',
                data: covidYaxis
            }]
        });
    }

    attendanceGraph(attendance) {
        var xaxis = [];
        var yaxis = [];
        attendance.forEach(element => {
            xaxis.push(element.date);
            yaxis.push(element.count);
        });
        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container4', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Attendance'
            },
            xAxis: {
                categories: xaxis
            },
            yAxis: {
                title: {
                    text: ' Percentage '
                }
            }, credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: (currentValue) => {
                                this.attendanceDownloadByDate(currentValue.point.category);
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Attendance',
                data: yaxis
            }]
        });
    }

    attendanceDownloadByDate(specificDate?: any) {
        let PresentMembers = [];
        let AbsentMembers = [];
        this.TotalAttendanceDownloadData = [];
        this.bcpAssociateTrackerService.getBcpAssociateTracker(this.projectId).subscribe(model => {
            let totalAccountMembers = model.userDetail;
            this.bcpChartService.getAccountAttendanceData(this.projectId).subscribe((response: BCPDailyUpdate[]) => {
                let uniqueUpdateDate;
                if (specificDate) {
                    uniqueUpdateDate = [specificDate];
                } else {
                    uniqueUpdateDate = [...new Set(response.map(item => item.UpdateDate))];
                }
                uniqueUpdateDate.forEach(selectedDate => {
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
                    var wb = { SheetNames: [], Sheets: {} };
                    const worksheet1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.TotalAttendanceDownloadData);
                    wb.SheetNames.push("AttendanceDetails");
                    wb.Sheets["AttendanceDetails"] = worksheet1;
                    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
                    FileSaver.saveAs(data, 'Attendance' + '_export_' + EXCEL_EXTENSION);

                }
            });
        });
    }

    protocolGraph(chartData, protocolA, protocolB1, protocolB2, protocolB3, protocolB4, protocolC1, protocolC2, protocolC3, protocolC4, protocolD) {

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container5', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Protocol'
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
                }
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                var protocol;
                                if (this.x == '0') {
                                    protocol = "A";
                                }
                                else if (this.x == '1') {
                                    protocol = "B1";
                                }
                                else if (this.x == '2') {
                                    protocol = "B2";
                                }
                                else if (this.x == '3') {
                                    protocol = "B3";
                                }
                                else if (this.x == '4') {
                                    protocol = "B4";
                                }
                                else if (this.x == '5') {
                                    protocol = "C1";
                                }
                                else if (this.x == '6') {
                                    protocol = "C2";
                                }
                                else if (this.x == '7') {
                                    protocol = "C3";
                                }
                                else if (this.x == '8') {
                                    protocol = "C4";
                                }
                                else if (this.x == '9') {
                                    protocol = "D";
                                }

                                alert('Protocol: ' + protocol + ', value: ' + this.y);

                                if (protocolA == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolA").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolB1 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolB1").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolB2 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolB2").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolB3 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolB3").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolB4 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolB4").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolC1 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolC1").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolC2 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolC2").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolC3 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolC3").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolC4 == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolC4").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }

                                else if (protocolD == this.y) {
                                    var result = chartData.filter(x => x.Protocol == "ProtocolD").map(item => {
                                        return new (
                                            item.Title,
                                            item.AssociateID,
                                            item.Protocol
                                        )
                                    });
                                    this.bcpGraphExportService.exportAsExcelFile(result, this.projectId, "Protocol");
                                }
                            }
                        }
                    }
                },
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                name: 'Protocol Count',
                data: [protocolA, protocolB1, protocolB2, protocolB3, protocolB4, protocolC1, protocolC2, protocolC3,
                    protocolC4, protocolD]
            }]
        });
    }
}