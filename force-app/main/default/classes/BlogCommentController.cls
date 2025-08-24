/**
 * @description Controller class for Blog Comment operations
 * @author Blog Site Team
 * @date 2025
 */
public with sharing class BlogCommentController {
    
    /**
     * @description Get approved comments for a blog post
     * @param blogPostId Blog post ID
     * @return List of approved comments
     */
    @AuraEnabled(cacheable=true)
    public static List<Blog_Comment__c> getCommentsForPost(String blogPostId) {
        try {
            return [
                SELECT Id, Comment_Text__c, Author_Name__c, Posted_Date__c, 
                       CreatedDate, LastModifiedDate
                FROM Blog_Comment__c 
                WHERE Blog_Post__c = :blogPostId 
                AND Status__c = 'Approved'
                ORDER BY Posted_Date__c DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving comments: ' + e.getMessage());
        }
    }
    
    /**
     * @description Submit a new comment
     * @param comment Comment to submit
     * @return Submitted comment
     */
    @AuraEnabled
    public static Blog_Comment__c submitComment(Blog_Comment__c comment) {
        try {
            // Validate required fields
            if (String.isBlank(comment.Comment_Text__c)) {
                throw new AuraHandledException('Comment text is required');
            }
            
            if (String.isBlank(comment.Author_Name__c)) {
                throw new AuraHandledException('Author name is required');
            }
            
            if (String.isBlank(comment.Author_Email__c)) {
                throw new AuraHandledException('Author email is required');
            }
            
            if (String.isBlank(comment.Blog_Post__c)) {
                throw new AuraHandledException('Blog post is required');
            }
            
            // Validate email format
            if (!isValidEmail(comment.Author_Email__c)) {
                throw new AuraHandledException('Please enter a valid email address');
            }
            
            // Set default values
            comment.Status__c = 'Pending'; // Comments require approval
            comment.Posted_Date__c = System.now();
            
            // Sanitize comment text to prevent XSS
            comment.Comment_Text__c = sanitizeHtml(comment.Comment_Text__c);
            
            insert comment;
            
            return [
                SELECT Id, Comment_Text__c, Author_Name__c, Posted_Date__c, 
                       Status__c, CreatedDate
                FROM Blog_Comment__c 
                WHERE Id = :comment.Id
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error submitting comment: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get pending comments for moderation (admin only)
     * @return List of pending comments
     */
    @AuraEnabled
    public static List<Blog_Comment__c> getPendingComments() {
        try {
            // Check if user has admin permissions
            if (!hasAdminPermissions()) {
                throw new AuraHandledException('Insufficient permissions to view pending comments');
            }
            
            return [
                SELECT Id, Comment_Text__c, Author_Name__c, Author_Email__c,
                       Posted_Date__c, Blog_Post__r.Name, Status__c
                FROM Blog_Comment__c 
                WHERE Status__c = 'Pending'
                ORDER BY Posted_Date__c ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving pending comments: ' + e.getMessage());
        }
    }
    
    /**
     * @description Approve or reject a comment (admin only)
     * @param commentId Comment ID
     * @param action 'approve' or 'reject'
     */
    @AuraEnabled
    public static void moderateComment(String commentId, String action) {
        try {
            // Check if user has admin permissions
            if (!hasAdminPermissions()) {
                throw new AuraHandledException('Insufficient permissions to moderate comments');
            }
            
            Blog_Comment__c comment = [
                SELECT Id, Status__c 
                FROM Blog_Comment__c 
                WHERE Id = :commentId
            ];
            
            if (action == 'approve') {
                comment.Status__c = 'Approved';
            } else if (action == 'reject') {
                comment.Status__c = 'Rejected';
            } else {
                throw new AuraHandledException('Invalid moderation action');
            }
            
            update comment;
        } catch (Exception e) {
            throw new AuraHandledException('Error moderating comment: ' + e.getMessage());
        }
    }
    
    /**
     * @description Delete a comment (admin only)
     * @param commentId Comment ID to delete
     */
    @AuraEnabled
    public static void deleteComment(String commentId) {
        try {
            // Check if user has admin permissions
            if (!hasAdminPermissions()) {
                throw new AuraHandledException('Insufficient permissions to delete comments');
            }
            
            delete [SELECT Id FROM Blog_Comment__c WHERE Id = :commentId];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting comment: ' + e.getMessage());
        }
    }
    
    /**
     * @description Get comment statistics for a blog post
     * @param blogPostId Blog post ID
     * @return Comment statistics
     */
    @AuraEnabled(cacheable=true)
    public static CommentStats getCommentStats(String blogPostId) {
        try {
            List<AggregateResult> results = [
                SELECT Status__c, COUNT(Id) cnt
                FROM Blog_Comment__c 
                WHERE Blog_Post__c = :blogPostId
                GROUP BY Status__c
            ];
            
            CommentStats stats = new CommentStats();
            
            for (AggregateResult result : results) {
                String status = (String) result.get('Status__c');
                Integer count = (Integer) result.get('cnt');
                
                if (status == 'Approved') {
                    stats.approvedCount = count;
                } else if (status == 'Pending') {
                    stats.pendingCount = count;
                } else if (status == 'Rejected') {
                    stats.rejectedCount = count;
                }
            }
            
            return stats;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving comment statistics: ' + e.getMessage());
        }
    }
    
    /**
     * @description Validate email format
     * @param email Email to validate
     * @return True if valid email format
     */
    private static Boolean isValidEmail(String email) {
        String emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
        Pattern emailPattern = Pattern.compile(emailRegex);
        return emailPattern.matcher(email).matches();
    }
    
    /**
     * @description Sanitize HTML content to prevent XSS
     * @param content Content to sanitize
     * @return Sanitized content
     */
    private static String sanitizeHtml(String content) {
        if (String.isBlank(content)) {
            return content;
        }
        
        // Remove potentially dangerous HTML tags and JavaScript
        content = content.replaceAll('(?i)<script[^>]*>.*?</script>', '');
        content = content.replaceAll('(?i)<iframe[^>]*>.*?</iframe>', '');
        content = content.replaceAll('(?i)<object[^>]*>.*?</object>', '');
        content = content.replaceAll('(?i)<embed[^>]*>.*?</embed>', '');
        content = content.replaceAll('(?i)<form[^>]*>.*?</form>', '');
        content = content.replaceAll('(?i)javascript:', '');
        content = content.replaceAll('(?i)on\\w+\\s*=', '');
        
        return content;
    }
    
    /**
     * @description Check if current user has admin permissions
     * @return True if user has admin permissions
     */
    private static Boolean hasAdminPermissions() {
        // Check if user has Blog Admin permission set or is System Administrator
        List<PermissionSetAssignment> permissions = [
            SELECT Id 
            FROM PermissionSetAssignment 
            WHERE AssigneeId = :UserInfo.getUserId() 
            AND (PermissionSet.Name = 'Blog_Admin' OR PermissionSet.Profile.Name = 'System Administrator')
        ];
        
        return !permissions.isEmpty();
    }
    
    /**
     * @description Wrapper class for comment statistics
     */
    public class CommentStats {
        @AuraEnabled public Integer approvedCount { get; set; }
        @AuraEnabled public Integer pendingCount { get; set; }
        @AuraEnabled public Integer rejectedCount { get; set; }
        
        public CommentStats() {
            this.approvedCount = 0;
            this.pendingCount = 0;
            this.rejectedCount = 0;
        }
    }
}