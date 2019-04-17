import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { uxManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'connection-overview',
    templateUrl: './connection.overview.html'
})
export class ConnectionOverviewComponent implements OnInit {

    public hostname;
    public info;
    public url;
    public connection;
    public alert;
    public alertMessage;
    public keyUrl;
    public searchInd;
    public certUrl;
    public loadInd;
    public status;
    @Input() public connectionModalActive: boolean;
    public statusModalActive: boolean;
    public connected: boolean;
    @Input() public insecureConnection: boolean;
    public remote;
    public consoleUrl;
    public constructor(private http: Http) {
        if (window["config"] && window["config"].domain) {
            this.hostname = window["config"].domain;
        }
        else {
            this.hostname = window.location.origin;
        }
    }

    ngOnInit() {
        this.info = window['info'];
        this.connected = this.info.connected;
        this.insecureConnection = this.info.insecure;
        console.log("connected " + this.connected)
        if (this.connected) {
            this.connection = this.info.connection;
            this.consoleUrl = this.connection.consoleUrl.match(/https:\/\/[a-zA-z0-9.]+\//)[0];
        }
    }
    public openModal() {
        this.insecureConnection = false;
        uxManager().addBackdrop();
        this.connectionModalActive = true;
    }
    public onConnectionCloseModalClick() {
        uxManager().removeBackdrop();
        this.connectionModalActive = false;
    }
    public onStatusCloseModalClick() {
        uxManager().removeBackdrop();
        this.statusModalActive = false;
    }
    public onConnect(url) {
        var sendData = {
            url: url,
            hostname: this.hostname,
            insecure: this.insecureConnection
        };
        console.log(url);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.hostname + this.info.links.connection, JSON.stringify(sendData), options)
            .subscribe(
                success => {
                    this.connected = true;
                    this.connection = JSON.parse(success["_body"]);
                    this.onConnectionCloseModalClick();
                    window['info'].connection = this.connection;
                    window['info'].connected = true;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
    public onDisconnect() {
        this.http.delete(this.hostname + this.info.links.connection)
            .subscribe(
                success => {
                    this.connected = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });

    }
    public onLocalAPIClick() {
        this.remote = false;
    }
    public onRemoteAPIClick() {
        this.remote = true;
    }
    public oninsecureConnection(target) {
        this.insecureConnection = target;
    }
    public onBatchRegisteration() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.hostname + this.info.links.registration, { hostname: this.hostname }, options)
            .subscribe(
                success => {
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
    public getStatus() {
        this.loadInd = true;
        this.http.get(this.hostname + this.info.links.registration)
            .subscribe(
                success => {
                    this.loadInd = false;
                    this.status = JSON.parse(success["_body"]);
                    console.log("status " + this.status.errorMessage);
                    uxManager().addBackdrop();
                    this.statusModalActive = true;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loadInd = false;
                });
    }
    public downloadKey() {
        window.location.href = this.hostname + this.info.links.key;
    }
    public downloadCert() {
        window.location.href = this.hostname + this.info.links.cert;
    }
    public closeAlert() {
        this.alert = false;
    }
}
