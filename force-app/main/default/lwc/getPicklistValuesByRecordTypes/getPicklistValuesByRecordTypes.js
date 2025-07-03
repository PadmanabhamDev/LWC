import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import Account_Object from "@salesforce/schema/Account";
export default class GetPicklistValuesByRecordTypes extends LightningElement {

    @wire(getObjectInfo, { objectApiName: Account_Object })
    objectData;
    accountSource;
    billingCountryCode;
    selectedValue;
    selectedValue1;
    selectedValue2;
    @wire(getPicklistValuesByRecordType, { objectApiName: Account_Object, recordTypeId: '$objectData.data.defaultRecordTypeId' })
    wireFunction({ data, error }) {
        if (data) {
            console.log('Data ', data);

            this.accountSource = this.generatePickListData(data.picklistFieldValues.AccountSource);
            this.billingCountryCode = this.generatePickListData(data.picklistFieldValues.BillingCountryCode);
            console.log(`Account Source ${this.accountSource}`);
            console.log(`Billing Country Code ${this.billingCountryCode}`);
        }
    }

    generatePickListData(data) {
        if (!data || !data.values) return [];
        return data.values.map(item => ({
            label: item.label,
            value: item.value
        }))
    }

    handleChange(event) {
        const { name, value } = event.target;
        switch (name) {
            case 'Account Source':
                this.selectedValue1 = value;
                break;
            case 'Billing Country Code':
                this.selectedValue2 = value;
                break;
        }
    }
}