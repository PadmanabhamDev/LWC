import { LightningElement } from 'lwc';
//import { data } from './newsData.js';
import newsData from '@salesforce/apex/NewsApiController.retrieveNewsData';


export default class NewsTemplate extends LightningElement {
   
    articles;
    connectedCallback() 
    {
        console.log('line 8');
        // Deep clone to avoid mutating the original `data` reference
        //this.newsData = { ...data };
        //console.log('Processed News Data:\n', JSON.stringify(this.newsData));
        this.fetchNewsData();
    }

    fetchNewsData() 
    {
        newsData()
        .then(data=>{
            console.log(data.articles);
            if (data){
            data.articles.forEach(item => {
                item.source.id = Math.random().toString(16).substring(2),
                item.publishedAt = new Date(item.publishedAt).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'UTC'
                });
            });
            this.articles = data.articles;
            console.log('Processed News Data:\n', JSON.stringify(this.articles));
        }
        })
        .catch(error =>{
            console.log('error'+error);
        })
        
    }
}