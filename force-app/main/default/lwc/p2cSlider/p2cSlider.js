import { LightningElement, api } from 'lwc';

export default class P2cSlider extends LightningElement {

    @api val = 20;
    changeHandler(event){
        this.val = event.target.value;
    }

    @api resetSlider(){
        this.val = 50;
    }

}