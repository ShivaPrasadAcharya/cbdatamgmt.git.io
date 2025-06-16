// export.js - Export Module for CSV generation

const ExportModule = (function() {
    'use strict';

    // Export table data to CSV
    function exportTableData(tableKey) {
        const table = document.getElementById(`table-${tableKey}`);
        if (!table) {
            console.error(`Table ${tableKey} not found`);
            return;
        }

        // Get visible data from the table
        const data = getVisibleTableData(table);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${tableKey}_export_${timestamp}.csv`;
        
        // Export to CSV
        exportToCSV(data, filename);
    }

    // Get visible data from table element
    function getVisibleTableData(table) {
        const data = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            // Skip the letter row (first header row)
            if (index === 0 && row.parentElement.tagName === 'THEAD') {
                return;
            }
            
            const rowData = [];
            const cells = row.querySelectorAll(row.parentElement.tagName === 'THEAD' ? 'th' : 'td');
            
            cells.forEach(cell => {
                // Get original text if available (without highlighting)
                const text = cell.getAttribute('data-original-text') || cell.textContent;
                rowData.push(text.trim());
            });
            
            if (rowData.length > 0) {
                data.push(rowData);
            }
        });
        
        return data;
    }

    // Export data array to CSV
    function exportToCSV(data, filename = 'export.csv') {
        let csvContent = '';
        
        // If data is array of objects, convert to array of arrays
        if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
            const headers = Object.keys(data[0]);
            csvContent += headers.map(h => escapeCSV(h)).join(',') + '\n';
            
            data.forEach(row => {
                const values = headers.map(header => escapeCSV(row[header] || ''));
                csvContent += values.join(',') + '\n';
            });
        } else {
            // Data is already array of arrays
            data.forEach(row => {
                const values = row.map(cell => escapeCSV(cell || ''));
                csvContent += values.join(',') + '\n';
            });
        }
        
        // Create and download file
        downloadCSV(csvContent, filename);
    }

    // Escape CSV values
    function escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        value = value.toString();
        
        // Escape quotes and wrap in quotes if necessary
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return '"' + value.replace(/"/g, '""') + '"';
        }
        
        return value;
    }

    // Download CSV file
    function downloadCSV(content, filename) {
        const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // Export filtered data across all tables
    function exportAllFilteredData() {
        const allData = [];
        const tables = window.DataManager.getAllTables();
        
        Object.keys(tables).forEach(tableKey => {
            const table = document.getElementById(`table-${tableKey}`);
            if (table) {
                const data = getVisibleTableData(table);
                // Skip header row for subsequent tables
                const startIndex = allData.length === 0 ? 0 : 1;
                for (let i = startIndex; i < data.length; i++) {
                    // Add source column
                    const rowWithSource = [...data[i], tableKey];
                    allData.push(rowWithSource);
                }
            }
        });
        
        // Add source column header
        if (allData.length > 0 && allData[0].length > 0) {
            allData[0].push('Source');
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        exportToCSV(allData, `all_data_export_${timestamp}.csv`);
    }

    // Export data with custom formatting
    function exportWithFormat(tableKey, format = 'csv') {
        const table = document.getElementById(`table-${tableKey}`);
        if (!table) return;
        
        const data = getVisibleTableData(table);
        
        switch (format) {
            case 'csv':
                exportToCSV(data, `${tableKey}_export.csv`);
                break;
            case 'tsv':
                exportToTSV(data, `${tableKey}_export.tsv`);
                break;
            case 'json':
                exportToJSON(tableKey, `${tableKey}_export.json`);
                break;
            case 'js':
                exportToJS(tableKey, `${tableKey}_export.js`);
                break;
            default:
                console.error('Unsupported format:', format);
        }
    }
    
    // Export to JS format
    function exportToJS(tableKey, filename) {
        const tables = window.DataManager.getAllTables();
        const data = tables[tableKey] || [];
        
        // Convert data to CSV format
        const csvContent = Parser.dataToCSV(data);
        
        // Create JS file with CSV string
        const jsContent = `// ${filename}\nvar ${tableKey} = \`${csvContent}\`;`;
        
        const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Export to TSV format
    function exportToTSV(data, filename) {
        let tsvContent = '';
        
        data.forEach(row => {
            const values = row.map(cell => (cell || '').toString().replace(/\t/g, ' '));
            tsvContent += values.join('\t') + '\n';
        });
        
        const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Export to JSON format
    function exportToJSON(tableKey, filename) {
        const tables = window.DataManager.getAllTables();
        const data = tables[tableKey] || [];
        
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Export current view (filtered/searched data)
    function exportCurrentView(tableKey) {
        const table = document.getElementById(`table-${tableKey}`);
        if (!table) return;
        
        const visibleRows = table.querySelectorAll('tbody tr');
        if (visibleRows.length === 0) {
            alert('No data to export');
            return;
        }
        
        const data = getVisibleTableData(table);
        const timestamp = new Date().toISOString().slice(0, 10);
        const searchTerm = window.SearchModule.getCurrentSearchTerm();
        const filterCount = window.SQLFilter.getConditions().length;
        
        let suffix = 'view';
        if (searchTerm) suffix = `search_${searchTerm}`;
        else if (filterCount > 0) suffix = `filtered`;
        
        exportToCSV(data, `${tableKey}_${suffix}_${timestamp}.csv`);
    }

    // Generate export summary
    function generateExportSummary(tableKey) {
        const tables = window.DataManager.getAllTables();
        const data = tables[tableKey] || [];
        
        const summary = {
            tableName: tableKey,
            totalRecords: data.length,
            exportDate: new Date().toISOString(),
            columns: Object.keys(data[0] || {}),
            filters: window.SQLFilter.getConditions(),
            searchTerm: window.SearchModule.getCurrentSearchTerm()
        };
        
        return summary;
    }

    // Public API
    return {
        exportTableData,
        exportToCSV,
        exportAllFilteredData,
        exportWithFormat,
        exportCurrentView,
        generateExportSummary
    };
})();