/**
 * @description Controller class for Blog Post operations
 * @author Blog Site Team
 * @date 2025
 */
public with sharing class BlogPostController {
    
    /**
     * @description Get published blog posts with pagination
     * @param pageSize Number of posts per page
     * @param pageNumber Current page number
     * @param categoryId Filter by category ID
     * @return List of blog posts
     */
    @AuraEnabled(cacheable=true)
    public static BlogPostResponse getBlogPosts(Integer pageSize, Integer pageNumber, String categoryId) {
        try {
            Integer offset = (pageNumber - 1) * pageSize;
            String query = 'SELECT Id, Name, Excerpt__c, Featured_Image_URL__c, Published_Date__c, ' +
                          'Category__r.Name, Category__r.Color__c, Author__r.Name, View_Count__c, URL_Slug__c ' +
                          'FROM Blog_Post__c WHERE Status__c = \'Published\' AND Published_Date__c <= :System.now()';
            
            if (String.isNotBlank(categoryId)) {
                query += ' AND Category__c = :categoryId';
            }
            
            query += ' ORDER BY Published_Date__c DESC LIMIT :pageSize OFFSET :offset';
            
            List<Blog_Post__c> posts = Database.query(query);
            
            // Get total count for pagination
            String countQuery = 'SELECT COUNT() FROM Blog_Post__c WHERE Status__c = \'Published\' AND Published_Date__c <= :System.now()';
            if (String.isNotBlank(categoryId)) {
                countQuery += ' AND Category__c = :categoryId';
            }
            
            Integer totalCount = Database.countQuery(countQuery);
            
            return new BlogPostResponse(posts, totalCount);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving blog posts: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get a single blog post by URL slug
     * @param urlSlug The URL slug of the blog post
     * @return Blog post details
     */
    @AuraEnabled(cacheable=true)
    public static Blog_Post__c getBlogPostBySlug(String urlSlug) {
        try {
            List<Blog_Post__c> posts = [
                SELECT Id, Name, Content__c, Excerpt__c, Featured_Image_URL__c, 
                       Published_Date__c, Category__r.Name, Category__r.Color__c, 
                       Author__r.Name, View_Count__c, URL_Slug__c, Tags__c,
                       SEO_Title__c, SEO_Description__c
                FROM Blog_Post__c 
                WHERE URL_Slug__c = :urlSlug 
                AND Status__c = 'Published' 
                AND Published_Date__c <= :System.now()
                LIMIT 1
            ];
            
            if (posts.isEmpty()) {
                throw new AuraHandledException('Blog post not found');
            }
            
            // Increment view count
            Blog_Post__c post = posts[0];
            post.View_Count__c = (post.View_Count__c == null ? 0 : post.View_Count__c) + 1;
            update post;
            
            return post;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving blog post: ' + e.getMessage());
        }
    }
    
    /**
     * @description Create or update a blog post
     * @param post Blog post to save
     * @return Saved blog post
     */
    @AuraEnabled
    public static Blog_Post__c saveBlogPost(Blog_Post__c post) {
        try {
            // Generate URL slug if not provided
            if (String.isBlank(post.URL_Slug__c)) {
                post.URL_Slug__c = generateUrlSlug(post.Name);
            }
            
            // Set author if not provided
            if (post.Author__c == null) {
                post.Author__c = UserInfo.getUserId();
            }
            
            // Set published date if status is published and date is not set
            if (post.Status__c == 'Published' && post.Published_Date__c == null) {
                post.Published_Date__c = System.now();
            }
            
            upsert post Id;
            
            return [
                SELECT Id, Name, Content__c, Excerpt__c, Featured_Image_URL__c, 
                       Published_Date__c, Category__r.Name, Author__r.Name, 
                       Status__c, URL_Slug__c, Tags__c, SEO_Title__c, SEO_Description__c
                FROM Blog_Post__c 
                WHERE Id = :post.Id
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error saving blog post: ' + e.getMessage());
        }
    }
    
    /**
     * @description Delete a blog post
     * @param postId Blog post ID to delete
     */
    @AuraEnabled
    public static void deleteBlogPost(String postId) {
        try {
            delete [SELECT Id FROM Blog_Post__c WHERE Id = :postId];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting blog post: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get blog categories
     * @return List of blog categories
     */
    @AuraEnabled(cacheable=true)
    public static List<Blog_Category__c> getCategories() {
        try {
            return [
                SELECT Id, Name, Description__c, Color__c
                FROM Blog_Category__c
                ORDER BY Sort_Order__c, Name
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving categories: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get popular tags
     * @return List of popular tags
     */
    @AuraEnabled(cacheable=true)
    public static List<Blog_Tag__c> getPopularTags() {
        try {
            return [
                SELECT Id, Name, Usage_Count__c
                FROM Blog_Tag__c
                WHERE Usage_Count__c > 0
                ORDER BY Usage_Count__c DESC
                LIMIT 20
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving tags: ' + e.getMessage());
        }
    }
    
    /**
     * @description Generate URL slug from title
     * @param title Blog post title
     * @return URL-friendly slug
     */
    private static String generateUrlSlug(String title) {
        if (String.isBlank(title)) {
            return '';
        }
        
        String slug = title.toLowerCase()
                          .replaceAll('[^a-z0-9\\s]', '')
                          .replaceAll('\\s+', '-')
                          .replaceAll('^-+|-+$', '');
        
        // Ensure uniqueness
        Integer counter = 1;
        String originalSlug = slug;
        
        while (isDuplicateSlug(slug)) {
            slug = originalSlug + '-' + counter;
            counter++;
        }
        
        return slug;
    }
    
    /**
     * @description Check if URL slug already exists
     * @param slug URL slug to check
     * @return True if duplicate exists
     */
    private static Boolean isDuplicateSlug(String slug) {
        Integer count = [SELECT COUNT() FROM Blog_Post__c WHERE URL_Slug__c = :slug];
        return count > 0;
    }
    
    /**
     * @description Wrapper class for blog post response with pagination
     */
    public class BlogPostResponse {
        @AuraEnabled public List<Blog_Post__c> posts { get; set; }
        @AuraEnabled public Integer totalCount { get; set; }
        
        public BlogPostResponse(List<Blog_Post__c> posts, Integer totalCount) {
            this.posts = posts;
            this.totalCount = totalCount;
        }
    }
}