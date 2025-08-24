import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
i//mport getBlogPostBySlug from '@salesforce/apex/BlogPostController.getBlogPostBySlug';

export default class BlogPostDetail extends NavigationMixin(LightningElement) {
    @api recordId;
   // @api showRelatedPosts = true;

    @track blogPost;
    @track isLoading = true;
    @track error;
    @track showBackToTop = false;
    @track showToast = false;
    @track toastMessage = '';
    @track toastType = '';

    slug;
    currentUrl;

    // Wire current page reference to get parameters
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.slug = currentPageReference.state?.c__slug;
            if (this.slug) {
                this.loadBlogPost();
            }
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        // Set up scroll listener for back to top button
        window.addEventListener('scroll', this.handleScroll.bind(this));
        this.currentUrl = window.location.href;
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    // Computed properties
    get tags() {
        if (this.blogPost?.Tags__c) {
            return this.blogPost.Tags__c.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        return null;
    }

    get categoryStyle() {
        if (this.blogPost?.Category__r?.Color__c) {
            return `background-color: ${this.blogPost.Category__r.Color__c}; color: white;`;
        }
        return 'background-color: #0176d3; color: white;';
    }

    get toastClass() {
        const baseClass = 'slds-notify slds-notify_toast';
        switch (this.toastType) {
            case 'success':
                return `${baseClass} slds-theme_success`;
            case 'error':
                return `${baseClass} slds-theme_error`;
            case 'warning':
                return `${baseClass} slds-theme_warning`;
            default:
                return `${baseClass} slds-theme_info`;
        }
    }

    get toastIcon() {
        switch (this.toastType) {
            case 'success':
                return 'utility:success';
            case 'error':
                return 'utility:error';
            case 'warning':
                return 'utility:warning';
            default:
                return 'utility:info';
        }
    }

    // Event handlers
    handleBackToBlog() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostList'
            }
        });
    }

    handleTagClick(event) {
        const tag = event.target.dataset.tag;
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogSearch'
            },
            state: {
                c__searchTerm: tag,
                c__searchType: 'tag'
            }
        });
    }

    handleShare() {
        if (navigator.share) {
            navigator.share({
                title: this.blogPost.Name,
                text: this.blogPost.Excerpt__c,
                url: this.currentUrl
            }).catch(console.error);
        } else {
            this.handleCopyLink();
        }
    }

    handleTwitterShare() {
        const text = encodeURIComponent(`${this.blogPost.Name} - ${this.blogPost.Excerpt__c}`);
        const url = encodeURIComponent(this.currentUrl);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }

    handleFacebookShare() {
        const url = encodeURIComponent(this.currentUrl);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }

    handleLinkedInShare() {
        const url = encodeURIComponent(this.currentUrl);
        const title = encodeURIComponent(this.blogPost.Name);
        const summary = encodeURIComponent(this.blogPost.Excerpt__c);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    }

    async handleCopyLink() {
        try {
            await navigator.clipboard.writeText(this.currentUrl);
            this.showToastMessage('Link copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = this.currentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToastMessage('Link copied to clipboard!', 'success');
        }
    }

    handleBackToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handleScroll() {
        this.showBackToTop = window.pageYOffset > 300;
    }

    handleCloseToast() {
        this.showToast = false;
    }

    // Private methods
    async loadBlogPost() {
        if (!this.slug) {
            this.error = 'No blog post specified';
            this.isLoading = false;
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            this.blogPost = await getBlogPostBySlug({ urlSlug: this.slug });
            
            // Update page title and meta description for SEO
            this.updatePageMeta();
            
        } catch (error) {
            console.error('Error loading blog post:', error);
            this.error = error.body?.message || 'Blog post not found';
            this.blogPost = null;
        } finally {
            this.isLoading = false;
        }
    }

    updatePageMeta() {
        if (this.blogPost) {
            // Update page title
            document.title = this.blogPost.SEO_Title__c || this.blogPost.Name;
            
            // Update meta description
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                document.head.appendChild(metaDescription);
            }
            metaDescription.content = this.blogPost.SEO_Description__c || this.blogPost.Excerpt__c;
            
            // Update Open Graph tags
            this.updateOpenGraphTags();
        }
    }

    updateOpenGraphTags() {
        const ogTags = [
            { property: 'og:title', content: this.blogPost.Name },
            { property: 'og:description', content: this.blogPost.Excerpt__c },
            { property: 'og:url', content: this.currentUrl },
            { property: 'og:type', content: 'article' }
        ];

        if (this.blogPost.Featured_Image_URL__c) {
            ogTags.push({ property: 'og:image', content: this.blogPost.Featured_Image_URL__c });
        }

        ogTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', tag.property);
                document.head.appendChild(metaTag);
            }
            metaTag.content = tag.content;
        });
    }

    showToastMessage(message, type = 'info') {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }

    // Public API methods
    @api
    loadPostBySlug(slug) {
        this.slug = slug;
        this.loadBlogPost();
    }

    @api
    refresh() {
        this.loadBlogPost();
    }
}
