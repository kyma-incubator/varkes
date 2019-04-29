import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as ace from 'ace-builds';
import { ServiceInstancesService } from '../service-instances/service-instances.service';
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
    public alert;
    public alertMessage;
    public loading: boolean;
    public info;
    public baseUrl;
    constructor(private http: Http, private serviceInstance: ServiceInstancesService) {
    }
    public async ngOnInit() {
        this.info = await this.serviceInstance.getInfo();
        this.baseUrl = this.serviceInstance.getBaseUrl();
    }
    public updateApi() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("specEditor");
        this.http.put(this.baseUrl + this.info.links.remoteApis + "/" + this.api.id, editor.getValue(), options)
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
