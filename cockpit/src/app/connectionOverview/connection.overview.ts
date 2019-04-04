import {
    Component,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    OnInit
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { uxManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'connection-overview',
    templateUrl: './connection.overview.html'
})
export class ConnectionOverviewComponent implements OnChanges, OnInit {
    public apis;
    public hostname;
    public info;
    public url;
    public connection;
    @Input() public modalActive: boolean;
    @Output() private modalClosed: EventEmitter<null>;
    public connected: boolean;
    @Input() public insecureConnection: boolean;
    public remote;
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
        this.connection = this.info.connection;
    }
    public ngOnChanges(changes: SimpleChanges): void {

    }

    public openModal() {
        this.insecureConnection = false;
        uxManager().addBackdrop();
        this.modalActive = true;
    }
    public onCloseModalClick() {
        uxManager().removeBackdrop();
        this.modalActive = false;
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
        this.http.post(this.hostname + this.info.url.connection, JSON.stringify(sendData), options)
            .subscribe(
                data => {
                    this.connected = true;
                    this.connection = JSON.parse(data["_body"]);
                    this.onCloseModalClick();
                },
                function error(data) {
                    window.alert(data);
                });
    }
    public onDisconnect() {
        this.http.delete(this.hostname + this.info.url.connection)
            .subscribe(
                data => {
                    this.connected = false;
                },
                function error(data) {
                    window.alert(data);
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
        this.http.post(this.hostname + this.info.url.registeration.batch, { hostname: this.hostname }, options)
            .subscribe(
                data => {

                },
                function error(data) {
                    window.alert(data);
                });
    }
}
