import { LightningElement } from 'lwc';

export default class HelloQuerySelector extends LightningElement {

    users = ["John","Amla","Test","Hanu"];

    handler(){
        const ele = this.template.querySelector("h1");
        ele.style.border = "1px solid red";
        console.log(ele.innerHTML);

        const ele1 = this.template.querySelectorAll(".name");//this is node so always convert it to 
        Array.from(ele1).forEach(item=>{
            item.setAttribute("title",item.innerHTML);
            console.log('Name '+item.innerHTML);
        })


    }
}