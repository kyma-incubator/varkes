import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import * as ace from 'ace-builds';
import { ServiceInstancesService } from '../service-instances/service-instances.service';
import { linkManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'api-overview',
    templateUrl: './app.apioverview.html'
})
export class ApiOverviewComponent implements OnInit {
    @Input() api;
    @Input() remote;
    @Input() event;
    @Input() readonly;
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
                    this.alertMessage = JSON.parse(error._body).error
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
        var version;
        var regex = /^(.*)\.([v|V][0-9]+$)/;
        if (eventType.match(regex)) {
            var matchedGroups = regex.exec(eventType);
            version = matchedGroups[2];
            eventType = matchedGroups[1];
        }
        else {
            version = this.api.events.spec.info.version;
        }
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
                    this.alertMessage = JSON.parse(error._body).error
                    this.alert = true;
                    this.loading = false;
                });
    }
    public closeAlert() {
        this.alert = false;
    }
    public goBack() {
        if (linkManager().hasBack()) {
            let editor = ace.edit("specEditor");
            let spec = JSON.parse(editor.getValue());

            linkManager().goBack({ id: spec.id, name: spec.name, description: spec.description, type: spec.labels.type });
        }
        else {
            linkManager().fromClosestContext().navigate("/");
        }
    }
}
