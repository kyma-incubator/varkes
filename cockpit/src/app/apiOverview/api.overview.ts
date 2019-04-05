import { Component, Input } from '@angular/core';
@Component({
    selector: 'api-overview',
    templateUrl: './app.apioverview.html'
})
export class ApiOverviewComponent {
    @Input() api;
    @Input() remote;
}
