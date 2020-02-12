import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiViewComponent } from './apiView/api.view';
import { ApiOverviewComponent } from './apiOverview/api.overview';
import { HttpModule } from '@angular/http';
import { SpecViewComponent } from './specView/spec.view';
import { AceEditorModule } from 'ng2-ace-editor';
import { ClickOutsideModule } from 'ng-click-outside';
import { SendEventViewComponent } from './sendEventView/send.eventview';
import { CreateApiViewComponent } from './createApi/create.api.view';
import { ServiceInstancesService } from './service-instances/service-instances.service';
import { FormsModule } from '@angular/forms';
import { ApiTableModule } from './apitable/apitable.module';
import { ConnectionOverviewModule } from './connectionOverview/connection.overview.module';

@NgModule({
  declarations: [
    AppComponent,
    ApiViewComponent,
    ApiOverviewComponent,
    SpecViewComponent,
    SendEventViewComponent,
    CreateApiViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AceEditorModule,
    ApiTableModule,
    ConnectionOverviewModule,
    HttpModule,
    ClickOutsideModule,
    FormsModule
  ],
  providers: [ServiceInstancesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
