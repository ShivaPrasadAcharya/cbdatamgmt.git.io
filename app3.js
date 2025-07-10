// app3.js - Rendering Functions
DataApp.prototype.render = function() {
    const container = document.getElementById('root');
    container.innerHTML = this.getHTML();
    this.attachEventListeners();
};

// Add a single toggle for all ribbons
DataApp.prototype.getHTML = function() {
    const availableDatasets = Object.keys(this.originalData);
    let totalOriginalRecords, totalFilteredRecords;
    if (this.showMultipleDatasets) {
        totalOriginalRecords = Object.values(this.originalData).reduce((sum, data) => sum + data.length, 0);
        totalFilteredRecords = Object.values(this.filteredData).reduce((sum, data) => sum + data.length, 0);
    } else {
        totalOriginalRecords = this.originalData[this.currentDataset]?.length || 0;
        totalFilteredRecords = this.filteredData[this.currentDataset]?.length || 0;
    }
    const searchPosition = window.searchEngine.getCurrentPosition();
    // Single toggle state
    const ribbonsCollapsed = this.ribbonsCollapsed ? 'collapsed' : '';
    return `
        <div class="container">
            <button class="collapse-toggle" style="margin-bottom:12px;" onclick="window.dataApp.toggleAllRibbons()">${this.ribbonsCollapsed ? '▼ Expand Menu' : '▲ Collapse Menu'}</button>
            <div class="header ${ribbonsCollapsed}">
                <div class="header-content" style="display:${this.ribbonsCollapsed ? 'none' : 'block'}">
                    <h2>🗃️संवैधानिक इजलास फैसला व्यवस्थापन प्रणाली (CBJMS) </h2>
                    <p>Developed by: Shiva Prasad Acharya, Supreme Court </p>
                </div>
            </div>
            <div class="sticky-search ${ribbonsCollapsed}">
                <div class="sticky-search-content" style="display:${this.ribbonsCollapsed ? 'none' : 'block'}">
                    <div class="controls">
                        <div class="dataset-selector">
                            ${availableDatasets.map(dataset => {
                                const info = this.datasetInfo[dataset] || {};
                                const isActive = this.currentDataset === dataset;
                                return `<button class="dataset-btn ${isActive ? 'active' : ''}" data-dataset="${dataset}">
                                    ${info.emoji || '📄'} ${info.name || dataset}
                                </button>`;
                            }).join('')}
                            <button class="multiple-datasets-toggle ${this.showMultipleDatasets ? 'active' : ''}" onclick="window.dataApp.toggleMultipleDatasets()">
                                ${this.showMultipleDatasets ? '📋 Single View' : '📊 Multiple View'}
                            </button>
                        </div>
                        
                        <div style="display: flex; align-items: center; flex: 1; gap: 10px;">
                            <input type="text" class="search-input" placeholder="🔍 Global search across datasets..." value="${this.searchTerm}">
                            ${this.searchTerm && searchPosition.total > 0 ? `
                                <div class="search-navigation">
                                    <button class="search-nav-btn" onclick="window.searchEngine.navigateToMatch('prev')" ${searchPosition.total <= 1 ? 'disabled' : ''}>
                                        ⬆️ Prev
                                    </button>
                                    <div class="search-position">
                                        ${searchPosition.current}/${searchPosition.total}
                                    </div>
                                    <button class="search-nav-btn" onclick="window.searchEngine.navigateToMatch('next')" ${searchPosition.total <= 1 ? 'disabled' : ''}>
                                        ⬇️ Next
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        
                        <button class="help-btn">❓ Help</button>
                    </div>

                    <button class="sql-filter-toggle ${this.sqlFilterExpanded ? 'expanded' : ''}" onclick="window.dataApp.toggleSQLFilter()">
                        🔧 Advanced Filtering
                        <span class="toggle-icon">▼</span>
                    </button>

                    <div class="sql-section ${this.sqlFilterExpanded ? 'expanded' : 'collapsed'}">
                        <div class="filter-tabs">
                            <button class="filter-tab ${this.activeFilterTab === 'simple' ? 'active' : ''}" onclick="window.dataApp.toggleFilterTab('simple')">
                                🎯 Simple Filter
                            </button>
                            <button class="filter-tab ${this.activeFilterTab === 'advanced' ? 'active' : ''}" onclick="window.dataApp.toggleFilterTab('advanced')">
                                ⚡ SQL Expert
                            </button>
                        </div>

                        <div class="filter-content ${this.activeFilterTab === 'simple' ? 'active' : ''}">
                            ${this.renderSimpleFilterBuilder()}
                        </div>

                        <div class="filter-content ${this.activeFilterTab === 'advanced' ? 'active' : ''}">
                            ${this.renderAdvancedFilter()}
                        </div>
                    </div>
                </div>
            </div>

            <div class="export-section ${ribbonsCollapsed}">
                <div class="export-section-content" style="display:${this.ribbonsCollapsed ? 'none' : 'block'}">
                    <div class="export-section">
                        <span class="export-label">Export:</span>
                        <div class="export-dropdown-group">
                            <div class="dropdown">
                                <button class="export-btn dropdown-toggle">⬇️ Download ▼</button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" onclick="window.dataApp.downloadCurrentTable('table')">Table</button>
                                    <button class="dropdown-item" onclick="window.dataApp.downloadCurrentTable('stack')">Stack</button>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="export-btn dropdown-toggle">📋 Copy ▼</button>
                                <div class="dropdown-menu">
                                    <button class="dropdown-item" onclick="window.dataApp.copyCurrentTableToClipboard('table')">Table</button>
                                    <button class="dropdown-item" onclick="window.dataApp.copyCurrentTableToClipboard('stack')">Stack</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats ${ribbonsCollapsed}" style="display:${this.ribbonsCollapsed ? 'none' : 'flex'}">
                <div class="stat-card">
                    <div class="stat-number">${totalOriginalRecords}</div>
                    <div class="stat-label">Total Records</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalFilteredRecords}</div>
                    <div class="stat-label">Filtered Results</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.showMultipleDatasets ? availableDatasets.length : 1}</div>
                    <div class="stat-label">${this.showMultipleDatasets ? 'Datasets' : 'Dataset'}</div>
                </div>
            </div>

            ${this.showMultipleDatasets ? this.renderAllDataTables() : this.renderSingleDataTable()}
        </div>
    `;
};

DataApp.prototype.toggleAllRibbons = function() {
    this.ribbonsCollapsed = !this.ribbonsCollapsed;
    this.render();
};

DataApp.prototype.toggleRibbon = function(ribbon) {
    if (ribbon === 'header') this.headerCollapsed = !this.headerCollapsed;
    if (ribbon === 'search') this.searchCollapsed = !this.searchCollapsed;
    if (ribbon === 'export') this.exportCollapsed = !this.exportCollapsed;
    this.render();
};

DataApp.prototype.renderSimpleFilterBuilder = function() {
    const headers = this.headers[this.currentDataset] || [];
    const selectedColumns = this.selectedColumns[this.currentDataset] || [];
    const operators = this.getOperatorOptions();

    return `
        <div class="simple-filter-builder">
            <button class="column-selector-toggle" onclick="window.dataApp.toggleColumnSelector()">
                ${this.showColumnSelector ? '▼ Hide' : '▶ Show'} Column Selector
            </button>
            
            ${this.showColumnSelector ? `
                <div class="column-selector">
                    <h4>Select Columns to Display:</h4>
                    <div class="column-checkboxes">
                        ${headers.map(header => `
                            <label>
                                <input type="checkbox" 
                                       value="${header}"
                                       ${selectedColumns.includes(header) ? 'checked' : ''}
                                       onchange="window.dataApp.updateSelectedColumns('${header}', this.checked)">
                                ${header}
                            </label>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="filter-conditions">
                ${this.simpleConditions.map((condition, index) => `
                    <div class="filter-condition">
                        <select onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'column', this.value)">
                            ${headers.map(header => 
                                `<option value="${header}" ${condition.column === header ? 'selected' : ''}>${header}</option>`
                            ).join('')}
                        </select>
                        
                        <select onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'operator', this.value)">
                            ${operators.map(op => 
                                `<option value="${op.value}" ${condition.operator === op.value ? 'selected' : ''}>${op.label}</option>`
                            ).join('')}
                        </select>
                        
                        ${['IS NULL', 'IS NOT NULL'].includes(condition.operator) ? '' : `
                            <input type="text" 
                                   placeholder="${this.getPlaceholderForOperator(condition.operator)}"
                                   value="${condition.value}"
                                   onchange="window.dataApp.updateSimpleCondition(${condition.id}, 'value', this.value)">
                        `}
                        
                        <button class="condition-remove" onclick="window.dataApp.removeSimpleCondition(${condition.id})">
                            ✕
                        </button>
                    </div>
                    
                    ${index < this.simpleConditions.length - 1 ? `
                        <div class="condition-logic">
                            <span style="font-size: 12px; color: #6c757d;">Logic:</span>
                            <select onchange="window.dataApp.updateSimpleCondition(${this.simpleConditions[index + 1].id}, 'logic', this.value)">
                                <option value="AND" ${this.simpleConditions[index + 1].logic === 'AND' ? 'selected' : ''}>AND</option>
                                <option value="OR" ${this.simpleConditions[index + 1].logic === 'OR' ? 'selected' : ''}>OR</option>
                            </select>
                        </div>
                    ` : ''}
                `).join('')}
            </div>
            
            <button class="add-condition-btn" onclick="window.dataApp.addSimpleCondition()">
                ➕ Add Condition
            </button>
            
            ${this.simpleConditions.length > 0 ? `
                <div class="preview-label">Generated SQL:</div>
                <div class="preview-sql">${this.sqlQuery || 'No conditions set'}</div>
            ` : `
                <div style="text-align: center; padding: 20px; color: #6c757d; font-style: italic;">
                    Click "Add Condition" to start building your filter
                </div>
            `}
            
            <div class="simple-filter-controls">
                <button class="execute-btn" onclick="window.dataApp.executeSQL()">▶️ Apply Filter</button>
                <button class="clear-btn" onclick="window.dataApp.clearSimpleFilters()">🗑️ Clear All</button>
            </div>
        </div>
    `;
};

DataApp.prototype.renderAdvancedFilter = function() {
    return `
        <div class="advanced-filter">
            <textarea class="sql-input" placeholder="Enter SQL WHERE clause for ${this.showMultipleDatasets ? 'all datasets' : (this.datasetInfo[this.currentDataset]?.name || this.currentDataset)} (e.g., WHERE Status = 'Active' AND Amount > 50000)">${this.sqlQuery}</textarea>
            <div class="sql-controls">
                ${(this.headers[this.currentDataset] || []).map(header => 
                    `<button class="column-btn" data-column="${header}">${header}</button>`
                ).join('')}
                <button class="execute-btn" onclick="window.dataApp.executeSQL()">▶️ Execute</button>
                <button class="clear-btn" onclick="window.dataApp.clearFilters()">🗑️ Clear</button>
            </div>
        </div>
    `;
};

DataApp.prototype.getPlaceholderForOperator = function(operator) {
    const placeholders = {
        '=': 'Enter exact value',
        '!=': 'Enter value to exclude',
        '>': 'Enter number',
        '<': 'Enter number',
        '>=': 'Enter minimum value',
        '<=': 'Enter maximum value',
        'LIKE': 'Enter text to search',
        'NOT LIKE': 'Enter text to exclude',
        'STARTS WITH': 'Enter starting text',
        'ENDS WITH': 'Enter ending text',
        'IN': 'Enter values separated by commas',
        'NOT IN': 'Enter values to exclude (comma-separated)',
        'IS NULL': '',
        'IS NOT NULL': ''
    };
    return placeholders[operator] || 'Enter value';
};

DataApp.prototype.renderSingleDataTable = function() {
    const dataset = this.currentDataset;
    const data = this.filteredData[dataset] || [];
    const originalData = this.originalData[dataset] || [];
    const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
    const info = this.datasetInfo[dataset] || {};
    
    return `
        <div class="data-section">
            <div class="data-section-header">
                <h2 class="data-section-title">
                    ${info.emoji || '📄'} ${info.name || dataset} Dataset
                </h2>
                <div class="data-section-stats">
                    <div class="mini-stat">
                        <div class="mini-stat-number">${originalData.length}</div>
                        <div class="mini-stat-label">Total</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-number">${data.length}</div>
                        <div class="mini-stat-label">Shown</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-number">${headers.length}</div>
                        <div class="mini-stat-label">Columns</div>
                    </div>
                </div>
            </div>
            
            ${info.description ? `<p style="color: #666; margin-bottom: 15px; font-style: italic;">${info.description}</p>` : ''}
            
            ${data.length > 0 ? this.renderDataTable(data, headers, dataset) : this.renderNoResults(dataset)}
        </div>
    `;
};

DataApp.prototype.renderAllDataTables = function() {
    return Object.keys(this.originalData).map(dataset => {
        const data = this.filteredData[dataset] || [];
        const originalData = this.originalData[dataset] || [];
        const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
        const info = this.datasetInfo[dataset] || {};
        
        return `
            <div class="data-section">
                <div class="data-section-header">
                    <h2 class="data-section-title">
                        ${info.emoji || '📄'} ${info.name || dataset} Dataset
                    </h2>
                    <div class="data-section-stats">
                        <div class="mini-stat">
                            <div class="mini-stat-number">${originalData.length}</div>
                            <div class="mini-stat-label">Total</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-number">${data.length}</div>
                            <div class="mini-stat-label">Shown</div>
                        </div>
                        <div class="mini-stat">
                            <div class="mini-stat-number">${headers.length}</div>
                            <div class="mini-stat-label">Columns</div>
                        </div>
                    </div>
                </div>
                
                ${info.description ? `<p style="color: #666; margin-bottom: 15px; font-style: italic;">${info.description}</p>` : ''}
                
                ${data.length > 0 ? this.renderDataTable(data, headers, dataset) : this.renderNoResults(dataset)}
            </div>
        `;
    }).join('');
};

DataApp.prototype.renderDataTable = function(data, headers, dataset) {
    const searchTermToUse = this.searchTerm;
    const isLinksDataset = dataset === 'data3' && headers.includes('Link');
    const isImagesDataset = dataset === 'data2' && headers.includes('Image');
    if (isImagesDataset) {
        // Render as image cards with expand-on-click
        return `<div class="image-card-grid">
            ${data.map((row, idx) => `
                <div class="image-card">
                    <img src="${row['Image']}" alt="${row['Title'] || ''}" class="image-card-img" style="cursor: pointer;" onclick="window.dataApp.expandImage('${row['Image']}', '${row['Title'] || ''}', '${row['Description'] || ''}')" />
                    <div class="image-card-title">${row['Title'] || ''}</div>
                    <div class="image-card-desc">${row['Description'] || ''}</div>
                </div>
            `).join('')}
        </div>
        <div id="image-modal" class="image-modal" style="display:none;">
            <span class="image-modal-close" onclick="window.dataApp.closeImageModal()">&times;</span>
            <img class="image-modal-content" id="image-modal-img" />
            <div id="image-modal-caption"></div>
        </div>`;
    }
    // Responsive table toggle
    const viewMode = this.tableViewMode || 'stack';
    const toggleBtn = `<button class="table-view-toggle" onclick="window.dataApp.toggleTableViewMode()">
        ${viewMode === 'table' ? '📑 Stacked View' : '📊 Table View'}
    </button>`;
    if (viewMode === 'table') {
        return `
            <div class="data-table">
                <div class="table-container">
                    ${toggleBtn}
                    <table class="zebra-striped">
                        <thead>
                            <tr>
                                ${headers.map(header => `<th title="${header}">${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((row, index) => `
                                <tr data-row-index="${index}">
                                    ${headers.map(header => {
                                        let cellValue = row[header] || '';
                                        let highlightedValue = window.searchEngine.highlight(cellValue, searchTermToUse);
                                        if (isLinksDataset && header === 'Link' && cellValue) {
                                            let linkText = 'Open Link';
                                            if (cellValue.endsWith('.pdf')) linkText = 'Open PDF';
                                            else if (cellValue.endsWith('.docx')) linkText = 'Open DOCX';
                                            else if (/^https?:\/\//.test(cellValue)) linkText = 'Visit Website';
                                            else linkText = cellValue;
                                            highlightedValue = `<a href="${cellValue}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                                        }
                                        return `<td title="${cellValue}" data-column="${header}">${highlightedValue}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else {
        // Stacked view: each field-value pair on its own line, no card borders
        return `
            <div class="data-table">
                <div class="table-container">
                    ${toggleBtn}
                    <div class="stack-table-view">
                        ${data.map((row, index) => `
                            <div class="stack-row">
                                <div class="stack-row-index">#${index + 1}</div>
                                ${headers.map(header => {
                                    let cellValue = row[header] || '';
                                    let highlightedValue = window.searchEngine.highlight(cellValue, searchTermToUse);
                                    if (isLinksDataset && header === 'Link' && cellValue) {
                                        let linkText = 'Open Link';
                                        if (cellValue.endsWith('.pdf')) linkText = 'Open PDF';
                                        else if (cellValue.endsWith('.docx')) linkText = 'Open DOCX';
                                        else if (/^https?:\/\//.test(cellValue)) linkText = 'Visit Website';
                                        else linkText = cellValue;
                                        highlightedValue = `<a href="${cellValue}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
                                    }
                                    return `<div class="stack-cell"><span class="stack-label">${header}:</span> <span class="stack-value">${highlightedValue}</span></div>`;
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

DataApp.prototype.renderNoResults = function(dataset) {
    const info = this.datasetInfo[dataset] || {};
    return `
        <div class="data-table">
            <div class="no-results">
                <h3>📭 No Results Found in ${info.name || dataset}</h3>
                <p>Try adjusting your search criteria or SQL filter</p>
            </div>
        </div>
    `;
};

// Add copy and download methods to DataApp
DataApp.prototype.copyCurrentTableToClipboard = function(view = null) {
    const dataset = this.currentDataset;
    const data = this.filteredData[dataset] || [];
    const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
    if (data.length === 0) {
        alert('No data to copy.');
        return;
    }
    let text = '';
    if (view === 'card') {
        text = data.map((row, idx) =>
            `#${idx + 1}\n` + headers.map(h => `${h}: ${row[h] || ''}`).join(' | ')
        ).join('\n\n');
    } else if (view === 'stack') {
        text = data.map((row, idx) =>
            `#${idx + 1}\n` + headers.map(h => `${h}: ${row[h] || ''}`).join('\n')
        ).join('\n\n');
    } else {
        text = [headers.join('\t'), ...data.map(row => headers.map(h => row[h] || '').join('\t'))].join('\n');
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied!');
        }, () => {
            alert('Failed to copy.');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied!');
    }
};

DataApp.prototype.downloadCurrentTable = function(view = null) {
    const dataset = this.currentDataset;
    const data = this.filteredData[dataset] || [];
    const headers = this.selectedColumns[dataset] || this.headers[dataset] || [];
    if (data.length === 0) {
        alert('No data to download.');
        return;
    }
    let text = '';
    let ext = 'txt';
    if (view === 'card') {
        text = data.map((row, idx) =>
            `#${idx + 1}\n` + headers.map(h => `${h}: ${row[h] || ''}`).join(' | ')
        ).join('\n\n');
    } else if (view === 'stack') {
        text = data.map((row, idx) =>
            `#${idx + 1}\n` + headers.map(h => `${h}: ${row[h] || ''}`).join('\n')
        ).join('\n\n');
    } else {
        text = [headers.join('\t'), ...data.map(row => headers.map(h => row[h] || '').join('\t'))].join('\n');
        ext = 'tsv';
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset}_table.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

// Add expand/collapse image modal logic to DataApp
DataApp.prototype.expandImage = function(src, title, desc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const caption = document.getElementById('image-modal-caption');
    if (modal && modalImg && caption) {
        modal.style.display = 'block';
        modalImg.src = src;
        caption.innerHTML = `<b>${title}</b><br>${desc}`;
    }
};
DataApp.prototype.closeImageModal = function() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.style.display = 'none';
};