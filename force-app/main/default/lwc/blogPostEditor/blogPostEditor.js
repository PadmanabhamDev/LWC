import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import saveBlogPost from '@salesforce/apex/BlogPostController.saveBlogPost';
import deleteBlogPost from '@salesforce/apex/BlogPostController.deleteBlogPost';
import getBlogPostBySlug from '@salesforce/apex/BlogPostController.getBlogPostBySlug';
import getCategories from '@salesforce/apex/BlogPostController.getCategories';
import USER_ID from '@salesforce/user/Id';

export default class BlogPostEditor extends NavigationMixin(LightningElement) {
    @api recordId;

    @track blogPost = {
        Name: '',
        Content__c: '',
        Excerpt__c: '',
        Featured_Image_URL__c: '',
        Category__c: '',
        Tags__c: '',
        Status__c: 'Draft',
        Published_Date__c: null,
        Author__c: USER_ID,
        SEO_Title__c: '',
        SEO_Description__c: '',
        URL_Slug__c: ''
    };

    @track categories = [];
    @track isLoading = false;
    @track error;
    @track isEditMode = false;

    slug;
    @track authorName = '';

    // Status options for the combobox
    statusOptions = [
        { label: 'Draft', value: 'Draft' },
        { label: 'Published', value: 'Published' },
        { label: 'Archived', value: 'Archived' }
    ];

    // Wire current page reference to get parameters
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.slug = currentPageReference.state?.c__slug;
            const postId = currentPageReference.state?.c__recordId;
            
