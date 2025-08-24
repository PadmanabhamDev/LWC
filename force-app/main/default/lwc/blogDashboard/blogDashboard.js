import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
// import getBlogPosts from '@salesforce/apex/BlogPostController.getBlogPosts';
// import getCategories from '@salesforce/apex/BlogPostController.getCategories';
// import getPopularTags from '@salesforce/apex/BlogPostController.getPopularTags';
// import getPendingComments from '@salesforce/apex/BlogCommentController.getPendingComments';
// import deleteBlogPost from '@salesforce/apex/BlogPostController.deleteBlogPost';
// import saveBlogPost from '@salesforce/apex/BlogPostController.saveBlogPost';

export default class BlogDashboard extends NavigationMixin(LightningElement) {
    @track dashboardStats = {
        totalPosts: 0,
        publishedPosts: 0,
        totalViews: 0,
        pendingComments: 0,
        postsChange: '+0',
        publishedChange: '+0',
        viewsChange: '+0'
    };
    
    @track recentPosts = [];
    @track categories = [];
    @track popularTags = [];
    @track recentActivity = [];
    @track pendingComments = [];
    @track isLoading = true;
    @track error;

    wiredPostsResult;
    wiredCategoriesResult;
    wiredTagsResult;
    wiredCommentsResult;

    // Wire methods
    // @wire(getBlogPosts, { pageSize: 10, pageNumber: 1, categoryId: '' })
    // wiredPosts(result) {
    //     this.wiredPostsResult = result;
    //     if (result.data) {
    //         this.processPostsData(result.data);
    //         this.error = undefined;
    //     } else if (result.error) {
    //         this.error = result.error.body?.message || 'Error loading posts';
    //         console.error('Error loading posts:', result.error);
    //     }
    // }

    // @wire(getCategories)
    // wiredCategories(result) {
    //     this.wiredCategoriesResult = result;
    //     if (result.data) {
    //         this.categories = result.data.map(category => ({
    //             ...category,
    //             postCount: 0 // Will be calculated from posts data
    //         }));
    //     } else if (result.error) {
    //         console.error('Error loading categories:', result.error);
    //     }
    // }

    // @wire(getPopularTags)
    // wiredTags(result) {
    //     this.wiredTagsResult = result;
    //     if (result.data) {
    //         this.popularTags = result.data.map(tag => ({
    //             ...tag,
    //             displayName: `${tag.Name} (${tag.Usage_Count__c})`
    //         }));
    //     } else if (result.error) {
    //         console.error('Error loading tags:', result.error);
    //     }
    // }

    // @wire(getPendingComments)
    // wiredComments(result) {
    //     this.wiredCommentsResult = result;
    //     if (result.data) {
    //         this.pendingComments = result.data;
    //         this.dashboardStats.pendingComments = result.data.length;
    //         this.generateRecentActivity();
    //     } else if (result.error) {
    //         console.error('Error loading comments:', result.error);
    //     }
        
    //     // Set loading to false after all data is loaded
    //     this.isLoading = false;
    // }

    // Computed properties
    get hasRecentPosts() {
        return this.recentPosts && this.recentPosts.length > 0;
    }

    get hasCategories() {
        return this.categories && this.categories.length > 0;
    }

    get hasPopularTags() {
        return this.popularTags && this.popularTags.length > 0;
    }

    get hasRecentActivity() {
        return this.recentActivity && this.recentActivity.length > 0;
    }

    get noPendingComments() {
        return this.dashboardStats.pendingComments === 0;
    }

