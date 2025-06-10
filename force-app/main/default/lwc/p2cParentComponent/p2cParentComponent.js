import { LightningElement } from 'lwc';

export default class P2cParentComponent extends LightningElement {

    carouselData = [
        {
            src : "https://v1.lightningdesignsystem.com/assets/images/carousel/carousel-01.jpg",
            header : "First Card",
            description : "First card description.",
        },
                    
        {
            src : "https://v1.lightningdesignsystem.com/assets/images/carousel/carousel-02.jpg",
            header : "Second Card",
            description : "Second card description.",
        },
        {
            src : "https://v1.lightningdesignsystem.com/assets/images/carousel/carousel-03.jpg",
            header : "Third Card",
            description : "Third card description.",
        }
    ]
    progreesValue = 10;

    handleChange(event){
        this.progreesValue = event.target.value;
    }

    resetValue(){
        this.refs.reset.resetSlider();
    }

   
}