            if (this.slug) {
                this.loadBlogPostBySlug();
            } else if (postId || this.recordId) {
                this.blogPost.Id = postId || this.recordId;
                this.isEditMode = true;
                this.loadBlogPost();
            }
        }
    }

    // Wire categories
    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categories = data.map(category => ({
                label: category.Name,
                value: category.Id
            }));
        } else if (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        // Auto-save draft every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty && this.blogPost.Name && this.blogPost.Content__c) {
                this.handleAutoSave();
            }
        }, 30000);
    }

    disconnectedCallback() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    // Computed properties
    get pageTitle() {
        return this.isEditMode ? 'Edit Blog Post' : 'Create New Blog Post';
    }

    get saveButtonLabel() {
        if (this.blogPost.Status__c === 'Published') {
            return this.isEditMode ? 'Update & Publish' : 'Publish';
        }
        return this.isEditMode ? 'Update Draft' : 'Save Draft';
    }

    get showDeleteButton() {
        return this.isEditMode && this.blogPost.Id;
    }

    get showPublishedDate() {
        return this.blogPost.Status__c === 'Published';
    }

    get showStatistics() {
        return this.isEditMode && this.blogPost.Id;
    }

    get isPreviewDisabled() {
        return !this.blogPost.Name || !this.blogPost.Content__c;
    }

    get isSaveDisabled() {
        return !this.blogPost.Name || !this.blogPost.Content__c || this.isLoading;
    }

    get categoryOptions() {
        return [
            { label: '-- Select Category --', value: '' },
            ...this.categories
        ];
    }

    get publishedDateValue() {
        if (this.blogPost.Published_Date__c) {
            // Convert to local datetime format for input
            const date = new Date(this.blogPost.Published_Date__c);
            return date.toISOString().slice(0, 16);
        }
        return '';
    }

    get seoTitleLength() {
        return this.blogPost.SEO_Title__c ? this.blogPost.SEO_Title__c.length : 0;
    }

    get seoDescriptionLength() {
        return this.blogPost.SEO_Description__c ? this.blogPost.SEO_Description__c.length : 0;
    }

    get isDirty() {
        // Simple dirty check - in production, you might want more sophisticated change tracking
        return this.blogPost.Name || this.blogPost.Content__c || this.blogPost.Excerpt__c;
    }

    // Event handlers
    handleTitleChange(event) {
        this.blogPost.Name = event.target.value;
        
        // Auto-generate slug if not manually set
        if (!this.manualSlugSet) {
            this.generateSlug();
        }
        
        // Auto-generate SEO title if not manually set
        if (!this.blogPost.SEO_Title__c) {
            this.blogPost.SEO_Title__c = event.target.value;
        }
    }

    handleSlugChange(event) {
        this.blogPost.URL_Slug__c = event.target.value;
        this.manualSlugSet = true;
    }

    handleExcerptChange(event) {
        this.blogPost.Excerpt__c = event.target.value;
        
        // Auto-generate SEO description if not manually set
        if (!this.blogPost.SEO_Description__c) {
            this.blogPost.SEO_Description__c = event.target.value;
        }
    }

    handleContentChange(event) {
        this.blogPost.Content__c = event.target.value;
    }

    handleStatusChange(event) {
        this.blogPost.Status__c = event.target.value;
        
        // Set published date when changing to published
        if (event.target.value === 'Published' && !this.blogPost.Published_Date__c) {
            this.blogPost.Published_Date__c = new Date().toISOString();
        }
    }

    handlePublishedDateChange(event) {
        this.blogPost.Published_Date__c = event.target.value ? new Date(event.target.value).toISOString() : null;
    }

    handleCategoryChange(event) {
        this.blogPost.Category__c = event.target.value;
    }

    handleTagsChange(event) {
        this.blogPost.Tags__c = event.target.value;
    }

    handleFeaturedImageChange(event) {
        this.blogPost.Featured_Image_URL__c = event.target.value;
    }

    handleSeoTitleChange(event) {
        this.blogPost.SEO_Title__c = event.target.value;
    }

    handleSeoDescriptionChange(event) {
        this.blogPost.SEO_Description__c = event.target.value;
    }

    handleImageError(event) {
        event.target.style.display = 'none';
        this.showToast('Error', 'Failed to load image. Please check the URL.', 'error');
    }

    handleBackToPosts() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostList'
            }
        });
    }

    handlePreview() {
        if (this.blogPost.URL_Slug__c) {
            const url = `/blog/${this.blogPost.URL_Slug__c}`;
            window.open(url, '_blank');
        } else {
            this.showToast('Preview Unavailable', 'Please save the post first to generate a preview URL.', 'warning');
        }
    }

    async handleSave() {
        await this.saveBlogPost();
    }

    async handleAutoSave() {
        // Only auto-save drafts
        const originalStatus = this.blogPost.Status__c;
        this.blogPost.Status__c = 'Draft';
        
        try {
            await this.saveBlogPost(true);
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            this.blogPost.Status__c = originalStatus;
        }
    }

    async handleDelete() {
        const result = await this.showConfirmDialog('Delete Post', 'Are you sure you want to delete this blog post? This action cannot be undone.');
        
        if (result) {
            this.isLoading = true;
            
            try {
                await deleteBlogPost({ postId: this.blogPost.Id });
                this.showToast('Success', 'Blog post deleted successfully.', 'success');
                this.handleBackToPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                this.showToast('Error', error.body?.message || 'Failed to delete blog post.', 'error');
            } finally {
                this.isLoading = false;
            }
        }
    }

    // Private methods
    async loadBlogPost() {
        this.isLoading = true;
        this.error = null;

        try {
            // In a real implementation, you'd load by ID
            // For now, we'll use the existing slug method
            if (this.blogPost.Id) {
                // Load existing post logic would go here
                this.isEditMode = true;
            }
        } catch (error) {
            console.error('Error loading blog post:', error);
            this.error = error.body?.message || 'Failed to load blog post';
        } finally {
            this.isLoading = false;
        }
    }

    async loadBlogPostBySlug() {
        this.isLoading = true;
        this.error = null;

        try {
            const post = await getBlogPostBySlug({ urlSlug: this.slug });
            this.blogPost = { ...post };
            this.isEditMode = true;
            this.manualSlugSet = true;
        } catch (error) {
            console.error('Error loading blog post:', error);
            this.error = error.body?.message || 'Failed to load blog post';
        } finally {
            this.isLoading = false;
        }
    }

    async saveBlogPost(isAutoSave = false) {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;

        try {
            // Prepare post data
            const postData = { ...this.blogPost };
            
            // Clean up data
            if (!postData.Category__c) {
                postData.Category__c = null;
            }

            const savedPost = await saveBlogPost({ post: postData });
            
            this.blogPost = { ...savedPost };
            this.isEditMode = true;

            if (!isAutoSave) {
                const message = postData.Status__c === 'Published' ? 'Blog post published successfully!' : 'Blog post saved successfully!';
                this.showToast('Success', message, 'success');
                
                // Navigate to the post detail page if published
                if (postData.Status__c === 'Published' && savedPost.URL_Slug__c) {
                    setTimeout(() => {
                        this[NavigationMixin.Navigate]({
                            type: 'standard__component',
                            attributes: {
                                componentName: 'c__blogPostDetail'
                            },
                            state: {
                                c__slug: savedPost.URL_Slug__c
                            }
                        });
                    }, 1000);
                }
            }

        } catch (error) {
            console.error('Error saving blog post:', error);
            this.showToast('Error', error.body?.message || 'Failed to save blog post.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    validateForm() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-textarea, lightning-input-rich-text, lightning-combobox');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    generateSlug() {
        if (this.blogPost.Name) {
            this.blogPost.URL_Slug__c = this.blogPost.Name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '');
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

    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    // Public API methods
    @api
    loadPost(postId) {
        this.blogPost.Id = postId;
        this.isEditMode = true;
        this.loadBlogPost();
    }

    @api
    createNewPost() {
        this.blogPost = {
            Name: '',
            Content__c: '',
            Excerpt__c: '',
            Featured_Image_URL__c: '',
            Category__c: '',
            Tags__c: '',
            Status__c: 'Draft',
            Published_Date__c: null,
            Author__c: USER_ID,
            SEO_Title__c: '',
            SEO_Description__c: '',
            URL_Slug__c: ''
        };
        this.isEditMode = false;
        this.manualSlugSet = false;
    }
}