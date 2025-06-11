import { LightningElement } from 'lwc';

export default class CustomLightningCard extends LightningElement {


    handlefooterChange() {
        const ele = this.template.querySelector(".slds-card__footer");
        if (ele) {
            ele.classList.remove("slds-hide");
        }
    }


}