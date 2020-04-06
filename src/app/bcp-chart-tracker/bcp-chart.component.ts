import { Component, OnInit } from '@angular/core';
import { BcpChartService } from '../providers/bcp-chart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BCPDailyUpdate } from '../models/BCPDailyUpdate';
import { BcpAssociateTrackerService } from '../providers/bcp-associates-tracker.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

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
        private route: ActivatedRoute) { }

    keyword = 'name';
    projectId: any;
    chartData: any = [];
    availableDate: any = [];
    attendanceData: any = [];
    TotalAttendanceDownloadData: any = [];
    deviceType: any = [];
    accountCount: any;

    ngOnInit() {
        this.route.params.subscribe(params => { this.projectId = params["id"] });
        this.bcpChartService.getBCPDataTrackerHistoryCount(this.projectId).subscribe(data => {
            this.accountCount = data;
            this.getBcpDetailsUpdateData(this.projectId);
        });
    }

    NavigateToUserTracker() {
        this.router.navigate(['/bcm-user-tracker', this.projectId]);
    }

    getBcpDetailsUpdateData(projectId) {
        this.chartData = [];
        this.bcpChartService.getBCPDataTrackerHistory(projectId).subscribe(data => {
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
        this.getProtocolType(chartData, uniqueUpdateDate);
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

        uniqueUpdateDate.forEach((updateDate: any) => {
            var personaltemp = chartData.filter(item => item.UpdateDate == updateDate && item.WFHDeviceType == "Personal Device");
            personalDevice.push({ date: updateDate, count: personaltemp.length });
            var cognizantDevicetemp = chartData.filter(item => item.UpdateDate == updateDate && item.WFHDeviceType == "Cognizant Device");
            cognizantDevice.push({ date: updateDate, count: cognizantDevicetemp.length });
            var customerDevicetemp = chartData.filter(item => item.UpdateDate == updateDate && item.WFHDeviceType == "Customer Device");
            customerDevice.push({ date: updateDate, count: customerDevicetemp.length });
            var cognizantBOYDstemp = chartData.filter(item => item.UpdateDate == updateDate && item.WFHDeviceType == "Cognizant BYOD");
            cognizantBYODs.push({ date: updateDate, count: cognizantBOYDstemp.length });
        });

        this.deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs);
    }

    private getPersonalReason(chartData, uniqueUpdateDate) {
        var noDevice = [];
        var unplannedLeave = [];
        var plannedLeave = [];
        var workingAtOffice = [];
        var connectivity = [];
        var covid19 = [];

        uniqueUpdateDate.forEach((updateDate: any) => {
            var nodevice = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "No device");
            noDevice.push({ date: updateDate, count: nodevice.length });
            var unplanned = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "unplanned leave");
            unplannedLeave.push({ date: updateDate, count: unplanned.length });
            var planned = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "planned leave");
            plannedLeave.push({ date: updateDate, count: planned.length });
            var workAtOffice = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "working at office");
            workingAtOffice.push({ date: updateDate, count: workAtOffice.length });
            var connect = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "Connectivity");
            connectivity.push({ date: updateDate, count: connect.length });
            var covid = chartData.filter(item => item.UpdateDate == updateDate && item.PersonalReason == "COVID19");
            covid19.push({ date: updateDate, count: covid.length });
        });
        this.personalReasonGraph(noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19);
    }

    private getProtocolType(chartData, uniqueUpdateDate) {

        var protocolAList = [];
        var protocolB1List = [];
        var protocolB2List = [];
        var protocolB3List = [];
        var protocolB4List = [];
        var protocolC1List = [];
        var protocolC2List = [];
        var protocolC3List = [];
        var protocolC4List = [];
        var protocolDList = [];

        uniqueUpdateDate.forEach((updateDate: any) => {
            var protocolA = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol A");
            protocolAList.push({ date: updateDate, count: protocolA.length });
            var protocolB1 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol B.1");
            protocolB1List.push({ date: updateDate, count: protocolB1.length });
            var protocolB2 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol B.2");
            protocolB2List.push({ date: updateDate, count: protocolB2.length });
            var protocolB3 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol B.3");
            protocolB3List.push({ date: updateDate, count: protocolB3.length });
            var protocolB4 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol B.4");
            protocolB4List.push({ date: updateDate, count: protocolB4.length });
            var protocolC1 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol C.1");
            protocolC1List.push({ date: updateDate, count: protocolC1.length });
            var protocolC2 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol C.2");
            protocolC2List.push({ date: updateDate, count: protocolC2.length });
            var protocolC3 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol C.3");
            protocolC3List.push({ date: updateDate, count: protocolC3.length });
            var protocolC4 = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol C.4");
            protocolC4List.push({ date: updateDate, count: protocolC4.length });
            var protocolD = chartData.filter(item => item.UpdateDate == updateDate && item.Protocol == "Protocol D");
            protocolDList.push({ date: updateDate, count: protocolD.length });

        });
        this.protocolGraph(protocolAList, protocolB1List, protocolB2List, protocolB3List, protocolB4List, protocolC1List, protocolC2List, protocolC3List, protocolC4List, protocolDList);
    }

    deviceTypeGraph(personalDevice, cognizantDevice, customerDevice, cognizantBYODs) {
        var xaxis = [];
        var Yaxis_personal = [];
        var Yaxis_cts = [];
        var Yaxis_cus = [];
        var Yaxis_byod = [];
        personalDevice.forEach(element => {
            xaxis.push(element.date);
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
                categories: xaxis
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

    personalReasonGraph(noDevice, unplannedLeave, plannedLeave, workingAtOffice, connectivity, covid19) {
        var xaxis = [];
        var noDeviceYaxis = [];
        var unplannedLeaveYaxis = [];
        var plannedLeaveYaxis = [];
        var workingAtOfficeYaxis = [];
        var connectivityYaxis = [];
        var covidYaxis = [];
        noDevice.forEach(element => {
            xaxis.push(element.date);
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
                name: 'No Device',
                data: noDeviceYaxis
            },
            {
                name: 'Unplanned Leave',
                data: unplannedLeaveYaxis
            },
            {
                name: 'Planned Leave',
                data: plannedLeaveYaxis
            },
            {
                name: 'Working At Office',
                data: workingAtOfficeYaxis
            },
            {
                name: 'Connectivity',
                data: connectivityYaxis
            },
            {
                name: 'Covid19',
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

    attendanceDownloadByDate(specificDate?:any) {
        let PresentMembers = [];
        let AbsentMembers = [];
        this.TotalAttendanceDownloadData = [];
        this.bcpAssociateTrackerService.getBcpAssociateTracker(this.projectId).subscribe(model => {
            let totalAccountMembers = model.userDetail;
            this.bcpChartService.getAccountAttendanceData(this.projectId).subscribe((response: BCPDailyUpdate[]) => {
                let uniqueUpdateDate;
                if(specificDate) {
                    uniqueUpdateDate = [specificDate];
                } else {
                    uniqueUpdateDate = [...new Set(response.map(item => item.UpdateDate))];
                }
                uniqueUpdateDate.forEach(selectedDate => {
                    let membersAbsentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                    PresentMembers = totalAccountMembers.filter(x => !membersAbsentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                    .map(a=>({
                        AccountID: a.AccountID,
                        AccountName: a.AccountName,
                        AssociateId: a.AssociateId,
                        AssociateName: a.AssociateName,
                        Date: selectedDate,
                        Attendance: "Yes"
                    }));
    
                    let membersPresentOnSelectedDate = response.filter(item => item.UpdateDate == selectedDate && item.Attendance == "No");
                    AbsentMembers = totalAccountMembers.filter(x => membersPresentOnSelectedDate.map(y => y.AssociateID).includes(x.AssociateId))
                    .map(a=>({
                        AccountID: a.AccountID,
                        AccountName: a.AccountName,
                        AssociateId: a.AssociateId,
                        AssociateName: a.AssociateName,
                        Date: selectedDate,
                        Attendance: "No"
                    }));

                    this.TotalAttendanceDownloadData.push.apply(this.TotalAttendanceDownloadData, AbsentMembers.concat(PresentMembers))

                });

                if(this.TotalAttendanceDownloadData.length>0){
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

    protocolGraph(protocolAList, protocolB1List, protocolB2List, protocolB3List, protocolB4List, protocolC1List, protocolC2List, protocolC3List, protocolC4List, protocolDList) {
        var xAxis = [];
        var protocolAListYAxis = [];
        var protocolB1ListYAxis = [];
        var protocolB2ListYAxis = [];
        var protocolB3ListYAxis = [];
        var protocolB4ListYAxis = [];
        var protocolC1ListYAxis = [];
        var protocolC2ListYAxis = [];
        var protocolC3ListYAxis = [];
        var protocolC4ListYAxis = [];
        var protocolDListYAxis = [];

        protocolAList.forEach(element => {
            xAxis.push(element.date);
            protocolAListYAxis.push(element.count);
        });
        protocolB1List.forEach(element => {
            protocolB1ListYAxis.push(element.count);
        });
        protocolB2List.forEach(element => {
            protocolB2ListYAxis.push(element.count);
        });
        protocolB3List.forEach(element => {
            protocolB3ListYAxis.push(element.count);
        });
        protocolB4List.forEach(element => {
            protocolB4ListYAxis.push(element.count);
        });
        protocolC1List.forEach(element => {
            protocolC1ListYAxis.push(element.count);
        });
        protocolC2List.forEach(element => {
            protocolC2ListYAxis.push(element.count);
        });
        protocolC3List.forEach(element => {
            protocolC3ListYAxis.push(element.count);
        });
        protocolC4List.forEach(element => {
            protocolC4ListYAxis.push(element.count);
        });
        protocolDList.forEach(element => {
            protocolDListYAxis.push(element.count);
        });

        var Highcharts = require('highcharts');
        require('highcharts/modules/exporting')(Highcharts);
        Highcharts.chart('container5', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Protocol'
            },
            xAxis: {
                categories: xAxis
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
                name: 'Protocol A',
                data: protocolAListYAxis
            },
            {
                name: 'Protocol B.1',
                data: protocolB1ListYAxis
            },
            {
                name: 'Protocol B.2',
                data: protocolB2ListYAxis
            },
            {
                name: 'Protocol B.3',
                data: protocolB3ListYAxis
            }, {
                name: 'Protocol B.4',
                data: protocolB4ListYAxis
            },
            {
                name: 'Protocol C.1',
                data: protocolC1ListYAxis
            },
            {
                name: 'Protocol C.2',
                data: protocolC2ListYAxis
            },
            {
                name: 'Protocol C.3',
                data: protocolC3ListYAxis
            },
            {
                name: 'Protocol C4',
                data: protocolC4ListYAxis
            },
            {
                name: 'Protocol D',
                data: protocolDListYAxis
            },
            ]
        });
    }
}