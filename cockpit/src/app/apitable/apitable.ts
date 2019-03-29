import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { PopoverModule } from 'fundamental-ngx';
import { Http } from '@angular/http';
import { hostname } from 'os';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent implements OnInit, OnChanges {

    @Input() remote;
    @Input() hostname;
    public apis;
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

    }
    public ngOnInit() {
        this.http.get(this.hostname + "/mock/apis")
            .subscribe(
                data => {
                    this.apis = JSON.parse(data["_body"]);
                    this.isDataAvailable = true;
                });
    }
    public onOpenActionList(index) {
        this.actionList[index] = true;
    }
    public onCloseActionList(index) {
        this.actionList[index] = false;
    }
}
