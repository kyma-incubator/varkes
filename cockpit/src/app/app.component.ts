import { Component, Input, OnInit } from '@angular/core';
import { Http } from '@angular/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public info;
  public loadViews;
  public constructor(private http: Http) {
    let baseUrl;
    if (window["config"] && window["config"].domain) {
      baseUrl = window["config"].domain;
    }
    else {
      baseUrl = window.location.origin;
    }
    this.http.get(baseUrl + "/info")
      .subscribe(
        data => {
          window['info'] = JSON.parse(data["_body"]);
          this.loadViews = true;
        });
  }
}
