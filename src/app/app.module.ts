import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule } from 'angular2-toaster';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.conponent';
import { BcpFileExportService } from './providers/bcp-file-export-service';
import { BcpGraphExportService } from './providers/bcp-graph-export.service'
import { BsModalService, ModalModule } from 'ngx-bootstrap';
import { BcpChartComponent } from './bcp-chart-tracker/bcp-chart.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

import { ChartModule } from 'angular-highcharts';
import { BcpChartService } from './providers/bcp-chart.service';
import { LoaderComponent } from './loader/loader.component';
import { UserResolver } from './providers/resolver/bcp-account-master.resolver';
import { BcpAssociateTrackerService } from './providers/bcp-associates-tracker.service';
import { BcpDataTrackerService } from './providers/bcp-data-tracker.service';
import { BcpAttendenceTrackerService } from './providers/bcp-Attendence-tracker.service';
import { BcpAssociateTrackerComponent } from './bcp-associates-tracker/bcp-associates-tracker.conponent';
import { GrdFilterPipe } from './bcp-associates-tracker/builder-filter-pipe';
import { BcpDownloadService } from './providers/bcp-download.service';
import { BcpAccountMasterService } from './providers/bcp-account-master.service';
import { BcpGraphExportService } from './providers/bcp-graph-export.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BcpAssociateTrackerComponent,
    BcpChartComponent,
    GrdFilterPipe,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToasterModule.forRoot(),
    ModalModule.forRoot(),
    AutocompleteLibModule,
    ChartModule,
    AppRoutingModule
  ],
  providers: [
    BsModalService,
    BcpAssociateTrackerService,
    BcpDataTrackerService,
    BcpAttendenceTrackerService,
    BcpDownloadService,
    BcpAccountMasterService,
    BcpChartService,
    BcpFileExportService,
    BcpGraphExportService,
    UserResolver,
    GrdFilterPipe,
    BcpGraphExportService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
