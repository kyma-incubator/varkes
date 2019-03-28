import {
    Component,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    SimpleChanges,
    Injectable,
    Inject
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { uxManager } from '@kyma-project/luigi-client';
@Component({
    selector: 'connection-overview',
    templateUrl: './connection.overview.html'
})
export class ConnectionOverviewComponent implements OnChanges {
    public apis;
    public hostname;
    public connection = {
        application: {
            name: "varkes",
            url: "varkes-url"
        }
    };
    @Input() public modalActive: boolean;
    @Output() private modalClosed: EventEmitter<null>;
    public connected: boolean;
    @Input() public insecureConnection: boolean;
    public remote;

    public constructor(private http: Http) {
        this.hostname = window.location.origin;
    }

    public ngOnChanges(changes: SimpleChanges): void {

    }

    private openModal() {
        this.insecureConnection = false;
        uxManager().addBackdrop();
        this.modalActive = true;
    }
    public onCloseModalClick() {
        uxManager().removeBackdrop();
        this.modalActive = false;
    }

    public onConnect(url) {
        this.connected = true;
        this.onCloseModalClick();
    }
    public onDisconnect() {
        this.connected = false;
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
}
