import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import searchBlogPosts from '@salesforce/apex/BlogSearchController.searchBlogPosts';
import getBlogPostsByTag from '@salesforce/apex/BlogSearchController.getBlogPostsByTag';
import getSearchSuggestions from '@salesforce/apex/BlogSearchController.getSearchSuggestions';
import getRecentSearches from '@salesforce/apex/BlogSearchController.getRecentSearches';
import getCategories from '@salesforce/apex/BlogPostController.getCategories';
import getPopularTags from '@salesforce/apex/BlogPostController.getPopularTags';

export default class BlogSearch extends NavigationMixin(LightningElement) {
    @api pageSize = 12;

    @track searchTerm = '';
    @track selectedCategory = '';
    @track searchResults = [];
    @track totalResults = 0;
    @track currentPage = 1;
    @track isLoading = false;
    @track error;
    @track hasSearched = false;
    @track suggestions = [];
    @track showSuggestions = false;
    @track recentSearches = [];
    @track popularTags = [];
    @track categories = [];
    @track searchDuration;
    @track sortBy = 'date-desc';

    searchTimeout;
    searchStartTime;

    // Wire current page reference to get parameters
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const searchTerm = currentPageReference.state?.c__searchTerm;
            const searchType = currentPageReference.state?.c__searchType;
            
