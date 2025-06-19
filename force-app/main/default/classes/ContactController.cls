public with sharing class ContactController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactData() {
        return [ Select Id,Name,Title,Email From Contact ];
    }
}