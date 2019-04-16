import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote;
    @Input() connected;
    public baseUrl;
    public loadInd
    public apis;
    public alert;
    public alertMessage;
    public info;
    public actionList = [];
    public isDataAvailable;
    public constructor(private http: Http) {
        if (window["config"] && window["config"].domain) {
            this.baseUrl = window["config"].domain;
        }
        else {
            this.baseUrl = window.location.origin;
        }

    }
    ngOnChanges(changes: SimpleChanges): void {
        this.apis = [];
        this.info = window['info'];

        this.http.get(this.baseUrl + (this.remote ? this.info.links.remoteApis : this.info.links.localApis))
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
}
