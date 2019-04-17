import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionOverviewComponent } from './connectionOverview/connection.overview';
import { ApiTableComponent } from './apitable/apitable';
import { ApiViewComponent } from './apiView/api.view';
import { CreateApiViewComponent } from './createApi/create.api.view';
const routes: Routes = [{
  path: "", component: ConnectionOverviewComponent,
  children: [
    {
      path: 'apitable',
      component: ApiTableComponent
    }]
}, {
  path: "apiview/:id/:remote", component: ApiViewComponent
}, {
  path: "apiview/:id", component: ApiViewComponent
},
{
  path: "createapi/:event", component: CreateApiViewComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
