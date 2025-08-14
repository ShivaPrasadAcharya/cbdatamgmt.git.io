// app4.js - Event Handling and Utility Functions
DataApp.prototype.exportDataset = function(dataset) {
    const data = this.filteredData[dataset] || [];
    const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
    const info = this.datasetInfo[dataset] || {};
    
    if (data.length === 0) {
        alert('No data to export for ' + (info.name || dataset));
        return;
    }
    
    const csvContent = this.generateCSV(data, headers);
    const fileName = `${info.name || dataset}_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    this.downloadCSV(csvContent, fileName);
};

DataApp.prototype.generateCSV = function(data, headers) {
    const csvHeaders = headers.map(header => this.escapeCSVField(header)).join(',');
    
    const csvRows = data.map(row => 
        headers.map(header => {
            const value = row[header] || '';
            return this.escapeCSVField(value);
        }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
};

DataApp.prototype.escapeCSVField = function(field) {
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

DataApp.prototype.downloadCSV = function(csvContent, fileName) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fileName);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

DataApp.prototype.attachEvents = function() {
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('input', this.handleInput.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
};

DataApp.prototype.attachEventListeners = function() {
    const executeBtn = document.querySelector('.execute-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const helpBtn = document.querySelector('.help-btn');

    if (executeBtn) {
        executeBtn.addEventListener('click', () => this.executeSQL());
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearFilters());
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', () => window.helpSystem.showModal());
    }
};

DataApp.prototype.handleClick = function(e) {
    if (e.target.classList.contains('dataset-btn')) {
        const dataset = e.target.dataset.dataset;
        this.switchDataset(dataset);
    }

    // Handle Files dropdown dataset selection
    if (e.target.classList.contains('files-dropdown-item')) {
        const dataset = e.target.dataset.dataset;
        this.switchDataset(dataset);
    }

    if (e.target.classList.contains('column-btn')) {
        const column = e.target.dataset.column;
        this.insertColumn(column);
    }
};

DataApp.prototype.handleInput = function(e) {
    if (e.target.classList.contains('search-input')) {
        const inputValue = e.target.value;
        const input = e.target;
        const selectionStart = input.selectionStart;
        const selectionEnd = input.selectionEnd;

        this.debounce(() => {
            this.searchTerm = inputValue;
            if (this.showMultipleDatasets) {
                this.applyFiltersToAllDatasets();
            } else {
                this.applyFiltersToCurrentDataset();
            }
            this.render();

            const newInput = document.querySelector('.search-input');
            if (newInput) {
                newInput.focus();
                try {
                    newInput.setSelectionRange(selectionStart, selectionEnd);
                } catch (err) {}
            }
        }, 300)();
    }

    if (e.target.classList.contains('sql-input')) {
        this.sqlQuery = e.target.value;
    }
};

DataApp.prototype.handleKeydown = function(e) {
    if (e.ctrlKey && e.key === 'Enter' && e.target.classList.contains('sql-input')) {
        e.preventDefault();
        this.executeSQL();
    }

    if (e.target.classList.contains('search-input')) {
        if (e.key === 'ArrowDown' && e.ctrlKey) {
            e.preventDefault();
            window.searchEngine.navigateToMatch('next');
        } else if (e.key === 'ArrowUp' && e.ctrlKey) {
            e.preventDefault();
            window.searchEngine.navigateToMatch('prev');
        }
    }
};

DataApp.prototype.insertColumn = function(column) {
    const sqlInput = document.querySelector('.sql-input');
    if (!sqlInput) return;

    const cursorPos = sqlInput.selectionStart;
    const textBefore = sqlInput.value.substring(0, cursorPos);
    const textAfter = sqlInput.value.substring(cursorPos);
    
    const newText = textBefore + column + textAfter;
    sqlInput.value = newText;
    this.sqlQuery = newText;
    
    const newCursorPos = cursorPos + column.length;
    sqlInput.setSelectionRange(newCursorPos, newCursorPos);
    sqlInput.focus();
};

DataApp.prototype.executeSQL = function() {
    if (this.showMultipleDatasets) {
        this.applyFiltersToAllDatasets();
    } else {
        this.applyFiltersToCurrentDataset();
    }
    this.render();
};

DataApp.prototype.clearSimpleFilters = function() {
    this.simpleConditions = [];
    this.sqlQuery = '';
    this.selectedColumns[this.currentDataset] = [...this.headers[this.currentDataset]];
    this.clearError();
    
    window.searchEngine.currentMatchIndex = 0;
    window.searchEngine.totalMatches = 0;
    window.searchEngine.searchMatches = [];
    
    if (this.showMultipleDatasets) {
        this.applyFiltersToAllDatasets();
    } else {
        this.applyFiltersToCurrentDataset();
    }
    this.render();
};

DataApp.prototype.clearFilters = function() {
    this.searchTerm = '';
    this.sqlQuery = '';
    this.simpleConditions = [];
    this.selectedColumns[this.currentDataset] = [...this.headers[this.currentDataset]];
    this.clearError();
    
    window.searchEngine.currentMatchIndex = 0;
    window.searchEngine.totalMatches = 0;
    window.searchEngine.searchMatches = [];
    
    if (this.showMultipleDatasets) {
        this.applyFiltersToAllDatasets();
    } else {
        this.applyFiltersToCurrentDataset();
    }
    this.render();
};

DataApp.prototype.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Initialize the application
window.dataApp = new DataApp();