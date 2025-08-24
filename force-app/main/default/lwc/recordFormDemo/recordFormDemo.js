import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Account_Object from '@salesforce/schema/Account';
import Name_field from '@salesforce/schema/Account.Name';
import Rating_field from '@salesforce/schema/Account.Rating';
import Phone_field from '@salesforce/schema/Account.Phone';
import NumberOfEmployees_field from '@salesforce/schema/Account.NumberOfEmployees';
import NumberOfEmployees_fieldld from '@salesforce/schema/Account.NumberOfEmployees';

export default class RecordFormDemo extends LightningElement {

    objectName = Account_Object;
    fieldList = [Name_field, Rating_field, Phone_field, NumberOfEmployees_field];

    handler(event) {// as it is lds we will get the value in detail
        console.log('Id ' + event.detail.id);
        const toastEvent = new ShowToastEvent({
            title: "Account Created",
            variant: "success",
            message: 'Record Id ' + event.detail.id
        })
        this.dispatchEvent(toastEvent);
    }
}