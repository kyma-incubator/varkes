import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiTableComponent } from './apitable/apitable';
import { ConnectionOverviewComponent } from './connectionOverview/connection.overview';
import { ApiViewComponent } from './apiView/api.view';
import { ApiOverviewComponent } from './apiOverview/api.overview';
import { HttpModule } from '@angular/http';
import { SpecViewComponent } from './specView/spec.view';
@NgModule({
  declarations: [
    AppComponent,
    ConnectionOverviewComponent,
    ApiTableComponent,
    ApiViewComponent,
    ApiOverviewComponent,
    SpecViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgJsonEditorModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
