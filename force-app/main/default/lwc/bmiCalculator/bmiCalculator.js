import { LightningElement } from 'lwc';

export default class BmiCalculator extends LightningElement {

    weight = '';
    height = '';
    result = '';
    handleChange(event) {
        this.result = '';
        const { name, value } = event.target;
        switch (name) {
            case 'height':
                this.height = value;
                break;
            case 'weight':
                this.weight = value;
                break;
        }
        console.log(value);
    }

    handleSubmit() {
        // Validate inputs
        if (!this.height || !this.weight) {
            alert('Please enter valid height and weight');
            return;
        }
        const heightInMeters = this.height / 100;
        const bmi = this.weight / (heightInMeters * heightInMeters);
        this.result = bmi.toFixed(2);  // Optional: limit decimal places
        // Update color based on BMI category
        const ele = this.template.querySelector('.result');
        console.log(ele);
        if (ele) {
            if (bmi < 18.5) {
                ele.style.color = "red"; // Underweight
            } else if (bmi >= 18.5 && bmi < 25) {
                ele.style.color = "green"; // Normal weight
            } else if (bmi >= 25 && bmi < 30) {
                ele.style.color = "orange"; // Overweight
            } else {
                ele.style.color = "red"; // Obese
            }
        }
        // Optionally clear inputs
        this.height = '';
        this.weight = '';
    }

}