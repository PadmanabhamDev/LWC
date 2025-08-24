import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import Contact_Object from '@salesforce/schema/Contact';
export default class GetListUi extends LightningElement {

    @wire(getListUi, { objectApiName: Contact_Object, listViewApiName: 'AllContacts' })
    listData({ data, error }) {
        if (data) {
            console.log('line 9 ', data);
        }
        if (error) {
            console.log(error);
        }
    }



}