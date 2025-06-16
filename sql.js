// sql.js - Advanced MySQL-style Filter Module

const SQLFilter = (function() {
    'use strict';

    let conditions = [];
    let conditionIdCounter = 0;

    // Column definitions
    const columns = [
        { name: 'caseno', type: 'text', label: 'Case No' },
        { name: 'dno', type: 'text', label: 'Document No' },
        { name: 'nkp', type: 'text', label: 'NKP' },
        { name: 'vol', type: 'number', label: 'Volume' },
        { name: 'date', type: 'date', label: 'Date' },
        { name: 'cassename', type: 'text', label: 'Case Name' },
        { name: 'party1', type: 'text', label: 'Party 1' },
        { name: 'party2', type: 'text', label: 'Party 2' },
        { name: 'bench', type: 'text', label: 'Bench' },
        { name: 'remark1', type: 'text', label: 'Remark 1' },
        { name: 'remark2', type: 'text', label: 'Remark 2' },
        { name: 'remark3', type: 'text', label: 'Remark 3' },
        { name: 'remark4', type: 'text', label: 'Remark 4' },
        { name: 'remark5', type: 'text', label: 'Remark 5' }
    ];

    // Operators for different data types
    const operators = {
        text: [
            { value: 'equals', label: 'equals', symbol: '=' },
            { value: 'not_equals', label: 'not equals', symbol: '!=' },
            { value: 'contains', label: 'contains', symbol: 'LIKE' },
            { value: 'not_contains', label: 'does not contain', symbol: 'NOT LIKE' },
            { value: 'starts_with', label: 'starts with', symbol: 'LIKE' },
            { value: 'ends_with', label: 'ends with', symbol: 'LIKE' },
            { value: 'is_empty', label: 'is empty', symbol: 'IS NULL' },
            { value: 'is_not_empty', label: 'is not empty', symbol: 'IS NOT NULL' }
        ],
        number: [
            { value: 'equals', label: 'equals', symbol: '=' },
            { value: 'not_equals', label: 'not equals', symbol: '!=' },
            { value: 'greater_than', label: 'greater than', symbol: '>' },
            { value: 'less_than', label: 'less than', symbol: '<' },
            { value: 'greater_equal', label: 'greater than or equal', symbol: '>=' },
            { value: 'less_equal', label: 'less than or equal', symbol: '<=' },
            { value: 'between', label: 'between', symbol: 'BETWEEN' },
            { value: 'not_between', label: 'not between', symbol: 'NOT BETWEEN' }
        ],
        date: [
            { value: 'equals', label: 'equals', symbol: '=' },
            { value: 'not_equals', label: 'not equals', symbol: '!=' },
            { value: 'after', label: 'after', symbol: '>' },
            { value: 'before', label: 'before', symbol: '<' },
            { value: 'on_or_after', label: 'on or after', symbol: '>=' },
            { value: 'on_or_before', label: 'on or before', symbol: '<=' },
            { value: 'between', label: 'between', symbol: 'BETWEEN' }
        ]
    };

    // Initialize filter module
    function init() {
        // Add first condition on init
        addCondition();
    }

    // Add a new filter condition
    function addCondition(groupId = null) {
        const conditionId = conditionIdCounter++;
        const condition = {
            id: conditionId,
            column: columns[0].name,
            operator: 'equals',
            value: '',
            value2: '', // For between operator
            connector: conditions.length > 0 ? 'AND' : null,
            groupId: groupId
        };

        conditions.push(condition);
        renderCondition(condition);
        updateQueryDisplay();
    }

    // Render a single condition
    function renderCondition(condition) {
        const container = document.getElementById('filterConditions');
        const conditionDiv = document.createElement('div');
        conditionDiv.className = 'filter-condition';
        conditionDiv.id = `condition-${condition.id}`;

        const column = columns.find(col => col.name === condition.column);
        const operatorList = operators[column.type];

        let html = `
            <div class="flex flex-wrap gap-3 items-center">
        `;

        // Connector (AND/OR)
        if (condition.connector) {
            html += `
                <select class="px-3 py-2 border rounded-lg bg-yellow-50" onchange="SQLFilter.updateConnector(${condition.id}, this.value)">
                    <option value="AND" ${condition.connector === 'AND' ? 'selected' : ''}>AND</option>
                    <option value="OR" ${condition.connector === 'OR' ? 'selected' : ''}>OR</option>
                </select>
            `;
        }

        // Column select
        html += `
            <select class="column-select px-3 py-2 border rounded-lg" onchange="SQLFilter.updateColumn(${condition.id}, this.value)">
                ${columns.map(col => `
                    <option value="${col.name}" ${col.name === condition.column ? 'selected' : ''}>${col.label}</option>
                `).join('')}
            </select>
        `;

        // Operator select
        html += `
            <select class="operator-select px-3 py-2 border rounded-lg" onchange="SQLFilter.updateOperator(${condition.id}, this.value)">
                ${operatorList.map(op => `
                    <option value="${op.value}" ${op.value === condition.operator ? 'selected' : ''}>${op.label}</option>
                `).join('')}
            </select>
        `;

        // Value input(s)
        if (!['is_empty', 'is_not_empty'].includes(condition.operator)) {
            if (column.type === 'date') {
                html += `<input type="date" class="px-3 py-2 border rounded-lg" value="${condition.value}" onchange="SQLFilter.updateValue(${condition.id}, this.value)">`;
            } else if (column.type === 'number') {
                html += `<input type="number" class="px-3 py-2 border rounded-lg" value="${condition.value}" onchange="SQLFilter.updateValue(${condition.id}, this.value)">`;
            } else {
                html += `<input type="text" class="px-3 py-2 border rounded-lg" placeholder="Enter value" value="${condition.value}" onchange="SQLFilter.updateValue(${condition.id}, this.value)">`;
            }

            // Second value for between operator
            if (['between', 'not_between'].includes(condition.operator)) {
                html += `<span class="text-gray-600">and</span>`;
                if (column.type === 'date') {
                    html += `<input type="date" class="px-3 py-2 border rounded-lg" value="${condition.value2}" onchange="SQLFilter.updateValue2(${condition.id}, this.value)">`;
                } else {
                    html += `<input type="number" class="px-3 py-2 border rounded-lg" value="${condition.value2}" onchange="SQLFilter.updateValue2(${condition.id}, this.value)">`;
                }
            }
        }

        // Remove button
        html += `
                <button class="remove-condition" onclick="SQLFilter.removeCondition(${condition.id})" title="Remove condition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        conditionDiv.innerHTML = html;
        container.appendChild(conditionDiv);
    }

    // Update condition properties
    function updateColumn(conditionId, newColumn) {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
            condition.column = newColumn;
            const column = columns.find(col => col.name === newColumn);
            
            // Reset operator to first available for new column type
            const operatorList = operators[column.type];
            condition.operator = operatorList[0].value;
            condition.value = '';
            condition.value2 = '';
            
            // Re-render the condition
            document.getElementById(`condition-${conditionId}`).remove();
            renderCondition(condition);
            updateQueryDisplay();
        }
    }

    function updateOperator(conditionId, newOperator) {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
            condition.operator = newOperator;
            
            // Re-render if operator changes to/from between
            if (['between', 'not_between'].includes(newOperator) || 
                ['between', 'not_between'].includes(condition.operator)) {
                document.getElementById(`condition-${conditionId}`).remove();
                renderCondition(condition);
            }
            updateQueryDisplay();
        }
    }

    function updateValue(conditionId, newValue) {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
            condition.value = newValue;
            updateQueryDisplay();
        }
    }

    function updateValue2(conditionId, newValue) {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
            condition.value2 = newValue;
            updateQueryDisplay();
        }
    }

    function updateConnector(conditionId, newConnector) {
        const condition = conditions.find(c => c.id === conditionId);
        if (condition) {
            condition.connector = newConnector;
            updateQueryDisplay();
        }
    }

    // Remove a condition
    function removeCondition(conditionId) {
        const index = conditions.findIndex(c => c.id === conditionId);
        if (index > -1) {
            conditions.splice(index, 1);
            document.getElementById(`condition-${conditionId}`).remove();
            
            // Update first condition connector
            if (conditions.length > 0 && !conditions[0].connector) {
                conditions[0].connector = null;
            }
            
            updateQueryDisplay();
        }
    }

    // Update the query display
    function updateQueryDisplay() {
        const queryDisplay = document.getElementById('queryDisplay');
        if (conditions.length === 0) {
            queryDisplay.textContent = 'No conditions added';
            return;
        }

        let query = 'SELECT * FROM table WHERE ';
        conditions.forEach((condition, index) => {
            if (index > 0) {
                query += ` ${condition.connector} `;
            }

            const column = columns.find(col => col.name === condition.column);
            const operator = operators[column.type].find(op => op.value === condition.operator);

            query += `${condition.column} ${operator.symbol}`;

            if (!['is_empty', 'is_not_empty'].includes(condition.operator)) {
                if (condition.operator === 'contains' || condition.operator === 'not_contains') {
                    query += ` '%${condition.value}%'`;
                } else if (condition.operator === 'starts_with') {
                    query += ` '${condition.value}%'`;
                } else if (condition.operator === 'ends_with') {
                    query += ` '%${condition.value}'`;
                } else if (['between', 'not_between'].includes(condition.operator)) {
                    query += ` '${condition.value}' AND '${condition.value2}'`;
                } else {
                    query += ` '${condition.value}'`;
                }
            }
        });

        queryDisplay.textContent = query;
    }

    // Apply the filter
    function applyFilter() {
        if (conditions.length === 0) {
            alert('Please add at least one condition');
            return;
        }

        const tables = window.DataManager.getAllTables();
        
        Object.keys(tables).forEach(tableKey => {
            const data = tables[tableKey];
            const filteredData = filterDataByConditions(data);
            window.DOMHelper.renderTable(tableKey, filteredData);
        });

        // Show filter notification
        showFilterNotification(`Filter applied with ${conditions.length} condition(s)`);
    }

    // Filter data based on conditions
    function filterDataByConditions(data) {
        return data.filter(row => {
            return evaluateConditions(row, conditions);
        });
    }

    // Evaluate conditions for a row
    function evaluateConditions(row, conditionList) {
        if (conditionList.length === 0) return true;

        let result = evaluateCondition(row, conditionList[0]);

        for (let i = 1; i < conditionList.length; i++) {
            const condition = conditionList[i];
            const conditionResult = evaluateCondition(row, condition);

            if (condition.connector === 'AND') {
                result = result && conditionResult;
            } else if (condition.connector === 'OR') {
                result = result || conditionResult;
            }
        }

        return result;
    }

    // Evaluate a single condition
    function evaluateCondition(row, condition) {
        const value = row[condition.column];
        const conditionValue = condition.value;
        const conditionValue2 = condition.value2;

        switch (condition.operator) {
            case 'equals':
                return value == conditionValue;
            case 'not_equals':
                return value != conditionValue;
            case 'contains':
                return value && value.toString().toLowerCase().includes(conditionValue.toLowerCase());
            case 'not_contains':
                return !value || !value.toString().toLowerCase().includes(conditionValue.toLowerCase());
            case 'starts_with':
                return value && value.toString().toLowerCase().startsWith(conditionValue.toLowerCase());
            case 'ends_with':
                return value && value.toString().toLowerCase().endsWith(conditionValue.toLowerCase());
            case 'is_empty':
                return !value || value === '';
            case 'is_not_empty':
                return value && value !== '';
            case 'greater_than':
                return parseFloat(value) > parseFloat(conditionValue);
            case 'less_than':
                return parseFloat(value) < parseFloat(conditionValue);
            case 'greater_equal':
                return parseFloat(value) >= parseFloat(conditionValue);
            case 'less_equal':
                return parseFloat(value) <= parseFloat(conditionValue);
            case 'between':
                const numValue = parseFloat(value);
                return numValue >= parseFloat(conditionValue) && numValue <= parseFloat(conditionValue2);
            case 'not_between':
                const numValue2 = parseFloat(value);
                return numValue2 < parseFloat(conditionValue) || numValue2 > parseFloat(conditionValue2);
            case 'after':
                return new Date(value) > new Date(conditionValue);
            case 'before':
                return new Date(value) < new Date(conditionValue);
            case 'on_or_after':
                return new Date(value) >= new Date(conditionValue);
            case 'on_or_before':
                return new Date(value) <= new Date(conditionValue);
            default:
                return true;
        }
    }

    // Reset all filters
    function resetFilter() {
        conditions = [];
        document.getElementById('filterConditions').innerHTML = '';
        updateQueryDisplay();
        
        // Reset table displays
        const tables = window.DataManager.getAllTables();
        Object.keys(tables).forEach(tableKey => {
            window.DOMHelper.renderTable(tableKey, tables[tableKey]);
        });
        
        hideFilterNotification();
    }

    // Show filter notification
    function showFilterNotification(message) {
        let notification = document.getElementById('filterNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'filterNotification';
            notification.className = 'fixed top-32 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            document.body.appendChild(notification);
        }
        notification.textContent = message;
        notification.style.display = 'block';
    }

    // Hide filter notification
    function hideFilterNotification() {
        const notification = document.getElementById('filterNotification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    // Export current filter as SQL
    function exportAsSQL() {
        const query = document.getElementById('queryDisplay').textContent;
        if (query === 'No conditions added') {
            alert('No filter conditions to export');
            return;
        }

        const blob = new Blob([query], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'filter_query.sql';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Load filter from SQL
    function loadFromSQL(sqlQuery) {
        // This is a simplified parser - in production, you'd want a more robust SQL parser
        // For now, we'll just show an alert
        alert('SQL import feature coming soon!');
    }

    // Get current conditions
    function getConditions() {
        return conditions;
    }

    // Parse direct SQL input
    function parseDirectSQL() {
        const input = document.getElementById('directSqlInput').value.trim();
        if (!input) {
            alert('Please enter a SQL condition');
            return;
        }
        
        // Clear existing conditions
        conditions = [];
        document.getElementById('filterConditions').innerHTML = '';
        
        // Simple parser for SQL-like conditions
        // Supports: ColumnA = 'value' AND/OR ColumnB > 5
        const parts = input.split(/\s+(AND|OR)\s+/i);
        
        for (let i = 0; i < parts.length; i += 2) {
            const conditionStr = parts[i].trim();
            const connector = i > 0 ? parts[i - 1].toUpperCase() : null;
            
            // Parse individual condition
            const parsed = parseConditionString(conditionStr);
            if (parsed) {
                const conditionId = conditionIdCounter++;
                const condition = {
                    id: conditionId,
                    column: parsed.column,
                    operator: parsed.operator,
                    value: parsed.value,
                    value2: parsed.value2 || '',
                    connector: connector,
                    groupId: null
                };
                
                conditions.push(condition);
                renderCondition(condition);
            }
        }
        
        updateQueryDisplay();
    }
    
    // Parse a single condition string
    function parseConditionString(str) {
        // Match patterns like: ColumnA = 'value' or ColumnA > 5
        const patterns = [
            // Between pattern
            /Column([A-N])\s+(BETWEEN)\s+'?([^']+)'?\s+AND\s+'?([^']+)'?/i,
            // Standard comparison
            /Column([A-N])\s*(=|!=|<>|>=|<=|>|<|LIKE|NOT LIKE)\s*'?([^']+)'?/i,
            // IS NULL/IS NOT NULL
            /Column([A-N])\s+(IS NULL|IS NOT NULL)/i
        ];
        
        for (const pattern of patterns) {
            const match = str.match(pattern);
            if (match) {
                const letterCol = letterToColumn[match[1]];
                if (!letterCol) continue;
                
                if (match[2].toUpperCase() === 'BETWEEN') {
                    return {
                        column: letterCol.name,
                        operator: 'between',
                        value: match[3].replace(/^'|'$/g, ''),
                        value2: match[4].replace(/^'|'$/g, '')
                    };
                } else if (match[2].toUpperCase() === 'IS NULL') {
                    return {
                        column: letterCol.name,
                        operator: 'is_empty',
                        value: ''
                    };
                } else if (match[2].toUpperCase() === 'IS NOT NULL') {
                    return {
                        column: letterCol.name,
                        operator: 'is_not_empty',
                        value: ''
                    };
                } else {
                    // Map SQL operators to our operators
                    let operator = 'equals';
                    const sqlOp = match[2].toUpperCase();
                    const operatorMap = {
                        '=': 'equals',
                        '!=': 'not_equals',
                        '<>': 'not_equals',
                        '>': 'greater_than',
                        '<': 'less_than',
                        '>=': 'greater_equal',
                        '<=': 'less_equal',
                        'LIKE': 'contains',
                        'NOT LIKE': 'not_contains'
                    };
                    
                    operator = operatorMap[sqlOp] || 'equals';
                    
                    // Handle LIKE patterns
                    let value = match[3].replace(/^'|'$/g, '');
                    if (sqlOp === 'LIKE' && value.startsWith('%') && value.endsWith('%')) {
                        operator = 'contains';
                        value = value.slice(1, -1);
                    } else if (sqlOp === 'LIKE' && value.endsWith('%')) {
                        operator = 'starts_with';
                        value = value.slice(0, -1);
                    } else if (sqlOp === 'LIKE' && value.startsWith('%')) {
                        operator = 'ends_with';
                        value = value.slice(1);
                    }
                    
                    return {
                        column: letterCol.name,
                        operator: operator,
                        value: value
                    };
                }
            }
        }
        
        alert('Could not parse condition: ' + str + '\nUse format: ColumnA = \'value\' or ColumnD > 5');
        return null;
    }
    
    // Export current filter as direct SQL
    function exportAsDirectSQL() {
        if (conditions.length === 0) {
            return '';
        }
        
        let sql = '';
        conditions.forEach((condition, index) => {
            if (index > 0) {
                sql += ` ${condition.connector} `;
            }
            
            const column = columns.find(col => col.name === condition.column);
            const operator = operators[column.type].find(op => op.value === condition.operator);
            
            sql += `Column${column.letter}`;
            
            if (condition.operator === 'is_empty') {
                sql += ' IS NULL';
            } else if (condition.operator === 'is_not_empty') {
                sql += ' IS NOT NULL';
            } else if (condition.operator === 'between' || condition.operator === 'not_between') {
                sql += ` ${operator.symbol} '${condition.value}' AND '${condition.value2}'`;
            } else if (condition.operator === 'contains' || condition.operator === 'not_contains') {
                sql += ` ${operator.symbol} '%${condition.value}%'`;
            } else if (condition.operator === 'starts_with') {
                sql += ` LIKE '${condition.value}%'`;
            } else if (condition.operator === 'ends_with') {
                sql += ` LIKE '%${condition.value}'`;
            } else {
                sql += ` ${operator.symbol} '${condition.value}'`;
            }
        });
        
        document.getElementById('directSqlInput').value = sql;
        return sql;
    }

    // Public API
    return {
        init,
        addCondition,
        removeCondition,
        updateColumn,
        updateOperator,
        updateValue,
        updateValue2,
        updateConnector,
        applyFilter,
        resetFilter,
        exportAsSQL,
        loadFromSQL,
        getConditions,
        parseDirectSQL,
        exportAsDirectSQL
    };
})();