import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { uxManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote;
    @Input() connected;
    public hostname;
    public loadInd
    public apis;
    public alert;
    public alertMessage;
    public info;
    public actionList = [];
    public isDataAvailable;
    public status;
    public searchInd;
    public statusModalActive: boolean;
    public constructor(private http: Http) {
        if (window["config"] && window["config"].domain) {
            this.hostname = window["config"].domain;
        }
        else {
            this.hostname = window.location.origin;
        }

    }
    ngOnChanges(changes: SimpleChanges): void {
        this.apis = [];
        this.info = window['info'];
        
        this.http.get(this.hostname + (this.remote ? this.info.links.remoteApis : this.info.links.localApis))
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
    public ngOnInit() {

    }
    public onOpenActionList(index) {
        this.actionList[index] = true;
    }
    public onCloseActionList(index) {
        this.actionList[index] = false;
    }
    public deleteApi(api, i: number) {
        this.http.delete(this.hostname + this.info.links.remoteApis + "/" + api.id)
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
        this.http.post(this.hostname + this.info.links.localApis + "/" + api.id + "/register", {}, options)
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


    public onStatusCloseModalClick() {
        uxManager().removeBackdrop();
        this.statusModalActive = false;
    }
    public onBatchRegisteration() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.hostname + this.info.links.registration, { hostname: this.hostname }, options)
            .subscribe(
                success => {
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }

    public getStatus() {
        this.loadInd = true;
        this.http.get(this.hostname + this.info.links.registration)
            .subscribe(
                success => {
                    this.loadInd = false;
                    this.status = JSON.parse(success["_body"]);
                    console.log("status " + this.status.errorMessage);
                    uxManager().addBackdrop();
                    this.statusModalActive = true;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loadInd = false;
                });
    }

    public searchApis() {
        this.apis = this.apis.find(x => x.name == document.getElementById("search-1").innerHTML);
        this.remote = true;
    }

    public openSearch() {
        this.searchInd = true;
    }

    public closeSearch() {
        this.searchInd = false;
    }

    public onLocalAPIClick() {
        this.remote = false;
    }
    public onRemoteAPIClick() {
        this.remote = true;
    }
}
