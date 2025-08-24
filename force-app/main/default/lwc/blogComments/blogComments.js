import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getCommentsForPost from '@salesforce/apex/BlogCommentController.getCommentsForPost';
import submitComment from '@salesforce/apex/BlogCommentController.submitComment';
import getCommentStats from '@salesforce/apex/BlogCommentController.getCommentStats';
import moderateComment from '@salesforce/apex/BlogCommentController.moderateComment';
import deleteComment from '@salesforce/apex/BlogCommentController.deleteComment';
import getPendingComments from '@salesforce/apex/BlogCommentController.getPendingComments';

export default class BlogComments extends LightningElement {
    @api blogPostId;
    @api showAdminActions = false;
    @api showAdminStats = false;
    @api commentsPerPage = 10;

    @track comments = [];
    @track commentStats = { approvedCount: 0, pendingCount: 0, rejectedCount: 0 };
    @track newComment = {
        Author_Name__c: '',
        Author_Email__c: '',
        Comment_Text__c: '',
        Blog_Post__c: ''
    };
    @track isLoading = false;
    @track isLoadingMore = false;
    @track error;
    @track showSuccessMessage = false;
    @track currentPage = 1;
    @track hasMoreComments = false;

    wiredCommentsResult;
    wiredStatsResult;

    // Wire methods
    @wire(getCommentsForPost, { blogPostId: '$blogPostId' })
    wiredComments(result) {
        this.wiredCommentsResult = result;
        if (result.data) {
            this.comments = result.data.map(comment => ({
                ...comment,
                isPending: comment.Status__c === 'Pending',
                statusBadgeClass: this.getStatusBadgeClass(comment.Status__c)
            }));
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error.body?.message || 'Error loading comments';
            this.comments = [];
        }
    }

    @wire(getCommentStats, { blogPostId: '$blogPostId' })
    wiredCommentStats(result) {
        this.wiredStatsResult = result;
        if (result.data) {
            this.commentStats = result.data;
        } else if (result.error) {
            console.error('Error loading comment stats:', result.error);
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        if (this.blogPostId) {
            this.newComment.Blog_Post__c = this.blogPostId;
        }
    }

    // Computed properties
    get hasComments() {
        return this.comments && this.comments.length > 0;
    }

    get totalComments() {
        return this.commentStats.approvedCount || 0;
    }

    get approvedCommentsCount() {
        return this.comments ? this.comments.length : 0;
    }

    get commentsLabel() {
        return this.approvedCommentsCount === 1 ? 'comment' : 'comments';
    }

    get commentTextLength() {
        return this.newComment.Comment_Text__c ? this.newComment.Comment_Text__c.length : 0;
    }

    get isSubmitDisabled() {
        return !this.newComment.Author_Name__c || 
               !this.newComment.Author_Email__c || 
               !this.newComment.Comment_Text__c || 
               this.isLoading;
    }

    get showLoadMore() {
        return this.hasMoreComments && !this.isLoading;
    }

    // Event handlers
    handleAuthorNameChange(event) {
        this.newComment.Author_Name__c = event.target.value;
    }

    handleAuthorEmailChange(event) {
        this.newComment.Author_Email__c = event.target.value;
    }

    handleCommentTextChange(event) {
        this.newComment.Comment_Text__c = event.target.value;
    }

    async handleSubmitComment(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const commentData = {
                ...this.newComment,
                Blog_Post__c: this.blogPostId
            };

            await submitComment({ comment: commentData });
            
            // Clear form
            this.newComment = {
                Author_Name__c: '',
                Author_Email__c: '',
                Comment_Text__c: '',
                Blog_Post__c: this.blogPostId
            };

            // Show success message
            this.showSuccessMessage = true;
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 5000);

            // Refresh comments and stats
            await this.refreshData();

        } catch (error) {
            console.error('Error submitting comment:', error);
            this.error = error.body?.message || 'Failed to submit comment. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }

    async handleModerateComment(event) {
        const commentId = event.target.dataset.commentId;
        const action = event.detail.value;
        
        if (!commentId || !action) return;

        this.isLoading = true;
        this.error = null;

        try {
            await moderateComment({ 
                commentId: commentId, 
                action: action 
            });

            // Refresh data
            await this.refreshData();

        } catch (error) {
            console.error('Error moderating comment:', error);
            this.error = error.body?.message || 'Failed to moderate comment';
        } finally {
            this.isLoading = false;
        }
    }

    async handleDeleteComment(event) {
        const commentId = event.target.dataset.commentId;
        
        if (!commentId) return;

        const confirmed = await this.showConfirmDialog(
            'Delete Comment', 
            'Are you sure you want to delete this comment? This action cannot be undone.'
        );

        if (!confirmed) return;

        this.isLoading = true;
        this.error = null;

        try {
            await deleteComment({ commentId: commentId });

            // Refresh data
            await this.refreshData();

        } catch (error) {
            console.error('Error deleting comment:', error);
            this.error = error.body?.message || 'Failed to delete comment';
        } finally {
            this.isLoading = false;
        }
    }

    handleLoadMore() {
        // Implementation for loading more comments
        // This would require pagination support in the Apex controller
        this.currentPage++;
        this.loadMoreComments();
    }

    handleCloseSuccess() {
        this.showSuccessMessage = false;
    }

    // Private methods
    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        // Additional email validation
        if (this.newComment.Author_Email__c && !this.isValidEmail(this.newComment.Author_Email__c)) {
            this.error = 'Please enter a valid email address';
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async refreshData() {
        // Refresh comments
        await refreshApex(this.wiredCommentsResult);
        
        // Refresh stats if admin
        if (this.showAdminStats) {
            await refreshApex(this.wiredStatsResult);
        }
    }

    async loadMoreComments() {
        this.isLoadingMore = true;
        
        try {
            // Implementation for loading additional comments
            // This would require modifications to the Apex controller for pagination
            
        } catch (error) {
            console.error('Error loading more comments:', error);
            this.error = error.body?.message || 'Failed to load more comments';
        } finally {
            this.isLoadingMore = false;
        }
    }

    getStatusBadgeClass(status) {
        const baseClass = 'slds-badge';
        switch (status) {
            case 'Approved':
                return `${baseClass} slds-theme_success`;
            case 'Pending':
                return `${baseClass} slds-theme_warning`;
            case 'Rejected':
                return `${baseClass} slds-theme_error`;
            default:
                return baseClass;
        }
    }

    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    // Public API methods
    @api
    refreshComments() {
        return this.refreshData();
    }

    @api
    scrollToComments() {
        const commentsSection = this.template.querySelector('.blog-comments');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    @api
    focusCommentForm() {
        const nameInput = this.template.querySelector('#author-name');
        if (nameInput) {
            nameInput.focus();
        }
    }
}
