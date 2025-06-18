import { LightningElement, wire } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactData';
export default class FilteringAndSortingDemo extends LightningElement {

    filterOptions = [
        { label: "All", value: "" },
        { label: "Id", value: "Id" },
        { label: "Name", value: "Name" },
        { label: "Email", value: "Email" },
        { label: "Title", value: "Title" }
    ];
    headings = ["Id", "Name", "Email", "Title"];
    fullTableData = [];
    filteredData = [];
    @wire(getContactList)
    wireMethod({ data, error }) {
        if (data) {
            this.fullTableData = data;
            this.filteredData = data;
            console.log(data)
        }
        if (error) {
            console.error(data);
        }
    }

    handleFilterChange(event) {
        const { name, value } = event.target;
        console.log(`Name : ${name} Value : ${value}`);
    }

    handleSearch(event) {
        const { value } = event.target;
        console.log(`Value : ${value}`);
        if (value) {
            this.filteredData = this.fullTableData.filter(eachObject => {
                //Object.keys(eachObject) = ["Id", "Name", "Email", "Title"]
                return Object.keys(eachObject).some(key => {
                    return eachObject[key].toLowerCase().includes(value)
                })
            })
        } else {
            this.filteredData = [...this.fullTableData];
        }

    }
}