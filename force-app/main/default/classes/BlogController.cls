public with sharing class BlogController {
    @AuraEnabled(cacheable=true)
    public static List<Blog__c> getBlogs() {
        return [SELECT Id, Title__c, Content__c, Category__c, Status__c, Tags__c, Cover_Image__c FROM Blog__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Blog__c> getPublishedBlogs() {
        return [SELECT Id, Title__c, Content__c, Category__c, Tags__c, Cover_Image__c 
                FROM Blog__c WHERE Status__c = 'Published'];
    }
}