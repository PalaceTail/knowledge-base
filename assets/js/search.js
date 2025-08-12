// Knowledge Base Search and Filter Functionality
(function () {
    'use strict';

    let articlesData = [];
    let filteredArticles = [];

    // DOM elements
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');
    const articlesContainer = document.getElementById('articles-container');
    const articleCount = document.getElementById('article-count');
    const noResults = document.getElementById('no-results');

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        // Get articles data from window object (set by Python script)
        articlesData = window.articlesData || [];
        filteredArticles = [...articlesData];

        // Initialize event listeners
        initializeEventListeners();

        // Extract and populate filter options if not already done by Python
        if (articlesData.length > 0 && categoryFilter.children.length <= 1) {
            populateFilters();
        }

        console.log(`🔍 Search initialized with ${articlesData.length} articles`);

        // Initial display update
        updateDisplay();
    });

    function initializeEventListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    clearSearch();
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', clearSearch);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', handleFilter);
        }

        if (tagFilter) {
            tagFilter.addEventListener('change', handleFilter);
        }
    }

    function populateFilters() {
        const categories = new Set();
        const tags = new Set();

        articlesData.forEach(article => {
            if (article.category) {
                categories.add(article.category);
            }
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => tags.add(tag));
            }
        });

        // Populate category filter
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Populate tag filter
        Array.from(tags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }

    function handleSearch() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        if (!query) {
            filteredArticles = [...articlesData];
        } else {
            filteredArticles = articlesData.filter(article => {
                // Search in title
                if (article.title && article.title.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in summary
                if (article.summary && article.summary.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in content
                if (article.content && article.content.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in author
                if (article.author && article.author.toLowerCase().includes(query)) {
                    return true;
                }

                // Search in tags
                if (article.tags && Array.isArray(article.tags)) {
                    return article.tags.some(tag =>
                        tag.toLowerCase().includes(query)
                    );
                }

                return false;
            });
        }

        applyFilters();
        updateDisplay();
    }

    function handleFilter() {
        applyFilters();
        updateDisplay();
    }

    function applyFilters() {
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedTag = tagFilter ? tagFilter.value : '';

        let filtered = [...filteredArticles];

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(article =>
                article.category === selectedCategory
            );
        }

        // Apply tag filter
        if (selectedTag) {
            filtered = filtered.filter(article =>
                article.tags && article.tags.includes(selectedTag)
            );
        }

        filteredArticles = filtered;
    }

    function updateDisplay() {
        const articleCards = document.querySelectorAll('.article-card');
        let visibleCount = 0;

        // Show/hide article cards based on filtered results
        articleCards.forEach(card => {
            const titleElement = card.querySelector('h2 a');
            if (!titleElement) return;

            const title = titleElement.textContent.trim();
            const isVisible = filteredArticles.some(article =>
                article.title === title
            );

            if (isVisible) {
                card.style.display = 'block';
                card.classList.add('fade-in');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });

        // Update article count
        if (articleCount) {
            articleCount.textContent = visibleCount;
        }

        // Show/hide no results message
        if (articlesContainer && noResults) {
            if (visibleCount === 0) {
                articlesContainer.style.opacity = '0.5';
                noResults.style.display = 'block';
            } else {
                articlesContainer.style.opacity = '1';
                noResults.style.display = 'none';
            }
        }

        // Announce to screen readers
        announceResults(visibleCount);
    }

    function clearSearch() {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (tagFilter) tagFilter.value = '';

        filteredArticles = [...articlesData];
        updateDisplay();

        if (searchInput) {
            searchInput.focus();
        }
    }

    function announceResults(count) {
        // Create or update screen reader announcement
        let announcement = document.getElementById('search-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'search-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            document.body.appendChild(announcement);
        }

        announcement.textContent = `${count} article${count !== 1 ? 's' : ''} found`;
    }

    // Debounce function to limit search frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        // Focus search with Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // Export for debugging
    if (typeof window !== 'undefined') {
        window.KnowledgeBaseSearch = {
            getArticlesData: () => articlesData,
            getFilteredArticles: () => filteredArticles,
            search: handleSearch,
            clearSearch: clearSearch
        };
    }
})();