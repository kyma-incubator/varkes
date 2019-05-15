import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
@Injectable()
export class ServiceInstancesService {
    private baseUrl;
    private info;
    constructor(private http: Http) {

    }
    public getBaseUrl() {
        return this.baseUrl;
    }
    public initialize(config) {

        if (config && config.domain) {
            this.baseUrl = config.domain;
        }
        else {
            this.baseUrl = window.location.origin;
        }
        return this.getInfo();
    }
    public getInfo() {
        return new Promise((resolve, reject) => {
            if (!this.info) {
                this.http.get(this.baseUrl + "/info")
                    .subscribe(
                        data => {
                            this.info = JSON.parse(data["_body"]);
                            resolve(this.info);
                        },
                        error => {
                            reject(error);
                        });
            }
            else {
                resolve(this.info);
            }
        });
    }
}