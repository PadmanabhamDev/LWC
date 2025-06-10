import { LightningElement } from 'lwc';

export default class C2pParentCommunication extends LightningElement {
    msg = '';
    num = '';
    openModal = false;
    handleModal(){
        this.msg = '';
        this.num = '';
        this.openModal = true;
    }

    handleClose(event){
        this.msg = event.detail.message;
        this.num = event.detail.number;
        this.openModal = false;
    }
}