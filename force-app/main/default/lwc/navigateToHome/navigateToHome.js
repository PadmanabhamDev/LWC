import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// we have to wrapped our base class into NavigationMixin
export default class NavigateToHome extends NavigationMixin(LightningElement) {

    // chhater and home page are standard name pages
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