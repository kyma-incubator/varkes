import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiTableComponent } from './apitable/apitable';
import { ConnectionOverviewComponent } from './connectionOverview/connection.overview';
import { HttpModule } from '@angular/http';
@NgModule({
  declarations: [
    AppComponent,
    ConnectionOverviewComponent,
    ApiTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
