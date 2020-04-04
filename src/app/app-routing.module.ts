import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.conponent';
import { BcpChartComponent } from './bcp-chart-tracker/bcp-chart.component';
import { BcpAssociateTrackerComponent } from './bcp-associates-tracker/bcp-associates-tracker.conponent';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'bcm-user-tracker/:id', component: BcpAssociateTrackerComponent },
  { path: 'bcp-report/:id', component: BcpChartComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
