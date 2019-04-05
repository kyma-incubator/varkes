import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { removeListener } from 'cluster';
@Component({
    selector: 'api-view',
    templateUrl: './app.apiview.html'
})
export class ApiViewComponent implements OnInit {
    public remote;
    public apiId;
    public api;
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
            this.remote = params.remote;
            this.http.get(this.hostname + this.info.url.remoteApis + "/" + this.apiId)
                .subscribe(
                    data => {
                        this.api = JSON.parse(data["_body"]);
                        this.loadView = true;
                    });
        });
    }

}
