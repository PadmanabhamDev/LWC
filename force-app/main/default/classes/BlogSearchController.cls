/**
 * @description Controller class for Blog Search functionality
 * @author Blog Site Team
 * @date 2025
 */
public with sharing class BlogSearchController {
    
    /**
     * @description Search blog posts by keyword
     * @param searchTerm Search keyword
     * @param categoryId Filter by category
     * @param pageSize Number of results per page
     * @param pageNumber Current page number
     * @return Search results with pagination
     */
    @AuraEnabled(cacheable=true)
    public static SearchResponse searchBlogPosts(String searchTerm, String categoryId, Integer pageSize, Integer pageNumber) {
        try {
            Integer offset = (pageNumber - 1) * pageSize;
            
            String soqlQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING ' +
                              'Blog_Post__c(Id, Name, Excerpt__c, Featured_Image_URL__c, ' +
                              'Published_Date__c, Category__r.Name, Category__r.Color__c, ' +
                              'Author__r.Name, View_Count__c, URL_Slug__c ' +
                              'WHERE Status__c = \'Published\' AND Published_Date__c <= ' + String.valueOf(System.now()) + ')';
            
            if (String.isNotBlank(categoryId)) {
                soqlQuery += ' AND Category__c = :categoryId';
            }
            
            soqlQuery += ' ORDER BY Published_Date__c DESC LIMIT :pageSize OFFSET :offset)';
            
            List<List<SObject>> searchResults = Search.query(soqlQuery);
            List<Blog_Post__c> posts = (List<Blog_Post__c>) searchResults[0];
            
            // Get total count for the same search
            String countQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING ' +
                               'Blog_Post__c(Id WHERE Status__c = \'Published\' AND Published_Date__c <= ' + String.valueOf(System.now()) + ')';
            
            if (String.isNotBlank(categoryId)) {
                countQuery += ' AND Category__c = :categoryId';
            }
            
            countQuery += ')';
            
            List<List<SObject>> countResults = Search.query(countQuery);
            Integer totalCount = countResults[0].size();
            
            return new SearchResponse(posts, totalCount, searchTerm);
        } catch (Exception e) {
            throw new AuraHandledException('Error searching blog posts: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get blog posts by tag
     * @param tagName Tag name to filter by
     * @param pageSize Number of results per page
     * @param pageNumber Current page number
     * @return Blog posts with the specified tag
     */
    @AuraEnabled(cacheable=true)
    public static SearchResponse getBlogPostsByTag(String tagName, Integer pageSize, Integer pageNumber) {
        try {
            Integer offset = (pageNumber - 1) * pageSize;
            String tagPattern = '%' + tagName + '%';
            
            List<Blog_Post__c> posts = [
                SELECT Id, Name, Excerpt__c, Featured_Image_URL__c, Published_Date__c,
                       Category__r.Name, Category__r.Color__c, Author__r.Name, 
                       View_Count__c, URL_Slug__c
                FROM Blog_Post__c 
                WHERE Status__c = 'Published' 
                AND Published_Date__c <= :System.now()
                AND Tags__c LIKE :tagPattern
                ORDER BY Published_Date__c DESC
                LIMIT :pageSize 
                OFFSET :offset
            ];
            
            Integer totalCount = [
                SELECT COUNT() 
                FROM Blog_Post__c 
                WHERE Status__c = 'Published' 
                AND Published_Date__c <= :System.now()
                AND Tags__c LIKE :tagPattern
            ];
            
            return new SearchResponse(posts, totalCount, 'Tag: ' + tagName);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving posts by tag: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get search suggestions based on partial input
     * @param partialTerm Partial search term
     * @return List of search suggestions
     */
    @AuraEnabled(cacheable=true)
    public static List<String> getSearchSuggestions(String partialTerm) {
        try {
            Set<String> suggestions = new Set<String>();
            
            if (String.isNotBlank(partialTerm) && partialTerm.length() >= 2) {
                String likePattern = '%' + partialTerm + '%';
                
                // Search in post titles
                List<Blog_Post__c> posts = [
                    SELECT Name 
                    FROM Blog_Post__c 
                    WHERE Name LIKE :likePattern 
                    AND Status__c = 'Published'
                    LIMIT 5
                ];
                
                for (Blog_Post__c post : posts) {
                    suggestions.add(post.Name);
                }
                
                // Search in categories
                List<Blog_Category__c> categories = [
                    SELECT Name 
                    FROM Blog_Category__c 
                    WHERE Name LIKE :likePattern
                    LIMIT 3
                ];
                
                for (Blog_Category__c category : categories) {
                    suggestions.add(category.Name);
                }
                
                // Search in tags
                List<Blog_Tag__c> tags = [
                    SELECT Name 
                    FROM Blog_Tag__c 
                    WHERE Name LIKE :likePattern
                    LIMIT 3
                ];
                
                for (Blog_Tag__c tag : tags) {
                    suggestions.add(tag.Name);
                }
            }
            
            return new List<String>(suggestions);
        } catch (Exception e) {
            throw new AuraHandledException('Error getting search suggestions: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get recent search terms (mock implementation)
     * @return List of recent searches
     */
    @AuraEnabled(cacheable=true)
    public static List<String> getRecentSearches() {
        try {
            // In a real implementation, you might store search history
            // For now, return popular categories and tags
            List<String> recentSearches = new List<String>();
            
            List<Blog_Category__c> categories = [
                SELECT Name 
                FROM Blog_Category__c 
                ORDER BY Sort_Order__c 
                LIMIT 3
            ];
            
            for (Blog_Category__c category : categories) {
                recentSearches.add(category.Name);
            }
            
            List<Blog_Tag__c> tags = [
                SELECT Name 
                FROM Blog_Tag__c 
                WHERE Usage_Count__c > 0
                ORDER BY Usage_Count__c DESC 
                LIMIT 3
            ];
            
            for (Blog_Tag__c tag : tags) {
                recentSearches.add(tag.Name);
            }
            
            return recentSearches;
        } catch (Exception e) {
            throw new AuraHandledException('Error getting recent searches: ' + e.getMessage());
        }
    }
    
    /**
     * @description Wrapper class for search response
     */
    public class SearchResponse {
        @AuraEnabled public List<Blog_Post__c> posts { get; set; }
        @AuraEnabled public Integer totalCount { get; set; }
        @AuraEnabled public String searchTerm { get; set; }
        
        public SearchResponse(List<Blog_Post__c> posts, Integer totalCount, String searchTerm) {
            this.posts = posts;
            this.totalCount = totalCount;
            this.searchTerm = searchTerm;
        }
    }
}