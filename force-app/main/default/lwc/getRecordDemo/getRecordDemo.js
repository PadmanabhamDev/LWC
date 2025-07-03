import { LightningElement, wire, api } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi'
import NAME_FIELD from '@salesforce/schema/Account.Name'
import OWNER_NAME_FIELD from '@salesforce/schema/Account.Owner.Name'
import ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue'
export default class GetRecordDemo extends LightningElement {
    name
    owner
    AnnualRevenue
    //@api recordId
    recordId = '001gK000001I97WQAS'
    // @wire(getRecord, {recordId:'$recordId',
    //  fields:[NAME_FIELD, OWNER_NAME_FIELD, ANNUAL_REVENUE_FIELD]})
    @wire(getRecord, {
        recordId: '$recordId',
        layoutTypes: ['Full'], modes: ['View']
    })
    accountHandler({ data }) {
        if (data) {
            console.log(data)
            this.name = getFieldValue(data, NAME_FIELD);
            //this.name = data.fields.Name.displayValue ? data.fields.Name.displayValue :data.fields.Name.value
            this.AnnualRevenue = getFieldDisplayValue(data, ANNUAL_REVENUE_FIELD);
            //this.AnnualRevenue = data.fields.AnnualRevenue.displayValue ? data.fields.AnnualRevenue.displayValue : data.fields.AnnualRevenue.value
            this.owner = getFieldValue(data, OWNER_NAME_FIELD);
            //this.owner = data.fields.Owner.displayValue ? data.fields.Owner.displayValue :data.fields.Owner.value

        }
    }
}