import { Component, Input } from '@angular/core';
import { PopoverModule } from 'fundamental-ngx';
@Component({
    selector: 'api-table',
    templateUrl: './app.apitable.html'
})
export class ApiTableComponent {
    title = 'varkes-ui-app';
    @Input() remote;
    public actionList = [];
    public onOpenActionList(index) {
        this.actionList[index] = true;
    }
    public onCloseActionList(index) {
        this.actionList[index] = false;
    }
}
