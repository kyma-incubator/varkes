import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as ace from 'ace-builds';
import { read } from 'fs';

@Component({
    selector: 'spec-view',
    templateUrl: './app.specview.html'
})
export class SpecViewComponent implements OnInit {

    @Input() text;
    @Input() readonly: boolean;
    @Input() api;
    @Input() remote;
    @Input() event;
    options: any = { maxLines: 1000, printMargin: false };

    ngOnInit() {

    }

    public alert;
    public alertMessage;
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
        this.http.put(this.hostname + this.info.links.remoteApis + "/" + this.api.id, JSON.stringify(this.api), options)
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
