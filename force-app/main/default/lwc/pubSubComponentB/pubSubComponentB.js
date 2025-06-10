import { LightningElement } from 'lwc';
import pubSub from 'c/pubSub';
export default class PubSubComponentB extends LightningElement {

    message;
    connectedCallback(){
        this.callSubscriber();
    }

    callSubscriber(){
        pubSub.subscribe("componentA",(message)=>{
            this.message = message
        })
    }
    message1
    inputHandlerB(event){
        this.message1 = event.target.value;
    }
     
    handleChange(){
        pubSub.publish('componentB',this.message1);
    }
}