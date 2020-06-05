import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { ConnectionRoutingModule } from "./connection-routing.module";
import { ConnectionOverviewComponent } from "./connection.overview";
import { ApiTableModule } from "../apitable/apitable.module";
import { LoadingSpinnerModule } from "fundamental-ngx";

@NgModule({
  declarations: [ConnectionOverviewComponent],
  imports: [
    BrowserModule,
    ConnectionRoutingModule,
    ApiTableModule,
    LoadingSpinnerModule,
  ],
  exports: [ConnectionOverviewComponent],
  providers: [],
  bootstrap: [],
})
export class ConnectionOverviewModule {}
