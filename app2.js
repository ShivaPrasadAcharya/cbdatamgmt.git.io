// app2.js - Filtering and SQL Generation
DataApp.prototype.addSimpleCondition = function() {
    const headers = this.headers[this.currentDataset] || [];
    if (headers.length === 0) return;

    this.simpleConditions.push({
        id: Date.now(),
        column: headers[0],
        operator: 'LIKE', // Default to contains (LIKE)
        value: '',
        logic: 'AND'
    });
    this.render();
};

DataApp.prototype.removeSimpleCondition = function(conditionId) {
    this.simpleConditions = this.simpleConditions.filter(c => c.id !== conditionId);
    this.generateSQLFromSimpleConditions();
    this.render();
};

DataApp.prototype.updateSimpleCondition = function(conditionId, field, value) {
    const condition = this.simpleConditions.find(c => c.id === conditionId);
    if (condition) {
        condition[field] = value;
        this.generateSQLFromSimpleConditions();
        this.render();
    }
};

DataApp.prototype.generateSQLFromSimpleConditions = function() {
    if (this.simpleConditions.length === 0) {
        this.sqlQuery = '';
        return;
    }

    const whereClause = this.simpleConditions.map((condition, index) => {
        let clause = '';
        if (index > 0) {
            clause += ` ${condition.logic} `;
        }
        
        const value = this.formatConditionValue(condition.operator, condition.value);
        clause += `${condition.column} ${condition.operator} ${value}`;
        
        return clause;
    }).join('');

    this.sqlQuery = `WHERE ${whereClause}`;
};

DataApp.prototype.formatConditionValue = function(operator, value) {
    if (!value) return "''";
    
    const noQuoteOperators = ['IS NULL', 'IS NOT NULL'];
    if (noQuoteOperators.includes(operator)) {
        return '';
    }
    
    const isNumeric = !isNaN(value) && !isNaN(parseFloat(value));
    
    if (operator === 'IN' || operator === 'NOT IN') {
        return `'${value}'`;
    }
    
    if (isNumeric && ['>', '<', '>=', '<='].includes(operator)) {
        return value;
    }
    
    return `'${value}'`;
};

DataApp.prototype.getOperatorOptions = function() {
    return [
        { value: '=', label: 'equals (=)' },
        { value: 'LIKE', label: 'contains (LIKE)' },  
        { value: '!=', label: 'not equals (!=)' },
        { value: '>', label: 'greater than (>)' },
        { value: '<', label: 'less than (<)' },
        { value: '>=', label: 'greater or equal (>=)' },
        { value: '<=', label: 'less or equal (<=)' },
        { value: 'NOT LIKE', label: 'does not contain (NOT LIKE)' },
        { value: 'STARTS WITH', label: 'starts with' },
        { value: 'ENDS WITH', label: 'ends with' },
        { value: 'IN', label: 'is one of (IN)' },
        { value: 'NOT IN', label: 'is not one of (NOT IN)' },
        { value: 'IS NULL', label: 'is empty (IS NULL)' },
        { value: 'IS NOT NULL', label: 'is not empty (IS NOT NULL)' }
    ];
};

DataApp.prototype.applyFiltersToAllDatasets = function() {
    Object.keys(this.originalData).forEach(dataset => {
        this.applyFiltersToDataset(dataset);
    });
};

DataApp.prototype.applyFiltersToCurrentDataset = function() {
    this.applyFiltersToDataset(this.currentDataset);
};

DataApp.prototype.applyFiltersToDataset = function(dataset) {
    let data = [...this.originalData[dataset]];
    
    if ((this.showMultipleDatasets || dataset === this.currentDataset) && this.sqlQuery.trim()) {
        const sqlResult = window.sqlFilter.filter(data, this.sqlQuery);
        if (sqlResult.error) {
            this.showError(sqlResult.error);
            return;
        }
        data = sqlResult.data;
        this.clearError();
    }
    
    if (this.searchTerm.trim()) {
        data = window.searchEngine.search(data, this.searchTerm);
    }
    
    this.filteredData[dataset] = data;
};

DataApp.prototype.showError = function(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        const sqlSection = document.querySelector('.sql-section');
        if (sqlSection) {
            sqlSection.appendChild(errorDiv);
        }
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
};

DataApp.prototype.clearError = function() {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
};