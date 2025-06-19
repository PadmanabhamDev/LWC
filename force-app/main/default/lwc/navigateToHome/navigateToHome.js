import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// we have to wrapped into NavigationMixin
export default class NavigateToHome extends NavigationMixin(LightningElement) {

    navigateToHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'home'
            }
        });
    }

    navigateToChatter() {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'chatter'
            }
        });
    }
}