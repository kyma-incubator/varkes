import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApiOverviewComponent } from './apiOverview/api.overview';
import { ConnectionOverviewComponent } from './connectionOverview/connection.overview';
import { ApiTableComponent } from './apitable/apitable';
const routes: Routes = [{
  path: "", component: ConnectionOverviewComponent,
  children: [
    {
      path: 'apitable',
      component: ApiTableComponent
    }]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
