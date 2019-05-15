import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ConnectionRoutingModule } from './connection-routing.module';
import { ConnectionOverviewComponent } from './connection.overview';
import { ApiTableComponent } from '../apitable/apitable';
@NgModule({
    declarations: [
        ConnectionOverviewComponent,
        ApiTableComponent
    ],
    imports: [
        BrowserModule,
        ConnectionRoutingModule
    ],
    exports: [ConnectionOverviewComponent, ApiTableComponent],
    providers: [],
    bootstrap: []
})
export class ConnectionOverviewModule { }
