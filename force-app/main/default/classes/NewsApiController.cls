public with sharing class NewsApiController {

    @AuraEnabled
   public static Map<String,Object> retrieveNewsData() {
        /** 
        Map<String,News_API__mdt> news = News_API__mdt.getAll();// will return all value;News_API__mdt=parent meta data name;
        News_API__mdt n = News_API__mdt.getInstance('News_Api_Details');// will return only value from particular metadata which we got from manage ;News_Api_Details=record of meta data name which we got from manage;
        we can use soql query also;
        */
       //News_API__mdt newsDetail = [Select url__c,apiKey__c From News_API__mdt Where DeveloperName =:'News_Api_Details' LIMIT 1];
        News_API__mdt newsDetail = News_API__mdt.getInstance('News_Api_Details');



        HttpRequest req = new HttpRequest();
        req.setEndPoint(newsDetail.url__c+'/v2/top-headlines?country=us&apiKey='+newsDetail.apiKey__c);
        req.setMethod('GET');
        //req.setHeader('Accept','application/json');
        Http http = new Http();
        try{
            //newsWrapper data ;
            Map<String,Object> newsData;
            HttpResponse res = http.send(req);
            if(res.getStatusCode() == 200){
                String newsResponse = res.getBody();
                
                if(!String.isBlank(newsResponse)){
                    newsData = (Map<String,Object>)JSON.deserializeUntyped(newsResponse);
            	}
				
                //data = newsWrapper.newsParse(newsResponse);   
        	}
            return newsData;
        }
        catch(exception ex){
            ErrorHandler.error(ex,'retrieveNewsData','NewsApiController');
            return null;
        }
        
    }
}