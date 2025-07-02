import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import Account_Industry from '@salesforce/schema/Account.Industry';
import Account_Type from '@salesforce/schema/Account.Type';
import Account_Object from '@salesforce/schema/Account';
export default class GetPicklistValue extends LightningElement {

    @wire(getObjectInfo, { objectApiName: Account_Object })
    objectData
    pickListData;
    pickListData1
    @wire(getPicklistValues, { recordTypeId: '$objectData.data.defaultRecordTypeId', fieldApiName: Account_Industry })
    pickListValues1({ data, error }) {
        if (data) {
            this.pickListData = [...this.generatetPicklist(data)];
            console.log('Industry Picklist ', this.pickListData);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$objectData.data.defaultRecordTypeId', fieldApiName: Account_Type })
    pickListValues2({ data, error }) {
        if (data) {
            this.pickListData1 = [...this.generatetPicklist(data)];
            console.log('Industry Picklist ', this.pickListData1);
        }
    }

    generatetPicklist(data) {
        if (!data || !data.values) return [];
        return data.values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }



    /**
     * @wire(getPicklistValues, { recordTypeId: '$objectData.data.defaultRecordTypeId', fieldApiName: Account_Industry })
        pickListValues({ data, error }) {
            if (data) {
                this.pickListData = data;
                console.log('Industry Picklist ', data);
            }
        }
     * So storing data directly is often unnecessary, and doing so without mapping could expose unwanted internal structure to the component.
        to avoid this we are going with first approch
     */
    handleChange(event) {
        const { value, name } = event.target
        console.log(value);
        console.log(name);
    }
}