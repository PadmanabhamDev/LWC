import { LightningElement, track } from 'lwc';
import getContact from '@salesforce/apex/ContactDataTableController.getContact';
export default class ContactDataTable extends LightningElement {


    /**
    empColumn = [
        {label:'Employee Id', fieldName:'employeeId'},
        {label:'First Name', fieldName:'firstName'},
        {label:'Last Name', fieldName:'lastName'},
        {label:'Employee Phone', fieldName:'employeePhone', type:'phone'},
        {label:'Employee Email', fieldName:'employeeEmail', type:'email'}
    ];
     */

    /**Table row Action Start */
    rowActions = [
        { label: 'View', name: 'view' },
        { label: 'Edit ', name: 'edit' },
        { label: 'Delete', name: 'delete' },
    ]
    /**Table row Action End */

    empColumn = [
        /**
        { 
            label: 'Employee Id', 
            fieldName: 'Id' 
        }, */
        {
            label: 'Name', fieldName: 'ContactURL', type: "url", typeAttributes: {
                label: {
                    fieldName: "Name",
                },
                target: "_blank",
                tooltip: "ViewContact"

            },
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'Account Name',
            fieldName: 'AccountURL',
            type: "url",
            typeAttributes: {
                label: {
                    fieldName: "AccountName"
                },
                target: "_blank",
                tooltip: "ViewAccount",
            },
            sortable: true,
            wrapText: true,
            hideDefaultActions: true,
        },
        {
            label: 'Employee Phone',
            fieldName: 'Phone',
            type: 'phone',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'Employee Email',
            fieldName: 'Email',
            type: 'email',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'Lead Source',
            fieldName: 'LeadSource',
            type: 'text',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true,
            actions: [
                { label: 'All', checked: true, name: 'all' },
                { label: 'Web', checked: false, name: 'Web' },
                { label: 'Phone Inquiry', checked: false, name: 'Phone Inquiry' },
                { label: 'Partner Referral', checked: false, name: 'Partner Referral' },
                { label: 'Purchased List', checked: false, name: 'Purchased List' },
                { label: 'Other', checked: false, name: 'Other' },
            ]
        },
        {
            label: 'Street',
            fieldName: 'street',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'City',
            fieldName: 'city',
            sortable: true
        },
        {
            label: 'State',
            fieldName: 'state',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'Country',
            fieldName: 'country',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            label: 'PostalCode',
            fieldName: 'postalCode',
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: this.rowActions,
                menuAlighment: 'auto',/**not important properties */
            },
            sortable: true,
            wrapText: true,
            hideDefaultActions: true
        }

    ];

    /** d
    empData =[
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev1',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev2',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },
        {
            employeeId:1,
            firstName:'Hanu',
            lastName:'Dev',
            employeePhone:'1234567890',
            employeeEmail:'test@gmail.com'
        },

    ]
    */
    @track empData = [];
    connectedCallback() {
        getContact()
            .then(result => {
                result.forEach(contact => {
                    contact.ContactURL = '/' + contact?.Id;
                    contact.AccountURL = '/' + contact?.Account?.Id;
                    contact.AccountName = contact.Account?.Name;
                    contact.street = contact.MailingAddress?.street
                    contact.city = contact.MailingAddress?.city;
                    contact.state = contact.MailingAddress?.state;
                    contact.country = contact.MailingAddress?.country;
                    contact.postalCode = contact.MailingAddress?.postalCode;
                });
                console.table(result);
                this.empData = result;
            })
            .catch(error => {
                console.log('line 97' + error);
            })
    }

    /**Below  method will be callled when a row action button is clicked*/
    handleRowAction(event) {
        const { row, action } = event.detail;
        /**
        console.log('Line 147' + JSON.stringify(event.detail));
        console.log('line 148' + event.detail.action.name);
        console.log('line 149' + event.detail.row);  
        */
        const actionName = action.name;
        const rowData = row;
        switch (actionName) {
            case 'view':
                console.log('inside view code');
                break;
            case 'edit':
                console.log('inside view code');
                break;
            case 'delete':
                console.log('inside view code');
                break;
        }
    }

    /**sorting attributes start */
    sortedBy = 'Name';
    sortedDirection = 'asc';
    defaultSortDirection = 'desc';
    /**sorting attributes end */

    /**This method will be called whenever a table header is clicked for ssorting handleSort(event) */
    handleSort(event) {
        const { fieldName: sortedBy, sortDirection: sortedDirection } = event.detail;
        // Clone the original data
        const clonedData = [...this.empData];
        // Sort the cloned data safely
        clonedData.sort((a, b) => {
            const valA = a[sortedBy] ?? ''; // fallback to empty string for undefined
            const valB = b[sortedBy] ?? '';
            // Convert to lowercase if strings for case-insensitive comparison
            const aValue = typeof valA === 'string' ? valA.toLowerCase() : valA;
            const bValue = typeof valB === 'string' ? valB.toLowerCase() : valB;

            // Compare values
            if (aValue < bValue) return sortedDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortedDirection === 'asc' ? 1 : -1;
            return 0;
        });
        // Assign the sorted data and update tracking variables
        this.empData = clonedData;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortedDirection;
    }

    /**This method will be called when a header action is clicked  */
    handleHeaderAction(event) {
        console.log('line 273', JSON.stringify(event.detail));
        const { action, columnDefinition } = event.detail;
        const contactColums = this.empColumn;
        const actions = contactColums.find(contactColum => contactColum.fieldName === columnDefinition.fieldName)?.actions;
        if (actions) {
            actions.forEach(currentAction => {
                console.log('line 280', currentAction);
                console.log('line 281', action);
                currentAction.checked = currentAction.name === action.name;
            })
            this.empColumn = [...contactColums];
        }
        console.log(actions);
    }


}
/**
 * hide-checkbox-column
 * show-row-number-column
 * row-number-offset
 * wrapText
 * hideDefaultActions
 * sortable
 */