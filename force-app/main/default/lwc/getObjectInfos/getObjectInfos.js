import { LightningElement, wire } from 'lwc';
import { getObjectInfos } from 'lightning/uiObjectInfoApi';
import Account_Object from '@salesforce/schema/Account';
import Opp_Object from '@salesforce/schema/Opportunity';

export default class GetObjectInfos extends LightningElement {
    objectInfosData; // renamed property
    objectApiNames = [Account_Object, Opp_Object]
    @wire(getObjectInfos, { objectApiNames: '$objectApiNames' })
    wiredObjectInfos({ data, error }) { // renamed function
        if (data) {
            console.log('ObjectInfos:', data);
            this.objectInfosData = data;
        } else if (error) {
            console.error('Error:', error);
        }
    }
}