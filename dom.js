// utils/dom.js - DOM Helper Module

const DOMHelper = (function() {
    'use strict';

    // Create table element
    function createTable(tableKey, data) {
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-container';
        
        const table = document.createElement('table');
        table.id = `table-${tableKey}`;
        table.className = 'min-w-full table-auto';
        
        // Create header
        const thead = createTableHeader();
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        table.appendChild(tbody);
        
        tableWrapper.appendChild(table);
        
        // Render data if provided
        if (data && data.length > 0) {
            renderTableBody(tbody, data);
        }
        
        return tableWrapper;
    }

    // Create table header
    function createTableHeader() {
        const thead = document.createElement('thead');
        thead.className = 'sticky-header';
        
        // Create two header rows - one for letters, one for names
        const letterRow = document.createElement('tr');
        letterRow.className = 'bg-gray-200 border-b';
        
        const nameRow = document.createElement('tr');
        nameRow.className = 'bg-gray-100';
        
        const headers = [
            { key: 'caseno', label: 'Case No' },
            { key: 'dno', label: 'D.No' },
            { key: 'nkp', label: 'NKP' },
            { key: 'vol', label: 'Vol' },
            { key: 'date', label: 'Date' },
            { key: 'cassename', label: 'Case Name' },
            { key: 'party1', label: 'Party 1' },
            { key: 'party2', label: 'Party 2' },
            { key: 'bench', label: 'Bench' },
            { key: 'remark1', label: 'Remark 1' },
            { key: 'remark2', label: 'Remark 2' },
            { key: 'remark3', label: 'Remark 3' },
            { key: 'remark4', label: 'Remark 4' },
            { key: 'remark5', label: 'Remark 5' }
        ];
        
        headers.forEach((header, index) => {
            // Letter header
            const letterTh = document.createElement('th');
            letterTh.className = 'px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase';
            letterTh.textContent = String.fromCharCode(65 + index); // A, B, C, etc.
            letterRow.appendChild(letterTh);
            
            // Name header
            const nameTh = document.createElement('th');
            nameTh.className = 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            nameTh.textContent = header.label;
            nameTh.dataset.column = header.key;
            nameTh.dataset.columnLetter = String.fromCharCode(65 + index);
            
            // Add sorting capability
            nameTh.style.cursor = 'pointer';
            nameTh.onclick = () => sortTable(header.key);
            
            nameRow.appendChild(nameTh);
        });
        
        thead.appendChild(letterRow);
        thead.appendChild(nameRow);
        return thead;
    }

    // Render table body
    function renderTableBody(tbody, data) {
        tbody.innerHTML = '';
        
        data.forEach((row, index) => {
            const tr = createTableRow(row, index);
            tbody.appendChild(tr);
        });
    }

    // Create table row
    function createTableRow(row, index) {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100';
        
        const columns = ['caseno', 'dno', 'nkp', 'vol', 'date', 'cassename', 
                        'party1', 'party2', 'bench', 'remark1', 'remark2', 
                        'remark3', 'remark4', 'remark5'];
        
        columns.forEach(col => {
            const td = document.createElement('td');
            td.className = 'px-4 py-2 text-sm';
            
            const value = row[col] || '';
            td.textContent = value;
            td.setAttribute('data-original-text', value);
            
            // Add tooltip for long text
            if (value.length > 20) {
                td.title = value;
                td.textContent = truncateText(value, 20);
            }
            
            // Special formatting for certain columns
            if (col === 'cassename') {
                td.className += ' font-medium';
            } else if (col === 'date') {
                td.className += ' whitespace-nowrap';
            }
            
            tr.appendChild(td);
        });
        
        return tr;
    }

    // Render table with data
    function renderTable(tableKey, data) {
        const table = document.getElementById(`table-${tableKey}`);
        if (!table) {
            console.error(`Table ${tableKey} not found`);
            return;
        }
        
        const tbody = table.querySelector('tbody');
        renderTableBody(tbody, data);
        
        // Update row count
        updateRowCount(tableKey, data.length);
    }

    // Create tab navigation
    function createTabNav(tables) {
        const tabNav = document.getElementById('tabNav');
        if (!tabNav) return;
        
        tabNav.innerHTML = '';
        
        Object.keys(tables).forEach((key, index) => {
            const button = document.createElement('button');
            button.id = `tab-${key}`;
            button.className = `px-6 py-3 font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none relative`;
            
            if (index === 0) {
                button.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
            }
            
            button.innerHTML = `
                <i class="fas fa-file-alt mr-2"></i>
                ${key}.txt
                <span class="badge ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs" style="display: none;">0</span>
            `;
            
            button.onclick = () => showTab(key);
            tabNav.appendChild(button);
        });
    }

    // Create tab content
    function createTabContent(tables) {
        const tabContents = document.getElementById('tabContents');
        if (!tabContents) return;
        
        tabContents.innerHTML = '';
        
        Object.keys(tables).forEach((key, index) => {
            const tabContent = document.createElement('div');
            tabContent.className = `tab-content ${index === 0 ? 'active' : ''}`;
            tabContent.id = `content-${key}`;
            
            tabContent.innerHTML = `
                <div class="mb-4 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-semibold">${key}.txt Data</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            <span id="rowCount-${key}">${tables[key].length}</span> records
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="ExportModule.exportCurrentView('${key}')" 
                                class="export-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            <i class="fas fa-download mr-2"></i>Export CSV
                        </button>
                        <button onclick="showTableOptions('${key}')" 
                                class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            <i class="fas fa-cog mr-2"></i>Options
                        </button>
                    </div>
                </div>
            `;
            
            const tableWrapper = createTable(key, tables[key]);
            tabContent.appendChild(tableWrapper);
            tabContents.appendChild(tabContent);
        });
    }

    // Show specific tab
    function showTab(tabKey) {
        // Update tab buttons
        document.querySelectorAll('#tabNav button').forEach(btn => {
            btn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
            btn.classList.add('text-gray-600');
        });
        
        const activeTab = document.getElementById(`tab-${tabKey}`);
        if (activeTab) {
            activeTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
            activeTab.classList.remove('text-gray-600');
        }
        
        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`content-${tabKey}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Store current tab
        window.currentTab = tabKey;
    }

    // Update row count display
    function updateRowCount(tableKey, count) {
        const countElement = document.getElementById(`rowCount-${tableKey}`);
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // Sort table by column
    function sortTable(column) {
        const tableKey = window.currentTab || Object.keys(window.DataManager.getAllTables())[0];
        const data = window.DataManager.getTableData(tableKey);
        
        if (!data) return;
        
        // Determine sort direction
        const currentSort = window.sortState || {};
        const isAscending = currentSort.column === column ? !currentSort.ascending : true;
        
        // Sort data
        const sortedData = [...data].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle numeric columns
            if (column === 'vol' || column === 'nkp' || column === 'dno') {
                aVal = parseInt(aVal) || 0;
                bVal = parseInt(bVal) || 0;
            }
            
            // Handle date columns
            if (column === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return isAscending ? -1 : 1;
            if (aVal > bVal) return isAscending ? 1 : -1;
            return 0;
        });
        
        // Update sort state
        window.sortState = { column, ascending: isAscending };
        
        // Render sorted data
        renderTable(tableKey, sortedData);
        
        // Update sort indicators
        updateSortIndicators(column, isAscending);
    }

    // Update sort indicators in header
    function updateSortIndicators(column, isAscending) {
        const headers = document.querySelectorAll('th');
        headers.forEach(th => {
            const icon = th.querySelector('.sort-icon');
            if (icon) icon.remove();
            
            if (th.dataset.column === column) {
                const sortIcon = document.createElement('i');
                sortIcon.className = `fas fa-sort-${isAscending ? 'up' : 'down'} ml-2 text-blue-500 sort-icon`;
                th.appendChild(sortIcon);
            }
        });
    }

    // Show loading spinner
    function showLoading() {
        const tabContents = document.getElementById('tabContents');
        if (tabContents) {
            tabContents.innerHTML = `
                <div class="flex justify-center items-center h-64">
                    <div class="loader"></div>
                </div>
            `;
        }
    }

    // Hide loading spinner
    function hideLoading() {
        // Loading will be replaced when content is rendered
    }

    // Create modal
    function createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden overflow-y-auto h-full w-full z-50';
        
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white modal">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">${title}</h3>
                    <button onclick="closeModal('${id}')" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Show modal
    function showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Close modal
    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Truncate text
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const colors = {
            info: 'bg-blue-500',
            success: 'bg-green-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Public API
    return {
        createTable,
        renderTable,
        createTabNav,
        createTabContent,
        showTab,
        showLoading,
        hideLoading,
        createModal,
        showModal,
        closeModal,
        showNotification,
        sortTable,
        updateRowCount
    };
})();