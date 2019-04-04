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
    let hostname;
    if (window["config"] && window["config"].domain) {
      hostname = window["config"].domain;
    }
    else {
      hostname = window.location.origin;
    }
    this.http.get(hostname + "/info")
      .subscribe(
        data => {
          window['info'] = JSON.parse(data["_body"]);
          this.loadViews = true;
        });
  }
}
