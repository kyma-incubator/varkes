import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ServiceInstancesService } from '../service-instances/service-instances.service';
import { linkManager } from '@kyma-project/luigi-client';
import { uxManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote: boolean;
    @Input() connected;
    public baseUrl;
    public loadInd
    public apis;
    public alert;
    public alertMessage;
    public info;
    public actionList = [];
    public refresherTimer;
    public isDataAvailable;
    public status;
    public inProgress: boolean;
    public statusModalActive: boolean;
    public batchStart: boolean;
    public initial: boolean;
    public constructor(private http: Http, private serviceInstance: ServiceInstancesService) {
        this.initial = true;
        this.status = {
            successCount: 0,
            failedCount: 0
        }
    }
    async ngOnChanges(changes: SimpleChanges) {
        this.apis = [];
        this.info = await this.serviceInstance.getInfo();
        this.baseUrl = this.serviceInstance.getBaseUrl();
        this.getApis(this.remote);
    }
    public ngOnInit() {

    }
    public onOpenActionList(index) {
        this.actionList[index] = true;
    }
    public onCloseActionList(index) {
        this.actionList[index] = false;
    }
    public deleteApi(api, i: number) {
        this.http.delete(this.baseUrl + this.info.links.remoteApis + "/" + api.id)
            .subscribe(
                success => {
                    this.actionList = [];
                    this.apis.splice(i, 1);
                    this.isDataAvailable = true;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
    public registerApi(api) {
        this.loadInd = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.baseUrl + this.info.links.localApis + "/" + api.id + "/register", {}, options)
            .subscribe(
                success => {
                    this.loadInd = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loadInd = false;
                });
    }
    public closeAlert() {
        this.alert = false;
    }
    public showApiDetails(apiId) {
        linkManager().navigate('/apiview/' + apiId + "/" + (this.remote == true));
    }

    public onStatusCloseModalClick() {
        uxManager().removeBackdrop();
        this.statusModalActive = false;
    }
    public showNewApi() {
        linkManager().navigate('/createapi/false');
    }
    public showNewEvent() {
        linkManager().navigate('/createapi/true');
    }
    public onRegisterAll() {
        this.batchStart = true;
        this.initial = false;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.baseUrl + this.info.links.registration, { baseUrl: this.baseUrl }, options)
            .subscribe(
                success => {
                    this.batchStart = false;
                    this.refresherTimer = window.setInterval(() => { this.pollStatus(); }, 2000);
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.batchStart = false;
                });
    }

    public pollStatus() {
        this.http.get(this.baseUrl + this.info.links.registration)
            .subscribe(
                success => {
                    this.status = JSON.parse(success["_body"]);
                    this.inProgress = this.status.inProgress;
                    if (!this.inProgress) {
                        window.clearInterval(this.refresherTimer);
                    }
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    window.clearInterval(this.refresherTimer);
                });
    }
    public openStatusModal() {
        uxManager().addBackdrop();
        this.statusModalActive = true;
    }
    public onLocalAPIClick() {
        this.remote = false;
        this.getApis(false);
    }
    public onRemoteAPIClick() {
        this.remote = true;
        this.getApis(true);
    }
    private getApis(remote: boolean) {
        this.isDataAvailable = false;
        this.http.get(this.baseUrl + (remote ? this.info.links.remoteApis : this.info.links.localApis))
            .subscribe(
                success => {
                    this.apis = JSON.parse(success["_body"]);
                    this.isDataAvailable = true;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
}
