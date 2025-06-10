import { LightningElement,track } from 'lwc';
import weatherUpdate from  '@salesforce/apex/weatherApiCall.weatherGetRequest';
export default class WeatherApp extends LightningElement {

    cityName='';
    isLoading = false;
    noError = true;    
    @track data ={};
    submitHandler(event){
        console.log('line 9'+this.cityName);
        this.isLoading = true;
        this.getWeatherData();
    }

    searchHandler(event){
        console.log('line 12'+event.target.value)
        this.cityName = event.target.value;
    }

    getWeatherData(){
        console.log('line 21'+ this.cityName);
        weatherUpdate({cityName : this.cityName})
        .then(result =>{
            this.data = result;
        })
        .catch(error =>{
            console.log('error '+error);
        })
        .finally( ()=>{
            this.isLoading = false;
        });
    }


}