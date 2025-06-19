import { LightningElement, wire } from 'lwc';
import mapController from '@salesforce/apex/MapController.MapController';
export default class MapInLwcDemo extends LightningElement {

    @wire(mapController)
    wireHandler({ data, error }) {
        if (data) {
            console.log(data)
        }
        if (error) {
            console.error(error);
        }
    }

}