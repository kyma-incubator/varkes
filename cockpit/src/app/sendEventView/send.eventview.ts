import { Component, Input, OnInit } from '@angular/core';
import { read } from 'fs';

@Component({
    selector: 'send-event-view',
    templateUrl: './app.send.eventview.html'
})
export class SendEventViewComponent implements OnInit {

    @Input() event;
    public topics;
    public topic;
    public showTopics;
    options: any = { maxLines: 1000, printMargin: false };

    ngOnInit() {
        this.event = JSON.parse(this.event);
        this.topics = Object.keys(this.event.events.spec.topics);
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
}
