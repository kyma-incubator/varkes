import { Component } from '@angular/core';
@Component({
    selector: 'api-overview',
    templateUrl: './app.apioverview.html'
})
export class ApiOverviewComponent {
    api = {
        name: "provider",
        type: "OData",
        description: "Odata Mock",
        status: "Registered"
    }
}
