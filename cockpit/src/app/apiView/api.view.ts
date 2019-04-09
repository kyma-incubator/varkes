import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
@Component({
    selector: 'api-view',
    templateUrl: './app.apiview.html'
})
export class ApiViewComponent implements OnInit {
    public remote;
    public apiId;
    public api;
    public spec;
    public loadView;
    public info;
    public hostname;
    constructor(private http: Http, private route: ActivatedRoute) {
        if (window["config"] && window["config"].domain) {
            this.hostname = window["config"].domain;
        }
        else {
            this.hostname = window.location.origin;
        }
        this.info = window["info"]
    }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            this.apiId = params.id;
            console.log(params.remote)
            this.remote = params.remote == "true";
            console.log(params.remote);
            if (this.remote) {
                this.http.get(this.hostname + this.info.url.remoteApis + "/" + this.apiId)
                    .subscribe(
                        data => {
                            this.api = JSON.parse(data["_body"]);
                            this.spec = JSON.stringify(this.api.api, null, '\t');
                            this.loadView = true;
                        });
            }
            else {
                this.http.get(this.hostname + this.info.url.localApis + "/" + this.apiId)
                    .subscribe(
                        data => {
                            this.api = JSON.parse(data["_body"]);
                            this.spec = JSON.stringify(this.api.api, null, '\t');
                            this.loadView = true;
                        });
            }

        });
    }

}
