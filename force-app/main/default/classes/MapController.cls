public with sharing class MapController {

    @AuraEnabled(cacheable=true)
    public static List<Account>  MapController() {
        return [Select Id,Name,Description, BillingStreet,BillingCountry,BillingCity,BillingState,BillingPostalCode From Account Order By Name LIMIT 10];
    }
}