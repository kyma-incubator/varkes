import {
    Component,
    OnChanges,
    Input,
    Output,
    EventEmitter,
    SimpleChanges
} from '@angular/core';
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

    public constructor() {
        this.luigiClient = LuigiClient;
        this.modalClosed = new EventEmitter<null>();
        console.log('test');
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

    public onConnect() {
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
