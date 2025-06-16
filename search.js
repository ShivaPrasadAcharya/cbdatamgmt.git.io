// search.js - Global Search Module

var SearchModule = (function() {
    'use strict';

    var searchTimeout;
    var lastSearchTerm = '';
    var searchResults = [];
    var currentResultIndex = -1;
    var currentHighlightedElement = null;

    // Initialize search module
    function init() {
        var searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounceSearch);
            searchInput.addEventListener('keydown', handleKeyDown);
        }
        
        // Add navigation controls
        addNavigationControls();
    }

    // Add navigation controls
    function addNavigationControls() {
        var searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;
        
        var searchContainer = searchInput.parentElement;
        
        // Create navigation controls wrapper
        var navWrapper = document.createElement('div');
        navWrapper.className = 'mt-3 flex justify-between items-center';
        
        // Create navigation controls
        var navControls = document.createElement('div');
        navControls.id = 'searchNavControls';
        navControls.className = 'hidden flex items-center gap-2';
        
        // Build HTML as array and join
        var html = [];
        html.push('<button onclick="SearchModule.previousResult()" ');
        html.push('class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" ');
        html.push('title="Previous result (Shift+Enter)">');
        html.push('<i class="fas fa-chevron-up"></i>');
        html.push('</button>');
        html.push('<button onclick="SearchModule.nextResult()" ');
        html.push('class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" ');
        html.push('title="Next result (Enter)">');
        html.push('<i class="fas fa-chevron-down"></i>');
        html.push('</button>');
        html.push('<span class="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-lg">');
        html.push('<span id="currentResultNum">0</span> / <span id="totalResultNum">0</span>');
        html.push('</span>');
        
        navControls.innerHTML = html.join('');
        
        // Create search stats
        var searchStats = document.createElement('div');
        searchStats.id = 'searchStats';
        searchStats.className = 'hidden text-sm text-gray-600';
        
        navWrapper.appendChild(navControls);
        navWrapper.appendChild(searchStats);
        searchContainer.parentElement.appendChild(navWrapper);
        
        // Add scroll listener to add shadow to sticky search
        window.addEventListener('scroll', function() {
            var searchSection = document.querySelector('.sticky.top-0');
            if (window.scrollY > 50) {
                searchSection.classList.add('search-scrolled');
            } else {
                searchSection.classList.remove('search-scrolled');
            }
        });
    }

    // Debounce search to improve performance
    function debounceSearch(event) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            performSearch(event.target.value);
        }, 300);
    }

    // Handle keyboard shortcuts
    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            clearSearch();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (event.shiftKey) {
                previousResult();
            } else {
                nextResult();
            }
        } else if (event.key === 'F3') {
            event.preventDefault();
            if (event.shiftKey) {
                previousResult();
            } else {
                nextResult();
            }
        }
    }

    // Perform global search across all tables
    function performSearch(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        lastSearchTerm = searchTerm;
        searchResults = [];
        currentResultIndex = -1;

        if (!searchTerm) {
            hideNavigationControls();
            // Reset all tables to show all data
            var tables = window.DataManager.getAllTables();
            for (var tableKey in tables) {
                if (tables.hasOwnProperty(tableKey)) {
                    window.DOMHelper.renderTable(tableKey, tables[tableKey]);
                }
            }
            return;
        }

        // Get all tables
        var tables = window.DataManager.getAllTables();
        
        for (var tableKey in tables) {
            if (tables.hasOwnProperty(tableKey)) {
                var data = tables[tableKey];
                var filteredData = filterData(data, searchTerm);
                
                // Collect search results with location info
                for (var rowIndex = 0; rowIndex < filteredData.length; rowIndex++) {
                    var row = filteredData[rowIndex];
                    for (var column in row) {
                        if (row.hasOwnProperty(column)) {
                            var value = row[column];
                            if (value && value.toString().toLowerCase().indexOf(searchTerm) !== -1) {
                                searchResults.push({
                                    tableKey: tableKey,
                                    rowIndex: rowIndex,
                                    column: column,
                                    row: row,
                                    value: value.toString()
                                });
                            }
                        }
                    }
                }
                
                // Update table display
                window.DOMHelper.renderTable(tableKey, filteredData);
                
                // Highlight search terms
                if (searchTerm) {
                    highlightSearchTerms(tableKey, searchTerm);
                }
            }
        }

        // Update navigation controls
        if (searchResults.length > 0) {
            showNavigationControls();
            updateNavigationDisplay();
            // Auto-navigate to first result
            currentResultIndex = 0;
            navigateToResult(0);
        } else {
            hideNavigationControls();
        }

        // Update search stats
        updateSearchStats(searchTerm);
    }

    // Navigate to next result
    function nextResult() {
        if (searchResults.length === 0) return;
        
        currentResultIndex = (currentResultIndex + 1) % searchResults.length;
        navigateToResult(currentResultIndex);
    }

    // Navigate to previous result
    function previousResult() {
        if (searchResults.length === 0) return;
        
        currentResultIndex = currentResultIndex - 1;
        if (currentResultIndex < 0) {
            currentResultIndex = searchResults.length - 1;
        }
        navigateToResult(currentResultIndex);
    }

    // Navigate to specific result
    function navigateToResult(index) {
        if (index < 0 || index >= searchResults.length) return;
        
        var result = searchResults[index];
        
        // Switch to correct tab if needed
        if (window.currentTab !== result.tableKey) {
            window.DOMHelper.showTab(result.tableKey);
        }
        
        // Remove previous highlight
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('current-search-result');
        }
        
        // Find and highlight the specific result
        setTimeout(function() {
            var table = document.getElementById('table-' + result.tableKey);
            if (!table) return;
            
            var tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            var rows = tbody.querySelectorAll('tr');
            if (!rows || rows.length <= result.rowIndex) return;
            
            var targetRow = rows[result.rowIndex];
            
            if (targetRow) {
                // Find the specific cell
                var cells = targetRow.querySelectorAll('td');
                var targetCell = null;
                
                // Match by column index
                var columnKeys = Object.keys(result.row);
                var columnIndex = -1;
                for (var i = 0; i < columnKeys.length; i++) {
                    if (columnKeys[i] === result.column) {
                        columnIndex = i;
                        break;
                    }
                }
                
                if (columnIndex >= 0 && cells[columnIndex]) {
                    targetCell = cells[columnIndex];
                }
                
                if (targetCell) {
                    // Highlight the specific match
                    var highlights = targetCell.querySelectorAll('.highlight');
                    if (highlights.length > 0) {
                        highlights[0].classList.add('current-search-result');
                        currentHighlightedElement = highlights[0];
                        
                        // Scroll to the element
                        targetCell.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'center'
                        });
                        
                        // Flash effect
                        targetRow.style.backgroundColor = '#fef3c7';
                        setTimeout(function() {
                            targetRow.style.backgroundColor = '';
                        }, 500);
                    }
                }
            }
        }, 100);
        
        updateNavigationDisplay();
    }

    // Show navigation controls
    function showNavigationControls() {
        var controls = document.getElementById('searchNavControls');
        if (controls) {
            controls.classList.remove('hidden');
        }
    }

    // Hide navigation controls
    function hideNavigationControls() {
        var controls = document.getElementById('searchNavControls');
        if (controls) {
            controls.classList.add('hidden');
        }
    }

    // Update navigation display
    function updateNavigationDisplay() {
        var currentNum = document.getElementById('currentResultNum');
        var totalNum = document.getElementById('totalResultNum');
        
        if (currentNum) {
            currentNum.textContent = searchResults.length > 0 ? currentResultIndex + 1 : 0;
        }
        if (totalNum) {
            totalNum.textContent = searchResults.length;
        }
    }

    // Filter data based on search term
    function filterData(data, searchTerm) {
        var filtered = [];
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var found = false;
            
            for (var key in row) {
                if (row.hasOwnProperty(key)) {
                    var value = row[key];
                    if (value !== null && value !== undefined) {
                        if (value.toString().toLowerCase().indexOf(searchTerm) !== -1) {
                            found = true;
                            break;
                        }
                    }
                }
            }
            
            if (found) {
                filtered.push(row);
            }
        }
        return filtered;
    }

    // Highlight search terms in table cells
    function highlightSearchTerms(tableKey, searchTerm) {
        var table = document.getElementById('table-' + tableKey);
        if (!table) return;

        var cells = table.getElementsByTagName('td');
        var searchRegex = new RegExp('(' + escapeRegExp(searchTerm) + ')', 'gi');

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var originalText = cell.getAttribute('data-original-text') || cell.textContent;
            cell.setAttribute('data-original-text', originalText);

            if (originalText.toLowerCase().indexOf(searchTerm) !== -1) {
                cell.innerHTML = originalText.replace(searchRegex, '<span class="highlight">$1</span>');
            } else {
                cell.textContent = originalText;
            }
        }
    }

    // Update search statistics display
    function updateSearchStats(searchTerm) {
        var tables = window.DataManager.getAllTables();
        var totalMatches = 0;
        var totalRows = 0;

        for (var tableKey in tables) {
            if (tables.hasOwnProperty(tableKey)) {
                var data = tables[tableKey];
                var matches = searchTerm ? filterData(data, searchTerm).length : data.length;
                totalMatches += matches;
                totalRows += searchTerm ? matches : 0;

                // Update tab badge with match count
                var tabBadge = document.querySelector('#tab-' + tableKey + ' .badge');
                if (tabBadge) {
                    tabBadge.textContent = matches;
                    tabBadge.style.display = searchTerm ? 'inline-block' : 'none';
                }
            }
        }

        // Update search stats in sticky bar
        if (searchTerm) {
            var searchStats = document.getElementById('searchStats');
            if (searchStats) {
                searchStats.textContent = 'Found ' + searchResults.length + ' matches in ' + totalRows + ' rows';
                searchStats.classList.remove('hidden');
            }
        } else {
            var searchStats = document.getElementById('searchStats');
            if (searchStats) {
                searchStats.classList.add('hidden');
            }
        }
    }

    // Clear search
    function clearSearch() {
        var searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.value = '';
            performSearch('');
        }
        hideSearchNotification();
        hideNavigationControls();
        
        // Remove all highlights
        if (currentHighlightedElement) {
            currentHighlightedElement.classList.remove('current-search-result');
            currentHighlightedElement = null;
        }
    }

    // Show search notification
    function showSearchNotification(message) {
        // We'll use the integrated search stats instead of a separate notification
        // This prevents overlapping with the sticky search bar
        var searchStats = document.getElementById('searchStats');
        if (searchStats) {
            searchStats.textContent = message;
            searchStats.classList.remove('hidden');
        }
    }

    // Hide search notification
    function hideSearchNotification() {
        var searchStats = document.getElementById('searchStats');
        if (searchStats) {
            searchStats.classList.add('hidden');
        }
    }

    // Escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Get current search term
    function getCurrentSearchTerm() {
        return lastSearchTerm;
    }

    // Get search results
    function getSearchResults() {
        return searchResults;
    }

    // Jump to specific result
    function jumpToResult(index) {
        if (index >= 0 && index < searchResults.length) {
            currentResultIndex = index;
            navigateToResult(index);
        }
    }

    // Export search results
    function exportSearchResults() {
        var searchTerm = document.getElementById('globalSearch').value;
        if (!searchTerm) {
            alert('No search term to export results for');
            return;
        }

        var tables = window.DataManager.getAllTables();
        var allResults = [];

        for (var tableKey in tables) {
            if (tables.hasOwnProperty(tableKey)) {
                var data = tables[tableKey];
                var filteredData = filterData(data, searchTerm.toLowerCase());
                
                for (var i = 0; i < filteredData.length; i++) {
                    var row = filteredData[i];
                    var rowCopy = {};
                    for (var key in row) {
                        if (row.hasOwnProperty(key)) {
                            rowCopy[key] = row[key];
                        }
                    }
                    rowCopy.source = tableKey;
                    allResults.push(rowCopy);
                }
            }
        }

        window.ExportModule.exportToCSV(allResults, 'search_results_' + searchTerm);
    }

    // Public API
    return {
        init: init,
        performSearch: performSearch,
        clearSearch: clearSearch,
        getCurrentSearchTerm: getCurrentSearchTerm,
        getSearchResults: getSearchResults,
        nextResult: nextResult,
        previousResult: previousResult,
        jumpToResult: jumpToResult,
        exportSearchResults: exportSearchResults
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', SearchModule.init);