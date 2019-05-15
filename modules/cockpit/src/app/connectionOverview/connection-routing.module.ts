import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApiTableComponent } from '../apitable/apitable';
const routes: Routes = [{ path: "apitable", component: ApiTableComponent }];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class ConnectionRoutingModule {

}
