/**
 * Logseq Knowledge Base - Search and Filter Functionality (修正版)
 * タグ・カテゴリフィルタリング + 検索機能の実装
 * フィルターリセット機能を修正
 */

// DOM elements
let searchInput, categoryFilter, tagFilter, clearButton;
let articlesContainer, noResults, articleCards;
let originalArticles = [];

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    
    // 初期データの保存
    if (window.articlesData) {
        originalArticles = window.articlesData;
        console.log('Loaded articles:', originalArticles.length);
    } else {
        console.error('Articles data not found!');
    }
    
    // 記事カードをキャッシュ
    articleCards = Array.from(document.querySelectorAll('.article-card'));
    console.log('Found article cards:', articleCards.length);
});

function initializeElements() {
    searchInput = document.getElementById('search-input');
    categoryFilter = document.getElementById('category-filter');
    tagFilter = document.getElementById('tag-filter');
    clearButton = document.getElementById('clear-search');
    articlesContainer = document.getElementById('articles-container');
    noResults = document.getElementById('no-results');
    
    // エラーチェック
    const requiredElements = {
        'search-input': searchInput,
        'category-filter': categoryFilter,
        'tag-filter': tagFilter,
        'clear-search': clearButton,
        'articles-container': articlesContainer,
        'no-results': noResults
    };
    
    for (const [id, element] of Object.entries(requiredElements)) {
        if (!element) {
            console.error(`Required element not found: ${id}`);
        }
    }
}

function setupEventListeners() {
    // 検索入力
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
    
    // カテゴリフィルター
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performSearch);
    }
    
    // タグフィルター
    if (tagFilter) {
        tagFilter.addEventListener('change', performSearch);
    }
    
    // クリアボタン
    if (clearButton) {
        clearButton.addEventListener('click', clearAllFilters);
    }
    
    console.log('Event listeners setup complete');
}

function performSearch() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedTag = tagFilter ? tagFilter.value : '';
    
    console.log('Performing search:', { searchQuery, selectedCategory, selectedTag });
    
    let visibleCount = 0;
    
    // すべての記事カードを処理
    articleCards.forEach(card => {
        const shouldShow = matchesFilters(card, searchQuery, selectedCategory, selectedTag);
        
        if (shouldShow) {
            card.style.display = 'block'; // 明示的にblock表示
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 結果の表示/非表示を制御
    updateResultsDisplay(visibleCount);
    
    console.log(`Search complete. Visible articles: ${visibleCount}/${articleCards.length}`);
}

function matchesFilters(card, searchQuery, selectedCategory, selectedTag) {
    // カテゴリフィルター
    if (selectedCategory) {
        const cardCategory = card.getAttribute('data-category');
        if (cardCategory !== selectedCategory) {
            return false;
        }
    }
    
    // タグフィルター
    if (selectedTag) {
        const cardTagsStr = card.getAttribute('data-tags');
        let cardTags = [];
        try {
            cardTags = JSON.parse(cardTagsStr || '[]');
        } catch (e) {
            console.warn('Failed to parse tags for card:', cardTagsStr);
            cardTags = [];
        }
        
        if (!cardTags.includes(selectedTag)) {
            return false;
        }
    }
    
    // 検索クエリ
    if (searchQuery) {
        const cardText = card.textContent.toLowerCase();
        if (!cardText.includes(searchQuery)) {
            return false;
        }
    }
    
    return true;
}

function updateResultsDisplay(visibleCount) {
    if (!articlesContainer || !noResults) return;
    
    if (visibleCount === 0) {
        articlesContainer.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        articlesContainer.style.display = 'block';
        noResults.style.display = 'none';
    }
    
    // 記事数を更新
    const articleCountElement = document.getElementById('article-count');
    if (articleCountElement) {
        articleCountElement.textContent = visibleCount.toString();
    }
}

function clearAllFilters() {
    console.log('Clearing all filters');
    
    // フィルター要素をリセット
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (categoryFilter) {
        categoryFilter.value = '';
    }
    
    if (tagFilter) {
        tagFilter.value = '';
    }
    
    // すべての記事を表示状態に戻す
    articleCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // 結果表示を更新
    updateResultsDisplay(articleCards.length);
    
    console.log('All filters cleared, showing all articles');
}

// デバウンス機能（検索パフォーマンス向上）
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

// デバッグ用関数
window.debugFilters = function() {
    console.log('=== Filter Debug Info ===');
    console.log('Search input:', searchInput?.value);
    console.log('Category filter:', categoryFilter?.value);
    console.log('Tag filter:', tagFilter?.value);
    console.log('Total article cards:', articleCards.length);
    console.log('Visible articles:', articleCards.filter(card => 
        card.style.display !== 'none').length);
    console.log('Articles data:', originalArticles.length);
    
    // 各記事カードの状態をチェック
    articleCards.forEach((card, index) => {
        console.log(`Card ${index}:`, {
            title: card.querySelector('h2')?.textContent?.trim(),
            category: card.getAttribute('data-category'),
            tags: card.getAttribute('data-tags'),
            visible: card.style.display !== 'none'
        });
    });
};