    // Event handlers
    handleCreatePost() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostEditor'
            }
        });
    }

    handleRefresh() {
        this.isLoading = true;
        this.refreshAllData();
    }

    handleViewAllPosts() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostList'
            }
        });
    }

    handlePostClick(event) {
        const slug = event.target.dataset.slug;
        this.navigateToPost(slug);
    }

    async handlePostAction(event) {
        const action = event.detail.value;
        const postId = event.target.dataset.postId;
        const postSlug = event.target.dataset.postSlug;

        try {
            switch (action) {
                case 'edit':
                    this.navigateToEditor(postSlug);
                    break;
                case 'view':
                    this.navigateToPost(postSlug);
                    break;
                case 'publish':
                    await this.publishPost(postId);
                    break;
                case 'delete':
                    await this.deletePost(postId);
                    break;
            }
        } catch (error) {
            this.showToast('Error', error.message, 'error');
        }
    }

    handleReviewComments() {
        this.handleModerateComments();
    }

    handleManageCategories() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Blog_Category__c',
                actionName: 'list'
            }
        });
    }

    handleModerateComments() {
        // Navigate to a comments moderation view
        this.showToast('Info', 'Comment moderation feature coming soon!', 'info');
    }

    handleViewAnalytics() {
        this.showToast('Info', 'Analytics dashboard coming soon!', 'info');
    }

    handleExportPosts() {
        this.showToast('Info', 'Export functionality coming soon!', 'info');
    }

    handleTagClick(event) {
        const tagName = event.target.dataset.tag;
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogSearch'
            },
            state: {
                c__searchTerm: tagName,
                c__searchType: 'tag'
            }
        });
    }

    // Private methods
    processPostsData(data) {
        const posts = data.posts || [];
        const totalViews = posts.reduce((sum, post) => sum + (post.View_Count__c || 0), 0);
        const publishedPosts = posts.filter(post => post.Status__c === 'Published');
        
        // Update dashboard stats
        this.dashboardStats = {
            ...this.dashboardStats,
            totalPosts: data.totalCount || 0,
            publishedPosts: publishedPosts.length,
            totalViews: totalViews,
            postsChange: this.calculateChange(data.totalCount, 'posts'),
            publishedChange: this.calculateChange(publishedPosts.length, 'published'),
            viewsChange: this.calculateChange(totalViews, 'views')
        };

        // Process recent posts
        this.recentPosts = posts.slice(0, 5).map(post => ({
            ...post,
            statusClass: this.getStatusClass(post.Status__c),
            canPublish: post.Status__c === 'Draft'
        }));

        // Update category post counts
        this.updateCategoryPostCounts(posts);
    }

    updateCategoryPostCounts(posts) {
        const categoryCounts = {};
        posts.forEach(post => {
            if (post.Category__c) {
                categoryCounts[post.Category__c] = (categoryCounts[post.Category__c] || 0) + 1;
            }
        });

        this.categories = this.categories.map(category => ({
            ...category,
            postCount: categoryCounts[category.Id] || 0
        }));
    }

    calculateChange(currentValue, type) {
        // In a real implementation, you would compare with previous period data
        // For now, returning mock change indicators
        const changes = {
            posts: ['+2', '+5', '+1', '+3'],
            published: ['+1', '+2', '+0', '+1'],
            views: ['+15', '+32', '+8', '+21']
        };
        
        const typeChanges = changes[type] || ['+0'];
        return typeChanges[Math.floor(Math.random() * typeChanges.length)];
    }

    getStatusClass(status) {
        const baseClass = 'slds-badge';
        switch (status) {
            case 'Published':
                return `${baseClass} slds-theme_success`;
            case 'Draft':
                return `${baseClass} slds-theme_warning`;
            case 'Archived':
                return `${baseClass} slds-theme_default`;
            default:
                return baseClass;
        }
    }

    generateRecentActivity() {
        const activities = [];
        
        // Add recent posts activity
        this.recentPosts.slice(0, 3).forEach(post => {
            activities.push({
                id: `post-${post.Id}`,
                icon: post.Status__c === 'Published' ? 'utility:success' : 'utility:edit',
                description: `${post.Status__c === 'Published' ? 'Published' : 'Updated'} "${post.Name}"`,
                timestamp: post.LastModifiedDate
            });
        });

        // Add recent comments activity
        this.pendingComments.slice(0, 2).forEach(comment => {
            activities.push({
                id: `comment-${comment.Id}`,
                icon: 'utility:comments',
                description: `New comment from ${comment.Author_Name__c} on "${comment.Blog_Post__r?.Name}"`,
                timestamp: comment.Posted_Date__c
            });
        });

        // Sort by timestamp
        this.recentActivity = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
    }

    async publishPost(postId) {
        try {
            const post = this.recentPosts.find(p => p.Id === postId);
            if (post) {
                post.Status__c = 'Published';
                post.Published_Date__c = new Date().toISOString();
                
                await saveBlogPost({ post: post });
                this.showToast('Success', 'Post published successfully!', 'success');
                this.refreshAllData();
            }
        } catch (error) {
            throw new Error(error.body?.message || 'Failed to publish post');
        }
    }

    async deletePost(postId) {
        const confirmed = confirm('Are you sure you want to delete this post? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await deleteBlogPost({ postId: postId });
            this.showToast('Success', 'Post deleted successfully!', 'success');
            this.refreshAllData();
        } catch (error) {
            throw new Error(error.body?.message || 'Failed to delete post');
        }
    }

    navigateToPost(slug) {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostDetail'
            },
            state: {
                c__slug: slug
            }
        });
    }

    navigateToEditor(slug) {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostEditor'
            },
            state: {
                c__slug: slug
            }
        });
    }

    async refreshAllData() {
        try {
            await Promise.all([
                refreshApex(this.wiredPostsResult),
                refreshApex(this.wiredCategoriesResult),
                refreshApex(this.wiredTagsResult),
                refreshApex(this.wiredCommentsResult)
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showToast('Error', 'Failed to refresh dashboard data', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Public API methods
    refreshDashboard() {
        this.handleRefresh();
    }
}
