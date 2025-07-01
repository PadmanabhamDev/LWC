import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Account_Object from '@salesforce/schema/Account';
export default class GetObjectInfoDemo extends LightningElement {

    objectInfo
    @wire(getObjectInfo, { objectApiName: Account_Object })
    objectInfo({ data, error }) {
        if (data) {
            console.log(data);//you cannot assign data you need to store data manually.
            this.objectInfo = data;

        } if (error) {
            console.log(error);
        }
    }
}