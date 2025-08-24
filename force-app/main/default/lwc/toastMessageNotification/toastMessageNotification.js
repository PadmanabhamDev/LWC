import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ToastMessageNotification extends LightningElement {

    toastHandler() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Success!!",
                message: "{0} Account Created!!",
                messageData: [
                    {
                        url: "https://www.salesforce.com",
                        label: "Click Here"
                    }
                ],
                variant: "success",
                //mode: "sticky"
            })
        );
    }

    // Toast without link
    toastHandlerTwo() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Error!!",
                message: "Account Creation Failed!!",
                variant: "error"
            })
        );
    }

    toastHandlerThree() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Warning!!",
                message: "Password should have 15 characters!!",
                variant: "warning"
            })
        );
    }

    toastHandlerFour() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: "Info!!",
                message: "Summer '20 release is available!!",
                variant: "info"
            })
        );
    }
}