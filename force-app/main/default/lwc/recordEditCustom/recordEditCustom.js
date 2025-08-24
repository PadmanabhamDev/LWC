import { LightningElement } from 'lwc';
import Contact_Object from '@salesforce/schema/Account';
export default class RecordEditCustom extends LightningElement {
    objectName = Contact_Object;
    nameValue = "";
    phoneValue = '';
    employeesValue = '';
    handleChange(event) {
        const { label, value } = event.target;
        switch (label) {
            case 'Name':
                this.nameValue = value;
                break;
            case 'Phone':
                this.phoneValue = value;
                break;
            case 'Employees':
                this.employeesValue = value;
        }
    }

    handleSubmit(event) {
        event.preventDefault();//so avaoid auto refresh on submit
        const inputValidity = this.template.querySelectorAll('lightning-input');
        let isValid = true;
        inputValidity.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        })

        console.log(isValid);
    }
}