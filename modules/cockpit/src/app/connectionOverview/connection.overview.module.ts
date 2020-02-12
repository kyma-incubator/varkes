import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ConnectionRoutingModule } from './connection-routing.module';
import { ConnectionOverviewComponent } from './connection.overview';
import { ApiTableModule } from '../apitable/apitable.module';
@NgModule({
    declarations: [
        ConnectionOverviewComponent
    ],
    imports: [
        BrowserModule,
        ConnectionRoutingModule,
        ApiTableModule
    ],
    exports: [ConnectionOverviewComponent],
    providers: [],
    bootstrap: []
})
export class ConnectionOverviewModule { }
