public class newsWrapper {
    @AuraEnabled public String status;
    @AuraEnabled public Integer totalResults;
    @AuraEnabled public List<articles> articles;

    public class articles {
        @AuraEnabled public source source;
        @AuraEnabled public String author;
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public String url;
        @AuraEnabled public String urlToImage;
        @AuraEnabled public String publishedAt;
        @AuraEnabled public String content;
		@AuraEnabled public String imageDataUri; // <-- New Field
    }

    public class source {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
    }

    public static newsWrapper newsParse(String json){
        return (newsWrapper) System.JSON.deserialize(json, newsWrapper.class);
    }
}