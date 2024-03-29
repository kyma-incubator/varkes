import { Component, Input, OnInit } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { uxManager, linkManager } from "@luigi-project/client";
import { ServiceInstancesService } from "../service-instances/service-instances.service";

@Component({
  selector: "connection-overview",
  templateUrl: "./connection.overview.html",
})
export class ConnectionOverviewComponent implements OnInit {
  public apis;
  public baseUrl;
  public info;
  public connection;
  public alert;
  public alertMessage;
  public success;
  public successMessage;
  public keyUrl;
  public searchInd;
  public certUrl;
  public loadInd;
  public status;
  @Input() public connectionModalActive: boolean;
  public statusModalActive: boolean;
  public connected: boolean;
  public loading: boolean = false;
  @Input() public insecureConnection: boolean;
  public remote;
  public consoleUrl;
  public constructor(
    private http: Http,
    private serviceInstance: ServiceInstancesService
  ) { }

  async ngOnInit() {
    this.baseUrl = this.serviceInstance.getBaseUrl();
    this.info = await this.serviceInstance.getInfo();
    this.http.get(this.baseUrl + this.info.links.connection).subscribe(
      (success) => {
        this.connection = JSON.parse(success["_body"]);
        this.connected = true;
      },
      (error) => {
        this.connected = false;
      }
    );
  }
  public openModal() {
    this.insecureConnection = false;
    uxManager().addBackdrop();
    this.connectionModalActive = true;
  }
  public onConnectionCloseModalClick() {
    uxManager().removeBackdrop();
    this.connectionModalActive = false;
  }
  public onStatusCloseModalClick() {
    uxManager().removeBackdrop();
    this.statusModalActive = false;
  }
  public onConnect(token) {
    this.loading = true;
    this.onConnectionCloseModalClick();
    var sendData = {
      token: token,
      baseUrl: this.baseUrl,
      insecure: this.insecureConnection,
    };
    let headers = new Headers({ "Content-Type": "application/json" });
    let options = new RequestOptions({ headers: headers });
    this.http
      .post(
        this.baseUrl + this.info.links.connection,
        JSON.stringify(sendData),
        options
      )
      .subscribe(
        (success) => {
          this.connected = true;
          this.loading = false;
          this.connection = JSON.parse(success["_body"]);
          this.insecureConnection = this.connection.insecure;
        },
        (error) => {
          this.connected = false;
          this.loading = false;
          this.alertMessage = JSON.parse(error._body).error;
          this.alert = true;
        }
      );
  }
  public onDisconnect() {
    this.http.delete(this.baseUrl + this.info.links.connection).subscribe(
      (success) => {
        this.connected = false;
      },
      (error) => {
        this.alertMessage = JSON.parse(error._body).error;
        this.alert = true;
      }
    );
  }

  public onInsecureConnection(target) {
    this.insecureConnection = target;
  }
  public downloadKey() {
    window.location.href = this.baseUrl + this.info.links.connection + "/key";
  }
  public downloadCert() {
    window.location.href = this.baseUrl + this.info.links.connection + "/cert";
  }
  public renewCert() {
    this.http.post(this.baseUrl + this.info.links.connection + "/renew", "").subscribe(
      (success) => {
        this.successMessage = "Certificate renewed";
        this.success = true;
      },
      (error) => {
        this.alertMessage = JSON.parse(error._body).error;
        this.alert = true;
      }
    );
  }
  public closeAlert() {
    this.alert = false;
  }
  public closeSuccess() {
    this.success = false;
}
}
