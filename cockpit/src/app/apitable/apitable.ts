import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http } from '@angular/http';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote;
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
        this.http.get(this.hostname + (this.remote ? this.info.url.remoteApis : this.info.url.localApis))
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

}
