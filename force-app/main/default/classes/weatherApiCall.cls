public class weatherApiCall {
    @AuraEnabled
    public static String weatherGetRequest(String cityName){
        System.debug('line 3'+cityName);
        HttpRequest req = new HttpRequest();
        req.setEndPoint('https://api.openweathermap.org/data/2.5/weather?q='+cityName+'&appid='+System.label.weatherAPIKey+'&lang=hi&units=metric');
        req.setMethod('GET');
        try{
        	Http http = new Http();
            HttpResponse res = http.send(req);
            if(res.getStatusCode() == 200){
                //weatherWrapper weatherData = (weatherWrapper)System.JSON.deserialize(res.getBody(),weatherWrapper.Class);
                //return weatherData;
            }
        }
        catch(Exception ex){
            System.debug('get exception'+ex.getMessage());
            return ex.getMessage();
        }
       return 'hello';
    }
}