import { Component, Input, ViewChild } from '@angular/core';
@Component({
    selector: 'spec-view',
    template: '<json-editor [options]="editorOptions" [spec]="spec"></json-editor>'
})
export class SpecViewComponent {
    @Input() spec: any;

}
