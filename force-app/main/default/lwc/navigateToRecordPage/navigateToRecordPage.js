import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateToRecordPage extends NavigationMixin(LightningElement) {


    navigateToRecordPageInViewMode() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: '001gK000001I97WQAS',
                objectApiName: 'Contact',
                actionName: 'view'
            }
        })
    }
}