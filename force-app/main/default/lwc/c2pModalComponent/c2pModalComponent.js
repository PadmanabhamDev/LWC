import { LightningElement } from 'lwc';

export default class C2pModalComponent extends LightningElement {

    /** 
    closeHandler(){
        const myEvent = new CustomEvent('close',{
            detail:"Modal Succesfully Closed"
        });
        this.dispatchEvent(myEvent);
    }*/

    closeHandler(){
        const myEvent = new CustomEvent('close',{
            detail:{
                message:"Modal Successfully Closed",
                number:20
            }});
        this.dispatchEvent(myEvent);
    }
}