import { LightningElement } from 'lwc';

export default class SlotChildDemo extends LightningElement {

    handleSlotChange(){
        const ele = this.template.querySelector('.slds-card__footer');
        if(ele){
            ele.classList.remove('.slds-hide');
        }
    }
}