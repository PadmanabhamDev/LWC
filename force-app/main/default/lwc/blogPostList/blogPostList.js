import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import getBlogPosts from '@salesforce/apex/BlogPostController.getBlogPosts';
import getCategories from '@salesforce/apex/BlogPostController.getCategories';

export default class BlogPostList extends NavigationMixin(LightningElement) {
    @api pageTitle = 'Latest Blog Posts';
    @api pageDescription = 'Discover our latest articles and insights';
    @api showCreateButton = false;
    @api pageSize = 9;

    @track blogPosts = [];
    @track categories = [];
    @track selectedCategoryId = '';
    @track currentPage = 1;
    @track totalRecords = 0;
    @track isLoading = true;
    @track error;

    // Wired methods
    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categories = data.map(category => ({
                ...category,
                variant: this.selectedCategoryId === category.Id ? 'brand' : 'neutral'
            }));
        } else if (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        this.loadBlogPosts();
    }

    // Computed properties
    get hasPosts() {
        return this.blogPosts && this.blogPosts.length > 0;
    }

    get allCategoriesVariant() {
        return this.selectedCategoryId === '' ? 'brand' : 'neutral';
    }

    get noBlogPostsMessage() {
        if (this.selectedCategoryId) {
            return 'No posts found in this category. Try browsing other categories.';
        }
        return 'There are no published blog posts yet. Check back soon for new content!';
    }

    get showPagination() {
        return this.totalRecords > this.pageSize;
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get startRecord() {
        return this.totalRecords === 0 ? 0 : ((this.currentPage - 1) * this.pageSize) + 1;
    }

    get endRecord() {
        const end = this.currentPage * this.pageSize;
        return end > this.totalRecords ? this.totalRecords : end;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const current = this.currentPage;
        
        // Show up to 5 page numbers
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, start + 4);
        
        // Adjust start if we're near the end
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }

        for (let i = start; i <= end; i++) {
            pages.push({
                number: i,
                variant: i === current ? 'brand' : 'neutral'
            });
        }

        return pages;
    }

    // Event handlers
    handleCategoryFilter(event) {
        const categoryId = event.target.dataset.category;
        this.selectedCategoryId = categoryId;
        this.currentPage = 1;
        this.updateCategoryVariants();
        this.loadBlogPosts();
    }

    handlePostClick(event) {
        event.preventDefault();
        const slug = event.target.dataset.slug;
        this.navigateToPost(slug);
    }

    handleCreatePost() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostEditor'
            }
        });
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadBlogPosts();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadBlogPosts();
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.loadBlogPosts();
        }
    }

    // Private methods
    async loadBlogPosts() {
        this.isLoading = true;
        this.error = null;

        try {
            const result = await getBlogPosts({
                pageSize: this.pageSize,
                pageNumber: this.currentPage,
                categoryId: this.selectedCategoryId
            });

            this.blogPosts = result.posts.map(post => ({
                ...post,
                categoryStyle: this.getCategoryStyle(post.Category__r?.Color__c)
            }));
            this.totalRecords = result.totalCount;

        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.error = error.body?.message || 'An error occurred while loading blog posts';
            this.blogPosts = [];
            this.totalRecords = 0;
        } finally {
            this.isLoading = false;
        }
    }

    updateCategoryVariants() {
        this.categories = this.categories.map(category => ({
            ...category,
            variant: this.selectedCategoryId === category.Id ? 'brand' : 'neutral'
        }));
    }

    getCategoryStyle(color) {
        if (color) {
            return `background-color: ${color}; color: white;`;
        }
        return 'background-color: #0176d3; color: white;';
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

    // Public methods for external refresh
    @api
    refresh() {
        this.currentPage = 1;
        this.loadBlogPosts();
        return refreshApex(this.wiredCategoriesResult);
    }
}