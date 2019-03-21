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
    selector: 'api-view',
    templateUrl: './app.apiview.html'
})
export class AppViewComponent {
    API_name;
    API_description;
    API_status;
    API_type;
    public constructor(API_name, API_description, API_status, API_type) {
        this.API_name = API_name;
        this.API_type = API_type;
        this.API_description = API_description;
        this.API_status = API_status;
    }
}
