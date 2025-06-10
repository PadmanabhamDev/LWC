import { LightningElement,track } from 'lwc';
import getContact from '@salesforce/apex/ContactDataTableController.getContact'
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

    empColumn = [
        {label:'Employee Id', fieldName:'Id'},
        {label:'Name', fieldName:'ContactURL',type:"url",typeAttributes:{
            label:{
                fieldName : "Name",
            },
            target:"_blank",
            tooltip:"ViewContact"

        }},
        {label:'Account Name', fieldName:'AccountURL',type:"url",typeAttributes:{
            label:{
                fieldName:"AccountName"
            },
            target:"_blank",
            tooltip:"ViewAccount"
        }},
        {label:'Employee Phone', fieldName:'Phone', type:'phone'},
        {label:'Employee Email', fieldName:'Email', type:'email'},
        {label:'Street',fieldName:'street'},
        {label:'City',fieldName:'city'},
        {label:'State',fieldName:'state'},
        {label:'Country',fieldName:'country'},
        {label:'PostalCode',fieldName:'postalCode'}
    ];

    /** 
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
    connectedCallback(){
        getContact()
        .then(result =>{
            result.forEach(contact =>{
                contact.ContactURL = '/'+contact?.Id;
                contact.AccountURL = '/'+contact?.Account?.Id;
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
        .catch(error =>{
            console.log('line 97'+error);
        })
    }


}