import { LightningElement } from 'lwc';

export default class FundamentalOfLWC extends LightningElement {
    name = "Padmanabham";
    nameChange = '';
    handleChange(event){
        this.nameChange = event.target.value;
    }

}