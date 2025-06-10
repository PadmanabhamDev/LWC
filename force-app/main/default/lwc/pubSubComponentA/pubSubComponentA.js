import { LightningElement } from 'lwc';
import pubSub from 'c/pubSub';
export default class PubSubComponentA extends LightningElement {

    message
    message1;
    inputHandler(event) {
        this.message = event.target.value;
    }

    publishHandler() {
        pubSub.publish('componentA', this.message);
    }

    connectedCallback() {
        this.callSubscriber();
    }

    callSubscriber() {
        pubSub.subscribe("componentB", (message1) => {
            this.message1 = message1
        })
    }
}