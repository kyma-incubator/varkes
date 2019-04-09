import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'spec-view',
    templateUrl: './app.specview.html'
})
export class SpecViewComponent implements OnInit {

    @Input() text;
    options: any = { maxLines: 1000, printMargin: false };

    ngOnInit() {

    }
}
