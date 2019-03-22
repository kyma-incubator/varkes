import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ApiTableComponent } from './apitable';
@NgModule({
    declarations: [
        ApiTableComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [ApiTableComponent],
    providers: [],
    bootstrap: []
})
export class ApiTableModule { }
