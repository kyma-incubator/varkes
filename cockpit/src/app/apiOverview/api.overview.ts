import { Component, Input } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as ace from 'ace-builds';
@Component({
    selector: 'api-overview',
    templateUrl: './app.apioverview.html'
})
export class ApiOverviewComponent {
    @Input() api;
    @Input() remote;
    @Input() event;
    @Input() readonly;
    public alert;
    public alertMessage;
    public loading: boolean;
    public info;
    public baseUrl;
    constructor(private http: Http) {
        this.info = window['info'];
        if (window["config"] && window["config"].domain) {
            this.baseUrl = window["config"].domain;
        }
        else {
            this.baseUrl = window.location.origin;
        }
    }
    public updateApi() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("specEditor");
        this.api.api = JSON.parse(editor.getValue());
        this.http.put(this.baseUrl + this.info.links.remoteApis + "/" + this.api.id, JSON.stringify(this.api), options)
            .subscribe(
                success => {
                    this.loading = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loading = false;
                });
    }
    public sendEvent() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("eventTopicEditor");
        let eventTime = new Date().toISOString();
        let eventType = document.getElementById("selectedTopic").innerHTML;
        var version = eventType.substring(eventType.lastIndexOf(".") + 1)
        let eventData = {
            "event-type": eventType,
            "event-type-version": version, //event types normally end with .v1
            "event-time": eventTime,
            "data": editor.getValue()
        }
        this.http.post(this.baseUrl + this.info.links.events, eventData, options)
            .subscribe(
                success => {
                    this.loading = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loading = false;
                });
    }
    public closeAlert() {
        this.alert = false;
    }
}
