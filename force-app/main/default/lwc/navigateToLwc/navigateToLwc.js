import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateToLwc extends NavigationMixin(LightningElement) {

    navigateToLwc() {
        var defination = {
            componentDef: 'c:quizApp',
        }
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + btoa(JSON.stringify(defination))
            }
        })
    }
}