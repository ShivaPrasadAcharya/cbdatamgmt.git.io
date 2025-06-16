// app.js - Main Application Controller

// Data Manager Module
const DataManager = (function() {
    'use strict';
    
    let tables = {};
    
    function init() {
        // Initialize empty - will be populated by file loads
        tables = {};
    }
    
    function getAllTables() {
        return tables;
    }
    
    function getTableData(tableKey) {
        return tables[tableKey] || [];
    }
    
    function setTableData(tableKey, data) {
        tables[tableKey] = data;
    }
    
    function addTable(tableKey, data) {
        tables[tableKey] = data;
    }
    
    function removeTable(tableKey) {
        delete tables[tableKey];
    }
    
    return {
        init,
        getAllTables,
        getTableData,
        setTableData,
        addTable,
        removeTable
    };
})();

// Main Application
const App = (function() {
    'use strict';
    
    // Initialize application
    function init() {
        console.log('Initializing Data Management System...');
        
        // Initialize data manager
        DataManager.init();
        
        // Initialize UI
        DOMHelper.showLoading();
        
        // Set up event handlers
        setupEventHandlers();
        
        // Try to load data files
        loadDataFiles();
    }
    
    // Load data files
    async function loadDataFiles() {
        // Show loading message
        document.getElementById('tabContents').innerHTML = `
            <div class="text-center p-8">
                <div class="loader mb-4"></div>
                <h2 class="text-xl font-semibold">Loading data files...</h2>
            </div>
        `;
        
        let loadedCount = 0;
        
        // Check for JavaScript data variables
        const dataVariables = ['data1', 'data2', 'data3', 'data4', 'data5'];
        
        for (let i = 0; i < dataVariables.length; i++) {
            const varName = dataVariables[i];
            // Check if the variable exists in global scope
            if (window[varName] && typeof window[varName] === 'string') {
                // Parse the CSV string
                const result = Parser.parseCSV(window[varName], varName);
                if (result.success) {
                    DataManager.addTable(varName, result.data);
                    loadedCount++;
                }
            }
        }
        
        // Initialize UI with loaded data
        const tables = DataManager.getAllTables();
        if (Object.keys(tables).length > 0) {
            DOMHelper.createTabNav(tables);
            DOMHelper.createTabContent(tables);
            SQLFilter.init();
            DOMHelper.showNotification(`Loaded ${loadedCount} data file(s)`, 'success');
        } else {
            document.getElementById('tabContents').innerHTML = `
                <div class="text-center p-8">
                    <p class="text-red-600">No data files found. Please ensure data1.js, data2.js etc. are included before app.js in your HTML.</p>
                    <div class="mt-4">
                        <button onclick="showPasteModal()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
                            <i class="fas fa-paste mr-2"></i>Add Data Manually
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    // Set up drag and drop functionality
    function setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = Array.from(e.dataTransfer.files).filter(file => file.name.endsWith('.txt'));
            if (files.length > 0) {
                handleFileSelect({ target: { files: files } });
            }
        });
    }
    
    // Set up event handlers
    function setupEventHandlers() {
        // File upload handler
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.txt';
        fileInput.style.display = 'none';
        fileInput.id = 'hiddenFileInput';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Handle file selection
    async function handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        DOMHelper.showLoading();
        
        const result = await Parser.parseMultipleFiles(files);
        
        if (result.errors.length > 0) {
            result.errors.forEach(error => {
                DOMHelper.showNotification(error, 'error');
            });
        }
        
        // Add parsed data to tables
        Object.keys(result.results).forEach(key => {
            DataManager.addTable(key, result.results[key]);
        });
        
        // Refresh UI
        const tables = DataManager.getAllTables();
        DOMHelper.createTabNav(tables);
        DOMHelper.createTabContent(tables);
        DOMHelper.hideLoading();
        
        if (Object.keys(result.results).length > 0) {
            DOMHelper.showNotification(`Successfully loaded ${Object.keys(result.results).length} file(s)`, 'success');
        }
    }
    
    // Public functions
    window.toggleHelp = function() {
        const helpSection = document.getElementById('helpSection');
        helpSection.classList.toggle('hidden');
    };
    
    window.toggleFilter = function() {
        const content = document.getElementById('filterContent');
        const toggle = document.getElementById('filterToggle');
        content.classList.toggle('active');
        toggle.classList.toggle('fa-chevron-down');
        toggle.classList.toggle('fa-chevron-up');
    };
    
    window.uploadDataFiles = function() {
        document.getElementById('hiddenFileInput').click();
    };
    
    window.showPasteModal = function() {
        const modalContent = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">File Name (e.g., data1, data2)</label>
                    <input type="text" id="pasteFileName" class="w-full px-3 py-2 border rounded-lg" placeholder="data1">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Paste your CSV data here:</label>
                    <textarea id="pasteData" class="w-full px-3 py-2 border rounded-lg h-64" 
                        placeholder="Case No,D.No,NKP,Vol,Date,Case Name,Party 1,Party 2,Bench,Remark 1,Remark 2,Remark 3,Remark 4,Remark 5
1,111,45,3,15-01-2025,Smith vs Jones,John Smith,Mary Jones,Bench-1,Initial hearing,Documents pending,N/A,N/A,N/A"></textarea>
                </div>
                <button onclick="processPastedData()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-check mr-2"></i>Process Data
                </button>
            </div>
        `;
        
        if (!document.getElementById('pasteModal')) {
            DOMHelper.createModal('pasteModal', 'Paste Data', modalContent);
        } else {
            document.querySelector('#pasteModal .modal-content').innerHTML = modalContent;
        }
        
        DOMHelper.showModal('pasteModal');
    };
    
    window.processPastedData = function() {
        const fileName = document.getElementById('pasteFileName').value || 'data1';
        const data = document.getElementById('pasteData').value;
        
        if (!data.trim()) {
            DOMHelper.showNotification('Please paste some data', 'error');
            return;
        }
        
        const result = Parser.parseCSV(data, fileName);
        
        if (result.success) {
            DataManager.addTable(fileName, result.data);
            
            // Refresh UI
            const tables = DataManager.getAllTables();
            DOMHelper.createTabNav(tables);
            DOMHelper.createTabContent(tables);
            
            // Initialize filter if needed
            if (document.querySelectorAll('#filterConditions .filter-condition').length === 0) {
                SQLFilter.init();
            }
            
            DOMHelper.showNotification(`Successfully loaded ${result.rowCount} records from ${fileName}`, 'success');
            DOMHelper.closeModal('pasteModal');
            
            // Show the newly added tab
            DOMHelper.showTab(fileName);
        } else {
            DOMHelper.showNotification(`Error: ${result.error}`, 'error');
        }
    };
    
    window.showTableOptions = function(tableKey) {
        const modalContent = `
            <div class="space-y-4">
                <button onclick="uploadNewFile()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-upload mr-2"></i>Upload New File
                </button>
                <button onclick="downloadSampleFile('${tableKey}')" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-file-download mr-2"></i>Download Sample File
                </button>
                <button onclick="ExportModule.exportWithFormat('${tableKey}', 'json')" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-code mr-2"></i>Export as JSON
                </button>
                <button onclick="clearTableData('${tableKey}')" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    <i class="fas fa-trash mr-2"></i>Clear Table Data
                </button>
            </div>
        `;
        
        if (!document.getElementById('tableOptionsModal')) {
            DOMHelper.createModal('tableOptionsModal', 'Table Options', modalContent);
        } else {
            document.querySelector('#tableOptionsModal .modal-content').innerHTML = modalContent;
        }
        
        DOMHelper.showModal('tableOptionsModal');
    };
    
    window.uploadNewFile = function() {
        document.getElementById('hiddenFileInput').click();
        DOMHelper.closeModal('tableOptionsModal');
    };
    
    window.downloadSampleFile = function(tableKey) {
        const content = Parser.generateSampleFile(tableKey);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableKey}_sample.txt`;
        a.click();
        URL.revokeObjectURL(url);
        DOMHelper.closeModal('tableOptionsModal');
    };
    
    window.clearTableData = function(tableKey) {
        if (confirm(`Are you sure you want to clear all data from ${tableKey}?`)) {
            DataManager.setTableData(tableKey, []);
            DOMHelper.renderTable(tableKey, []);
            DOMHelper.showNotification('Table data cleared', 'success');
            DOMHelper.closeModal('tableOptionsModal');
        }
    };
    
    window.closeModal = function(modalId) {
        DOMHelper.closeModal(modalId);
    };
    
    // Make modules accessible globally
    window.DataManager = DataManager;
    window.DOMHelper = DOMHelper;
    window.ExportModule = ExportModule;
    window.SearchModule = SearchModule;
    window.SQLFilter = SQLFilter;
    window.Parser = Parser;
    
    return {
        init
    };
})();

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);