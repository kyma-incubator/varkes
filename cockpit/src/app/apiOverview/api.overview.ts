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
    public loading: boolean;
    public info;
    public hostname;
    constructor(private http: Http) {
        this.info = window['info'];
        if (window["config"] && window["config"].domain) {
            this.hostname = window["config"].domain;
        }
        else {
            this.hostname = window.location.origin;
        }
    }
    public updateApi() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("specEditor");
        this.api.api = JSON.parse(editor.getValue());
        console.log(this.api.api);
        this.http.put(this.hostname + this.info.links.remoteApis + "/" + this.api.id, JSON.stringify(this.api), options)
            .subscribe(
                data => {
                    console.log(data);
                    this.loading = false;
                },
                function error(data) {
                    window.alert(data);
                    this.loading = false;
                });
    }
    public sendEvent() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("specEditor");
        this.api.api = JSON.parse(editor.getValue());
        console.log(this.api.api);
        this.http.post(this.hostname + this.info.links.events + "/" + this.api.id, JSON.stringify(this.api), options)
            .subscribe(
                data => {
                    console.log(data);
                    this.loading = false;
                },
                function error(data) {
                    window.alert(data);
                    this.loading = false;
                });
    }
}
