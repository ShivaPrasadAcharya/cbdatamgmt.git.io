// search.js - Global Search and Highlighting with Navigation

// Nepali Normalizer
// ========================================
const NepaliNormalizer = {
    vowelMap: { 'ी': 'ि', 'ू': 'ु' },
    sibilantMap: { 'श': 'स', 'ष': 'स' },
    nasalMap: { 'ङ': 'न', 'ण': 'न', 'ञ': 'न', 'ं': 'न्' },
    vaBaMap: { 'व': 'ब' },
    numberMap: {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    },
    normalize(text) {
        if (!text) return '';
        let n = text.normalize('NFC').replace(/\u200D/g, '').replace(/\u200C/g, '');
        for (const [f, t] of Object.entries(this.vowelMap)) n = n.split(f).join(t);
        for (const [f, t] of Object.entries(this.sibilantMap)) n = n.split(f).join(t);
        for (const [f, t] of Object.entries(this.nasalMap)) n = n.split(f).join(t);
        for (const [f, t] of Object.entries(this.vaBaMap)) n = n.split(f).join(t);
        for (const [f, t] of Object.entries(this.numberMap)) n = n.split(f).join(t);
        return n;
    },
    isDevanagari(text) { return /[\u0900-\u097F]/.test(text); },
    mapToOriginal(normPos, original, normalized) {
        if (normPos <= 0) return 0;
        if (normPos >= normalized.length) return original.length;
        let origIdx = 0, normIdx = 0;
        while (normIdx < normPos && origIdx < original.length) {
            if (original[origIdx] === '\u200D' || original[origIdx] === '\u200C') { origIdx++; continue; }
            origIdx++; normIdx++;
        }
        while (origIdx < original.length && (original[origIdx] === '\u200D' || original[origIdx] === '\u200C')) origIdx++;
        return origIdx;
    }
};

class SearchEngine {
    constructor() {
        this.searchTerm = '';
        this.normalizedSearchTerm = '';
        this.useNepaliNormalization = localStorage.getItem('useNepaliNormalization') === '1';
        this.isSticky = false;
        this.searchHistory = [];
        this.maxHistoryLength = 10;
        this.currentMatchIndex = 0;
        this.totalMatches = 0;
        this.searchMatches = [];
    }

    setSearchTerm(term) {
        this.searchTerm = term;
        this.normalizedSearchTerm = this.normalizeForSearch(term);
        this.addToHistory(term);
        this.currentMatchIndex = 0;
        this.searchMatches = [];
    }

    normalizeForSearch(text) {
        if (!text) return '';
        const normalized = this.useNepaliNormalization && NepaliNormalizer.isDevanagari(text)
            ? NepaliNormalizer.normalize(text)
            : text;
        return String(normalized).toLowerCase();
    }

    setNepaliNormalization(enabled) {
        this.useNepaliNormalization = !!enabled;
        localStorage.setItem('useNepaliNormalization', this.useNepaliNormalization ? '1' : '0');
        // Recompute normalized search term when toggling
        this.normalizedSearchTerm = this.normalizeForSearch(this.searchTerm);
    }

    toggleNepaliNormalization() {
        this.setNepaliNormalization(!this.useNepaliNormalization);
    }

    addToHistory(term) {
        if (term && term.trim() !== '') {
            // Remove if already exists
            this.searchHistory = this.searchHistory.filter(item => item !== term);
            // Add to beginning
            this.searchHistory.unshift(term);
            // Keep only last N items
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryLength);
        }
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    search(data, term) {
        if (!term || term.trim() === '') {
            this.totalMatches = 0;
            this.currentMatchIndex = 0;
            this.searchMatches = [];
            return data;
        }

        this.setSearchTerm(term);
        
        const normalizedTerm = this.normalizedSearchTerm;
        
        const filteredData = data.filter(row => {
            return Object.values(row).some(value => {
                if (value === null || value === undefined) return false;
                const cellValue = String(value);
                const normalizedCell = this.normalizeForSearch(cellValue);
                return normalizedCell.includes(normalizedTerm);
            });
        });

        // Count total matches across all cells
        this.countMatches(filteredData);
        
        return filteredData;
    }

    countMatches(data) {
        this.searchMatches = [];
        this.totalMatches = 0;
        
        if (!this.searchTerm) return;

        const normalizedTerm = this.normalizedSearchTerm;

        data.forEach((row, rowIndex) => {
            Object.entries(row).forEach(([column, value]) => {
                if (value !== null && value !== undefined) {
                    const originalValue = String(value);
                    const normalizedCell = this.normalizeForSearch(originalValue);
                    let index = normalizedCell.indexOf(normalizedTerm);
                    while (index !== -1) {
                        this.searchMatches.push({
                            rowIndex,
                            column,
                            matchIndex: this.totalMatches,
                            cellValue: originalValue
                        });
                        this.totalMatches++;
                        index = normalizedCell.indexOf(normalizedTerm, index + 1);
                    }
                }
            });
        });
    }

    navigateToMatch(direction) {
        if (this.totalMatches === 0) return false;

        if (direction === 'next') {
            this.currentMatchIndex = (this.currentMatchIndex + 1) % this.totalMatches;
        } else if (direction === 'prev') {
            this.currentMatchIndex = this.currentMatchIndex === 0 
                ? this.totalMatches - 1 
                : this.currentMatchIndex - 1;
        }

        this.scrollToCurrentMatch();
        return true;
    }

