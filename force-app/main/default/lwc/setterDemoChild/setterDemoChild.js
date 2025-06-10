import { LightningElement,api } from 'lwc';

export default class SetterDemoChild extends LightningElement {

    userDetails;

    @api 
    get childData(){
        return this.userDetails;
    }

    set childData(value){
        let data = value;
        this.userDetails = {...data,name:data.name.toUpperCase(),exp:data.exp*2,location:"Patna"}
    }


}