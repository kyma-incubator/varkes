import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote;
    @Input() connected;
    public hostname;
    public apis;
    public info;
    public actionList = [];
    public isDataAvailable;
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
                data => {
                    this.apis = JSON.parse(data["_body"]);
                    this.isDataAvailable = true;
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
    deleteApi(api) {
        this.http.delete(this.hostname + this.info.links.remoteApis + "/" + api.id)
            .subscribe(
                data => {
                    this.actionList = [];
                    this.isDataAvailable = true;
                });
    }
}
