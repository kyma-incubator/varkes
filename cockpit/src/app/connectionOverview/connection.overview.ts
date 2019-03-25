import {
    Component,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    SimpleChanges
} from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import LuigiClient from '@kyma-project/luigi-client';

@Component({
    selector: 'connection-overview',
    templateUrl: './connection.overview.html'
})
export class ConnectionOverviewComponent implements OnChanges {
    title = 'varkes-ui-app';
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
    private luigiClient: LuigiClient;

    public constructor(private http: Http) {
        this.luigiClient = LuigiClient;
        this.modalClosed = new EventEmitter<null>();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.modalActive.currentValue === true) {
            this.openModal();
        }
    }

    private openModal() {
        this.insecureConnection = false;
        this.luigiClient.uxManager().addBackdrop();
        this.modalActive = true;
    }
    public onCloseModalClick() {
        this.modalClosed.emit();
        this.luigiClient.uxManager().removeBackdrop();
        this.modalActive = false;
    }

    public onConnect(url) {
        var sendData = {
            url: url,
            hostname: "localhost:4200",
            register: false
        };
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        this.http.post("/connection/?localKyma=" + this.insecureConnection, JSON.stringify(sendData), options)
            .subscribe(
                function success(data) {
                    this.connected = true;
                    this.onCloseModalClick();
                },
                function error(data) {
                    console.log(data)
                });

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
