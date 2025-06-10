public class TrainApiController {
    public static TrainApiWrapper getTrainStatus(String trainNo){
        HttpRequest req = new HttpRequest();
        TrainApiWrapper data;
        req.setEndPoint('https://rappid.in/apis/train.php?train_no='+trainNo);
        req.setMethod('GET');
        Http http = new Http();
        HttpResponse res = http.send(req);
        if(res.getStatusCode() == 200){
           data =  TrainApiWrapper.parse(res.getBody());
    	}
        
        System.debug(System.LoggingLevel.DEBUG,'Response \n'+data);
        return data;
       
    }
}