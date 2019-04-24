import { Component, Input, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { read } from 'fs';
import * as ace from 'ace-builds';

@Component({
    selector: 'send-event-view',
    templateUrl: './app.send.eventview.html'
})
export class SendEventViewComponent implements OnInit {

    @Input() event;
    @Input() remote;
    public topics;
    public topic;
    public showTopics;
    public loading: boolean;
    public hostname;
    public info;
    public alert;
    public alertMessage;
    public ariaExpanded = false;
    public ariaHidden = true;
    private filteredTopics = [];
    public topicName;
    public filteredTopicsNames = [];
    options: any = { maxLines: 1000, printMargin: false };

    constructor(private http: Http) {
        this.info = window['info'];
        if (window["config"] && window["config"].domain) {
            this.hostname = window["config"].domain;
        }
        else {
            this.hostname = window.location.origin;
        }
    }

    ngOnInit() {
        this.event = JSON.parse(this.event);
        this.topics = Object.keys(this.event.events.spec.topics);
        this.filteredTopicsNames = this.topics;
    }

    public fillEditor(topic) {
        this.topic = JSON.stringify(this.event.events.spec.topics[topic].example, null, '\t');
        this.showTopics = false;
        document.getElementById("selectedTopic").innerHTML = topic;
    }
    public onOpenDropDown() {
        this.showTopics = true;
    }
    public onCloseDropDown() {
        this.showTopics = false;
    }
    
    public sendEvent() {
        this.loading = true;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        var editor = ace.edit("eventTopicEditor");
        let eventTime = new Date().toISOString();
        let eventType = document.getElementById("selectedTopic").innerHTML;
        var version = eventType.substring(eventType.lastIndexOf(".") + 1)
        let eventData = {
            "event-type": eventType,
            "event-type-version": version, //event types normally end with .v1
            "event-time": eventTime,
            "data": editor.getValue()
        }
        this.http.post(this.hostname + this.info.links.events, eventData, options)
            .subscribe(
                success => {
                    this.loading = false;
                },
                error => {
                    this.alertMessage = error;
                    this.alert = true;
                    this.loading = false;
                });
    }

    public closeAlert() {
        this.alert = false;
    }

    public toggleDropDown() {
        this.ariaExpanded = !this.ariaExpanded;
        this.ariaHidden = !this.ariaHidden;
    }

    public openDropDown(event: Event) {
        event.stopPropagation();
        this.ariaExpanded = true;
        this.ariaHidden = false;
    }

    public closeDropDown() {
        this.ariaExpanded = false;
        this.ariaHidden = true;
    }

    public selectedTopic(topic) {
        this.topicName = topic.label;
    }
    filterTopicsNames() {
        this.filteredTopicsNames = [];
        this.topics.forEach(element => {
          if (element.includes(this.topicName.toLowerCase())) {
            this.filteredTopicsNames.push(element);
          }
        });
    }
}