    scrollToCurrentMatch() {
        const currentMatch = this.searchMatches[this.currentMatchIndex];
        if (!currentMatch) return;

        // Find the corresponding cell in the DOM
        setTimeout(() => {
            const tables = document.querySelectorAll('table');
            tables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                const targetRow = rows[currentMatch.rowIndex];
                if (targetRow) {
                    const cells = targetRow.querySelectorAll('td');
                    cells.forEach(cell => {
                        if (cell.textContent.includes(currentMatch.cellValue)) {
                            // Remove previous current highlight
                            document.querySelectorAll('.current-highlight').forEach(el => {
                                el.classList.remove('current-highlight');
                                el.classList.add('highlight');
                            });
                            
                            // Add current highlight
                            const highlights = cell.querySelectorAll('.highlight');
                            if (highlights.length > 0) {
                                highlights[0].classList.remove('highlight');
                                highlights[0].classList.add('current-highlight');
                                
                                // Scroll to the element
                                highlights[0].scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'center'
                                });
                            }
                        }
                    });
                }
            });
        }, 100);
    }

    getCurrentPosition() {
        return {
            current: this.currentMatchIndex + 1,
            total: this.totalMatches
        };
    }

    searchMultipleTerms(data, terms) {
        if (!terms || terms.length === 0) {
            return data;
        }

        return data.filter(row => {
            return terms.every(term => {
                const normalizedTerm = this.normalizeForSearch(term);
                return Object.values(row).some(value => {
                    if (value === null || value === undefined) return false;
                    const normalizedValue = this.normalizeForSearch(String(value));
                    return normalizedValue.includes(normalizedTerm);
                });
            });
        });
    }

    highlight(text, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return text;
        }

        if (text === null || text === undefined) {
            return '';
        }

        // If Nepali normalization is enabled and the search term is Devanagari,
        // match against a normalized version of the text while still preserving
        // the original text for rendering.
        if (this.useNepaliNormalization && NepaliNormalizer.isDevanagari(searchTerm)) {
            const original = String(text);
            const normalizedText = NepaliNormalizer.normalize(original).toLowerCase();
            const normalizedSearch = this.normalizeForSearch(searchTerm);

            let matchCount = 0;
            let result = '';
            let lastIndex = 0;

            let idx = normalizedText.indexOf(normalizedSearch, 0);
            while (idx !== -1) {
                const start = NepaliNormalizer.mapToOriginal(idx, original, normalizedText);
                const end = NepaliNormalizer.mapToOriginal(idx + normalizedSearch.length, original, normalizedText);
                const currentMatch = this.searchMatches[this.currentMatchIndex];
                const isCurrentMatch = currentMatch && currentMatch.matchIndex === this.currentMatchIndex && matchCount === 0;

                result += original.slice(lastIndex, start);
                const matchText = original.slice(start, end);
                result += isCurrentMatch ? `<span class="current-highlight">${matchText}</span>` : `<span class="highlight">${matchText}</span>`;

                matchCount++;
                lastIndex = end;
                idx = normalizedText.indexOf(normalizedSearch, idx + 1);
            }

            result += original.slice(lastIndex);
            return result;
        }

        const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
        let matchCount = 0;
        
        return String(text).replace(regex, (match) => {
            const currentMatch = this.searchMatches[this.currentMatchIndex];
            const isCurrentMatch = currentMatch && 
                currentMatch.matchIndex === this.currentMatchIndex && 
                matchCount === 0;
            
            matchCount++;
            
            if (isCurrentMatch) {
                return `<span class="current-highlight">${match}</span>`;
            } else {
                return `<span class="highlight">${match}</span>`;
            }
        });
    }

    highlightMultipleTerms(text, terms) {
        if (!terms || terms.length === 0) {
            return text;
        }

        if (text === null || text === undefined) {
            return '';
        }

        let result = String(text);
        terms.forEach(term => {
            if (term && term.trim() !== '') {
                const regex = new RegExp(`(${this.escapeRegExp(term)})`, 'gi');
                result = result.replace(regex, '<span class="highlight">$1</span>');
            }
        });

        return result;
    }

escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

    initStickySearch() {
        const stickySearch = document.querySelector('.sticky-search');
        if (!stickySearch) return;

        // Add scroll event listener for sticky effect
        let ticking = false;
        const updateStickyState = () => {
            const scrollY = window.scrollY;
            const threshold = 100;

            if (scrollY > threshold && !this.isSticky) {
                stickySearch.classList.add('scrolled');
                this.isSticky = true;
            } else if (scrollY <= threshold && this.isSticky) {
                stickySearch.classList.remove('scrolled');
                this.isSticky = false;
            }
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateStickyState);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    performAdvancedSearch(data, options = {}) {
        const {
            term = '',
            columns = [],
            caseSensitive = false,
            exactMatch = false,
            regex = false
        } = options;

        if (!term.trim()) return data;

        return data.filter(row => {
            const searchColumns = columns.length > 0 ? columns : Object.keys(row);
            
            return searchColumns.some(column => {
                const value = row[column];
                if (value === null || value === undefined) return false;
                
                const searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                const searchTerm = caseSensitive ? term : term.toLowerCase();
                
                if (regex) {
                    try {
                        const regexPattern = new RegExp(searchTerm, caseSensitive ? 'g' : 'gi');
                        return regexPattern.test(searchValue);
                    } catch (e) {
                        return false;
                    }
                } else if (exactMatch) {
                    return searchValue === searchTerm;
                } else {
                    return searchValue.includes(searchTerm);
                }
            });
        });
    }

    getSearchStatistics(originalData, filteredData, searchTerm) {
        const originalCount = originalData.length;
        const filteredCount = filteredData.length;
        const matchPercentage = originalCount > 0 ? ((filteredCount / originalCount) * 100).toFixed(1) : 0;
        
        return {
            originalCount,
            filteredCount,
            matchPercentage,
            searchTerm: searchTerm || '',
            filtered: filteredCount < originalCount
        };
    }
}

// Initialize Search Engine
window.searchEngine = new SearchEngine();