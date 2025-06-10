import { LightningElement,api } from 'lwc';

export default class P2cAlertComponent extends LightningElement {

    @api isValid;
    @api title;
    @api h2Data;
    @api number;

}