public class ErrorHandler {
	
    public static void error(Exception ex,String methodName,String className){
        Error__c err = new Error__c();
        err.Cause_of_Error__c = ex.getStackTraceString() + '</br> <strong> Message </strong> '+ ex.getCause();
        err.Line_Number__c = ex.getLineNumber();
        err.Message__c = ex.getMessage();
        err.Type_of_Exception__c = ex.getTypeName();
        err.Class_Name__c= className;
        err.Method_Name__c = methodName;
 		
        insert err;
        System.debug('Error Id '+err.Id);
    }
}