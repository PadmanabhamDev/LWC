import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateToNavItemPage extends NavigationMixin(LightningElement) {


    navigateToTab() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            target: '_blank',
            attributes: {
                apiName: 'Reusable_Component'
            }
        })
    }
}