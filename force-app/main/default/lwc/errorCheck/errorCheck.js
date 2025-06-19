import { LightningElement,track } from 'lwc';

export default class ErrorCheck extends LightningElement {

    // handleSubmit() {
    //     const inputs = this.template.querySelectorAll('.inputCmp');
    //     let allValid = true;

    //     inputs.forEach(inputCmp => {
    //         // Check if input is empty or invalid
    //         if (!inputCmp.value || inputCmp.value.trim() === '') {
    //             inputCmp.setCustomValidity('This field is required to proceed.');
    //         } else {
    //             inputCmp.setCustomValidity('');
    //         }
    //         // Show validation message if any
    //         inputCmp.reportValidity();

    //         // Update overall validity flag
    //         if (!inputCmp.checkValidity()) {
    //             allValid = false;
    //         }
    //     });

    //     if (allValid) {
    //         // All fields are valid, proceed with form submission logic
    //         console.log('Form submitted successfully!');
    //         // Add your submit logic here
    //     } else {
    //         console.log('Please fill in all required fields.');
    //     }
    // }

    @track records = [
        { id: '1', Name: 'John Doe', Email: 'john@example.com', Phone: '1234567890', Loc: 'New York', Title: 'Manager' },
        { id: '2', Name: '', Email: 'jane@example.com', Phone: '0987654321', Loc: 'Chicago', Title: 'Developer' },
        { id: '3', Name: 'Emily Smith', Email: '', Phone: '5678901234', Loc: 'San Francisco', Title: 'Analyst' }
    ];

    columns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Email', fieldName: 'Email', editable: true },
        { label: 'Phone', fieldName: 'Phone', editable: true },
        { label: 'Location', fieldName: 'Loc', editable: true },
        { label: 'Title', fieldName: 'Title', editable: true }
    ];

    @track tableErrors = { rows: {} };

    handleSave() {
        // Simulate validation
        let rowErrors = {};
        this.records.forEach(record => {
            let messages = [];

            if (!record.Name) messages.push('Name is required.');
            if (!record.Email) messages.push('Email is required.');
            if (messages.length > 0) {
                rowErrors[record.id] = {
                    title: 'Validation Error',
                    messages: messages,
                    fieldNames: ['Name', 'Email']
                };
            }
        });

        this.tableErrors = { rows: rowErrors };

        if (Object.keys(rowErrors).length === 0) {
            // Simulate successful save
            alert('All records saved successfully!');
        }
    }
}