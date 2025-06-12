import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class NavigateToLwc extends NavigationMixin(LightningElement) {

    navigateToLwc() {
        var defination = {
            componentDef: 'c:quizApp',
            attributes: {
                recordId: '1234567890'// after use @api to get the value in webPage
            }
        }
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/one/one.app#' + btoa(JSON.stringify(defination))
            }
        })
    }
}