import { Component, Input, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ServiceInstancesService } from './service-instances/service-instances.service';
import {
  addInitListener,
  addContextUpdateListener,
  getEventData
} from '@kyma-project/luigi-client';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public info;
  public loadViews;
  public constructor(private serviceInstance: ServiceInstancesService) {

    addInitListener(context => this.serviceInstance.initialize(context.config).then((result) => {
      const eventData = getEventData();
      this.serviceInstance.setToken(eventData.idToken);
      this.loadViews = true;
    }).catch((err) => {
      console.error(err);
    }));
  }
}
