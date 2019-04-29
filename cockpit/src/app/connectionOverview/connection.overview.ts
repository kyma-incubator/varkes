import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { uxManager, linkManager } from '@kyma-project/luigi-client';
import { ServiceInstancesService } from '../service-instances/service-instances.service';
@Component({
    selector: 'connection-overview',
    templateUrl: './connection.overview.html'
})
export class ConnectionOverviewComponent implements OnInit {

    public apis;
    public baseUrl;
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
    public constructor(private http: Http, private serviceInstance: ServiceInstancesService) {

    }

    async ngOnInit() {
        this.baseUrl = this.serviceInstance.getBaseUrl();
        this.info = await this.serviceInstance.getInfo();
        this.http.get(this.baseUrl + this.info.links.connection)
            .subscribe(
                success => {
                    this.connection = JSON.parse(success["_body"]);
                    this.consoleUrl = this.connection.consoleUrl.match(/https:\/\/[A-z0-9.]+\//);
                    this.connected = true;
                },
                error => {
                    this.connected = false;
                });
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
            baseUrl: this.baseUrl,
            insecure: this.insecureConnection
        };
        console.log(url);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.baseUrl + this.info.links.connection, JSON.stringify(sendData), options)
            .subscribe(
                success => {
                    this.connected = true;
                    this.connection = JSON.parse(success["_body"]);
                    this.insecureConnection = this.connection.insecure;
                    this.consoleUrl = this.connection.consoleUrl.match(/https:\/\/[A-z0-9.]+\//);
                    this.onConnectionCloseModalClick();
                    window['info'].connection = this.connection;
                    window['info'].connected = true;
                },
                error => {
                    this.connected = false;
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
    public onDisconnect() {
        this.http.delete(this.baseUrl + this.info.links.connection)
            .subscribe(
                success => {
                    this.connected = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });

    }

    public oninsecureConnection(target) {
        this.insecureConnection = target;
    }
    public onBatchRegisteration() {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post(this.baseUrl + this.info.links.registration, { baseUrl: this.baseUrl }, options)
            .subscribe(
                success => {
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                });
    }
    public downloadKey() {
        window.location.href = this.baseUrl + this.info.links.connection + this.connection.key;
    }
    public downloadCert() {
        window.location.href = this.baseUrl + this.info.links.connection + this.connection.cert;
    }
    public closeAlert() {
        this.alert = false;
    }
}
