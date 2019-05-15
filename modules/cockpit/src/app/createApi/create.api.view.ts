import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import * as ace from 'ace-builds';
import { ServiceInstancesService } from '../service-instances/service-instances.service';
import { linkManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'create-api-view',
    templateUrl: './app.createapiview.html'
})
export class CreateApiViewComponent implements OnInit {

    public event: boolean;
    public text;
    public info;
    public baseUrl;
    public loadInd;
    options: any = { maxLines: 1000, printMargin: false };
    public constructor(private http: Http, private route: ActivatedRoute, private serviceInstance: ServiceInstancesService) {
    }
    async ngOnInit() {
        this.info = await this.serviceInstance.getInfo();
        this.baseUrl = this.serviceInstance.getBaseUrl();
        this.route.params.subscribe(params => {
            this.event = params.event == "true";
            if (this.event) {
                this.text = JSON.stringify(this.createEventExample(), null, "\t");
            }
            else {
                this.text = JSON.stringify(this.createAPIExample(), null, "\t");
            }
        });
    }
    public createApi() {
        this.loadInd = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("apiEditor");
        this.http.post(this.baseUrl + this.info.links.remoteApis, editor.getValue(), options)
            .subscribe(
                data => {
                    this.loadInd = false;
                },
                function error(data) {
                    window.alert(data);
                    this.loadInd = false;
                });
    }
    public goBack() {
        linkManager().navigate('/');
    }
    private createEventExample() {
        return {
            "provider": "Varkes",
            "name": "test-event",
            "description": "testing... 1.2.3.",
            "labels": {
                "type": "AsyncApi"
            },
            "events": {
                "spec": {
                    "asyncapi": "1.0.0",
                    "info": {
                        "title": "events",
                        "version": "v1",
                        "description": "Events v1"
                    },
                    "topics": {}
                }
            },
            "documentation": {
                "displayName": "string",
                "description": "string",
                "type": "string",
                "tags": [
                    "string"
                ],
                "docs": [
                    {
                        "title": "string",
                        "type": "string",
                        "source": "string"
                    }
                ]
            }
        };
    }
    private createAPIExample() {
        return {
            "provider": "Varkes",
            "name": "test-api",
            "description": "testing... 1.2.3.",
            "labels": {
                "type": "OpenApi"
            },
            "api": {
                "targetUrl": "http://localhost/target",
                "credentials": {
                    "oauth": {
                        "url": "http://localhost/oauth/validate",
                        "clientId": "string",
                        "clientSecret": "string"
                    }
                },
                "spec": {}
            },
            "documentation": {
                "displayName": "string",
                "description": "string",
                "type": "string",
                "tags": [
                    "string"
                ],
                "docs": [
                    {
                        "title": "string",
                        "type": "string",
                        "source": "string"
                    }
                ]
            }
        };
    }
}
