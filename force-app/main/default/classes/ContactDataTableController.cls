public with sharing class ContactDataTableController {
    @AuraEnabled
        public static List<Contact> getContact(){
            try {
                return [Select Id,Name,Account.Name,Phone,Email,MailingAddress From Contact];
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }
        }
}