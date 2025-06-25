import { LightningElement } from 'lwc';
import Contact_Object from '@salesforce/schema/Contact';
import Name_Field from '@salesforce/schema/Contact.Name';
import Title_Field from '@salesforce/schema/Contact.Title';
import Phone_Field from '@salesforce/schema/Contact.Phone';
import Email_Field from '@salesforce/schema/Contact.Email';
import Account_Field from '@salesforce/schema/Contact.AccountId';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class RecordEditForm extends LightningElement {

    objectName = Contact_Object;
    contactFields = {
        accountField: Account_Field,
        nameField: Name_Field,
        titleField: Title_Field,
        phoneField: Phone_Field,
        emailField: Email_Field,
    }

    handleSave(event) {// as it is lds we will get the value in detail
        console.log('Id ' + event.detail.id);
        const toastEvent = new ShowToastEvent({
            title: "Account Created",
            variant: "success",
            message: 'Record Id ' + event.detail.id
        })
        this.dispatchEvent(toastEvent);
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');//array of nodes to covert we will use Array.From(inputFields).forEach();
        if (inputFields) {
            Array.from(inputFields).forEach(input => {
                input.reset();
            })
            // inputFields.forEach(field => {
            //     field.value.reset();
            // })
        }
    }


}