            if (searchTerm) {
                this.searchTerm = searchTerm;
                
                if (searchType === 'tag') {
                    this.handleTagSearch(null, searchTerm);
                } else {
                    this.performSearch();
                }
            }
        }
    }

    // Wire methods
    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            this.categories = [
                { label: 'All Categories', value: '' },
                ...data.map(category => ({
                    label: category.Name,
                    value: category.Id
                }))
            ];
        } else if (error) {
            console.error('Error loading categories:', error);
        }
    }

    @wire(getPopularTags)
    wiredPopularTags({ error, data }) {
        if (data) {
            this.popularTags = data;
        } else if (error) {
            console.error('Error loading popular tags:', error);
        }
    }

    @wire(getRecentSearches)
    wiredRecentSearches({ error, data }) {
        if (data) {
            this.recentSearches = data;
        } else if (error) {
            console.error('Error loading recent searches:', error);
        }
    }

    // Lifecycle hooks
    connectedCallback() {
        // Hide suggestions when clicking outside
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleDocumentClick.bind(this));
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }

    // Computed properties
    get categoryOptions() {
        return this.categories;
    }

    get hasResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get showNoResults() {
        return this.hasSearched && !this.isLoading && !this.hasResults && !this.error;
    }

    get showRecentSearches() {
        return !this.hasSearched && this.recentSearches && this.recentSearches.length > 0;
    }

    get searchResultsText() {
        if (this.searchTerm) {
            return `for "${this.searchTerm}"`;
        }
        return '';
    }

    get resultsLabel() {
        return this.totalResults === 1 ? 'result' : 'results';
    }

    get isSearchDisabled() {
        return this.isLoading || (!this.searchTerm?.trim() && !this.selectedCategory);
    }

    get showPagination() {
        return this.totalResults > this.pageSize;
    }

    get totalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const current = this.currentPage;
        
        let start = Math.max(1, current - 2);
        let end = Math.min(totalPages, start + 4);
        
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
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Show suggestions after typing
        if (this.searchTerm && this.searchTerm.length >= 2) {
            this.searchTimeout = setTimeout(() => {
                this.loadSuggestions();
            }, 300);
        } else {
            this.showSuggestions = false;
        }
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        } else if (event.key === 'Escape') {
            this.showSuggestions = false;
        }
    }

    handleClearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.hasSearched = false;
        this.showSuggestions = false;
        this.error = null;
        this.currentPage = 1;
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
    }

    handleSearch() {
        if (this.searchTerm?.trim() || this.selectedCategory) {
            this.currentPage = 1;
            this.showSuggestions = false;
            this.performSearch();
        }
    }

    handleSuggestionClick(event) {
        const suggestion = event.target.dataset.suggestion;
        this.searchTerm = suggestion;
        this.showSuggestions = false;
        this.performSearch();
    }

    handleRecentSearchClick(event) {
        const search = event.target.dataset.search;
        this.searchTerm = search;
        this.performSearch();
    }

    handleTagSearch(event, tagName) {
        const tag = tagName || event.target.dataset.tag;
        this.searchByTag(tag);
    }

    handlePostClick(event) {
        event.preventDefault();
        const slug = event.target.dataset.slug;
        this.navigateToPost(slug);
    }

    handleBrowseAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__blogPostList'
            }
        });
    }

    handleSortChange(event) {
        this.sortBy = event.detail.value;
        this.sortResults();
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.performSearch();
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.performSearch();
        }
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
            this.performSearch();
        }
    }

    handleDocumentClick(event) {
        const searchContainer = this.template.querySelector('.search-form');
        if (searchContainer && !searchContainer.contains(event.target)) {
            this.showSuggestions = false;
        }
    }

    // Private methods
    async performSearch() {
        if (!this.searchTerm?.trim() && !this.selectedCategory) {
            return;
        }

        this.isLoading = true;
        this.error = null;
        this.searchStartTime = Date.now();

        try {
            const result = await searchBlogPosts({
                searchTerm: this.searchTerm.trim(),
                categoryId: this.selectedCategory,
                pageSize: this.pageSize,
                pageNumber: this.currentPage
            });

            this.searchResults = result.posts.map(post => ({
                ...post,
                categoryStyle: this.getCategoryStyle(post.Category__r?.Color__c)
            }));
            
            this.totalResults = result.totalCount;
            this.hasSearched = true;
            this.searchDuration = Date.now() - this.searchStartTime;

            // Sort results if needed
            this.sortResults();

        } catch (error) {
            console.error('Error searching blog posts:', error);
            this.error = error.body?.message || 'An error occurred while searching';
            this.searchResults = [];
            this.totalResults = 0;
        } finally {
            this.isLoading = false;
        }
    }

    async searchByTag(tagName) {
        this.isLoading = true;
        this.error = null;
        this.searchStartTime = Date.now();

        try {
            const result = await getBlogPostsByTag({
                tagName: tagName,
                pageSize: this.pageSize,
                pageNumber: this.currentPage
            });

            this.searchResults = result.posts.map(post => ({
                ...post,
                categoryStyle: this.getCategoryStyle(post.Category__r?.Color__c)
            }));
            
            this.totalResults = result.totalCount;
            this.hasSearched = true;
            this.searchDuration = Date.now() - this.searchStartTime;
            this.searchTerm = tagName;

        } catch (error) {
            console.error('Error searching by tag:', error);
            this.error = error.body?.message || 'An error occurred while searching by tag';
            this.searchResults = [];
            this.totalResults = 0;
        } finally {
            this.isLoading = false;
        }
    }

    async loadSuggestions() {
        try {
            const suggestions = await getSearchSuggestions({
                partialTerm: this.searchTerm
            });
            
            this.suggestions = suggestions;
            this.showSuggestions = suggestions.length > 0;
        } catch (error) {
            console.error('Error loading suggestions:', error);
            this.showSuggestions = false;
        }
    }

    sortResults() {
        if (!this.searchResults || this.searchResults.length === 0) {
            return;
        }

        this.searchResults = [...this.searchResults].sort((a, b) => {
            switch (this.sortBy) {
                case 'date-asc':
                    return new Date(a.Published_Date__c) - new Date(b.Published_Date__c);
                case 'date-desc':
                    return new Date(b.Published_Date__c) - new Date(a.Published_Date__c);
                case 'views':
                    return (b.View_Count__c || 0) - (a.View_Count__c || 0);
                case 'relevance':
                default:
                    // For relevance, we'd need additional scoring from the backend
                    return 0;
            }
        });
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

    // Public API methods
    @api
    searchForTerm(term) {
        this.searchTerm = term;
        this.performSearch();
    }

    @api
    searchInCategory(categoryId) {
        this.selectedCategory = categoryId;
        this.performSearch();
    }

    @api
    clearSearch() {
        this.handleClearSearch();
    }
}