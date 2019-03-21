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
    selector: 'apitable-view',
    templateUrl: './app.apitable.html'
})
export class BasicComponent implements OnChanges {
    title = 'varkes-ui-app';
    @Input() public modalActive: boolean;
    @Output() private modalClosed: EventEmitter<null>;
    private luigiClient: LuigiClient;

    public constructor() {
        this.luigiClient = LuigiClient;
        this.modalClosed = new EventEmitter<null>();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.modalActive.currentValue === true) {
            this.openModal();
        }
    }

    private openModal() {
        this.luigiClient.uxManager().addBackdrop();
        this.modalActive = true;
    }
    public onCloseModalClick() {
        this.modalClosed.emit();
        this.luigiClient.uxManager().removeBackdrop();
        this.modalActive = false;
    }
}
