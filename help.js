// help.js - Help System
class HelpSystem {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.attachEvents();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal';
        modal.innerHTML = this.getHelpContent();
        document.body.appendChild(modal);
        this.modal = modal;
    }
// Function to generate the help content dynamically
    getHelpContent() {
        return `
        
        <div class="modal-content">
                <span class="close">&times;</span>
                <h2 style="color: #667eea; margin-bottom: 20px;">📚 Help & Documentation</h2>
                
                <div class="help-section">
                    <h3>🔄 Dataset Switching</h3>
                    <p>Use the dataset buttons to switch between different data sources. Each dataset is displayed as a separate table:</p>
                    <div class="help-example">⚖️ CBcaseRecord (data1) - Court case management data
                    🔗Links (data3) - Hyperlink management data
📊 Projects (data4) - Project management data  
👥 Employees (data5) - Employee management data</div>
                </div>

                <div class="help-section">
                    <h3>📋 Data Tables</h3>
                    <p>Each dataset is shown in its own dedicated table section with:</p>
                    <div class="help-example">• Complete data mirrored from the original files
• Individual statistics for each dataset
• Separate filtering and search capabilities
• Responsive design for all screen sizes</div>
                </div>

                <div class="help-section">
                    <h3>🔍 Global Search with Navigation</h3>
                    <p>Search across all columns with advanced navigation features:</p>
                    <div class="help-example">• Type in search box to find matches across all data
• Use ⬆️ Prev / ⬇️ Next buttons to navigate between matches
• Current match position is highlighted in red
• Use Ctrl+↑/↓ arrow keys for keyboard navigation
• Search position indicator shows current/total matches</div>
                </div>

                <div class="help-section">
                    <h3>📊 Dataset View Modes</h3>
                    <p>Choose between single or multiple dataset display:</p>
                    <div class="help-example">• Single View: Shows only the selected dataset table
• Multiple View: Shows all dataset tables simultaneously
• SQL filtering applies to current dataset in single view
• SQL filtering applies to all datasets in multiple view
• Export options adapt based on current view mode</div>
                </div>

                <div class="help-section">
                    <h3>📥 CSV Export Functionality</h3>
                    <p>Export your filtered data as CSV files:</p>
                    <div class="help-example">• Single View: Export current filtered table
• Multiple View: Export each dataset separately
• Exported files include current filters and search results
• Automatic filename with dataset name and date
• Properly formatted CSV with escaped special characters</div>
                </div>

                <div class="help-section">
                    <h3>🎯 Simple Filter Builder</h3>
                    <p>User-friendly filtering without SQL knowledge:</p>
                    <div class="help-example">• Click "Advanced Filtering" to expand filter options
• Choose "Simple Filter" tab for easy point-and-click filtering
• Select column from dropdown
• Choose logic operator (equals, contains, greater than, etc.)
• Enter the value to filter by
• Click "Add Condition" to add multiple filters
• Use AND/OR logic between conditions
• Preview shows the generated SQL automatically</div>
                </div>

                <div class="help-section">
                    <h3>🛠️ SQL-like Filtering (Expert Mode)</h3>
                    <p>Advanced SQL filtering with complete WHERE clause syntax support:</p>
                    
                    <h4>Supported Operators:</h4>
                    <div class="help-example">= (equals) - exact match
!= (not equals) - exclude matches
> < >= <= (comparisons) - numeric/date comparisons
LIKE (contains text) - partial text match
NOT LIKE (doesn't contain) - exclude partial matches
IN (value in list) - match any value in comma-separated list
NOT IN (value not in list) - exclude values in list
STARTS WITH - text starts with value
ENDS WITH - text ends with value
IS NULL / IS NOT NULL - check for empty values</div>

                    <h4>Examples for CBcaseRecord Dataset:</h4>
                    <div class="help-example">WHERE Bench = 'Bench-1'
WHERE Vol > 3
WHERE Party1 LIKE 'Smith'
WHERE Bench IN 'Bench-1,Bench-2'
WHERE Date >= '16-01-2025' AND Vol = 3
WHERE CaseNo IS NOT NULL</div>

<h4>Examples for Link Dataset:</h4>
<div class="help-example">WHERE Name = 'Elephant Killing'
WHERE Remark > 'Ecosystem Balancing'
WHERE Name LIKE 'Link'</div>


                    <h4>Examples for Employees Dataset:</h4>
                    <div class="help-example">WHERE Department = 'Engineering'
WHERE Salary > 70000
WHERE Name LIKE 'John'
WHERE Location IN 'New York,Chicago'
WHERE JoinDate >= '01-01-2022'
WHERE Manager IS NOT NULL</div>
                </div>

                <div class="help-section">
                    <h3>📋 Column Quick Insert</h3>
                    <p>Click column buttons to quickly insert column names into your SQL filter. This helps avoid typos and speeds up query building.</p>
                    <div class="help-example">• Click a column button to insert its name at cursor position
• Column names are inserted exactly as they appear in the data
• Use Tab key to navigate between form fields</div>
                </div>

                <div class="help-section">
                    <h3>📱 Responsive Design</h3>
                    <p>The interface adapts to different screen sizes:</p>
                    <div class="help-example">• Desktop: Full-width tables with side-by-side controls
• Tablet: Stacked controls with scrollable tables
• Mobile: Compact layout with touch-friendly buttons</div>
                </div>

                <div class="help-section">
                    <h3>✨ Advanced Features</h3>
                    <p>• <strong>Sticky Search:</strong> Search bar stays visible while scrolling<br>
                    • <strong>Real-time Stats:</strong> See total and filtered record counts for each dataset<br>
                    • <strong>Error Handling:</strong> Clear error messages for invalid SQL syntax<br>
                    • <strong>Multi-dataset Support:</strong> Work with multiple data sources simultaneously<br>
                    • <strong>Search Highlighting:</strong> Visual highlighting of search matches<br>
                    • <strong>Keyboard Shortcuts:</strong> Ctrl+Enter to execute SQL, Escape to close help</p>
                </div>

                <div class="help-section">
                    <h3>🎯 Tips & Best Practices</h3>
                    <p>• <strong>Text Values:</strong> Use quotes around text: <code>Name = 'John Smith'</code><br>
                    • <strong>Numeric Values:</strong> No quotes needed: <code>Amount > 50000</code><br>
                    • <strong>Date Values:</strong> Use quotes: <code>Date >= '01-01-2025'</code><br>
                    • <strong>Multiple Conditions:</strong> Use AND/OR: <code>Status = 'Active' AND Amount > 50000</code><br>
                    • <strong>Partial Matches:</strong> Use LIKE: <code>Name LIKE 'Project'</code><br>
                    • <strong>List Matching:</strong> Use IN: <code>Status IN 'Active,Pending,Completed'</code><br>
                    • <strong>Clear Filters:</strong> Click Clear button or remove WHERE clause completely</p>
                </div>

                <div class="help-section">
                    <h3>🔧 Troubleshooting</h3>
                    <p>• <strong>No Results:</strong> Check column names and spelling<br>
                    • <strong>SQL Errors:</strong> Verify WHERE clause syntax<br>
                    • <strong>Case Sensitivity:</strong> Column names must match exactly<br>
                    • <strong>Quote Usage:</strong> Text values need quotes, numbers don't<br>
                    • <strong>Performance:</strong> Large datasets may take longer to filter</p>
                </div>

                <div class="help-section">
                    <h3>⌨️ Keyboard Shortcuts</h3>
                    <div class="help-example">Ctrl + Enter - Execute SQL query
Ctrl + K - Focus search input
Ctrl + ↑/↓ - Navigate search matches
Ctrl + Shift + C - Clear all filters
Ctrl + 1-3 - Switch between datasets
Escape - Clear search/close help dialog
F1 - Open this help dialog</div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        // Close modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.id === 'helpModal') {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // F1 key to open help
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showModal();
            }
        });
    }

    showModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const closeButton = this.modal.querySelector('.close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showQuickHelp(section) {
        // Show contextual help for specific sections
        this.showModal();
        
        // Scroll to specific section if provided
        if (section) {
            setTimeout(() => {
                const targetSection = this.modal.querySelector(`h3:contains('${section}')`);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }

    getDatasetHelp(datasetName) {
        const helpContent = {
            'data1': {
                name: 'CBcaseRecord',
                columns: ['ID', 'Name', 'Amount', 'Status', 'Notes'],
                examples: [
                    "WHERE Status = 'Active'",
                    "WHERE Amount > 50000",
                    "WHERE Name LIKE 'Project'"
                ],
            
            'data2': {
                name: 'Projects',
                columns: ['CaseNo', 'DNo', 'NKP', 'Vol', 'Date', 'Case Name', 'Party1', 'Party 2', 'Bench', 'Remark1-5'],
                examples: [
                    "WHERE Bench = 'Bench-1'",
                    "WHERE Vol > 3",
                    "WHERE Party1 LIKE 'Smith'"
                ]
            },
                       'data3': {
                name: 'Link',
                columns: ['ID', 'Name', 'Remark', 'Link'],
                examples: [
                    "WHERE Name = 'Elephant Killing'",
                    "WHERE Remark > Ecosystem Balancing'",
                    "WHERE Name LIKE 'Link'"
                ]
            },
            
            },
            'data5': {
                name: 'Employees',
                columns: ['EmpID', 'Name', 'Department', 'Position', 'Salary', 'JoinDate', 'Manager', 'Email', 'Phone', 'Location'],
                examples: [
                    "WHERE Department = 'Engineering'",
                    "WHERE Salary > 70000",
                    "WHERE Location = 'New York'"
                ]
            }
        };

        return helpContent[datasetName] || null;
    }
}

// Initialize Help System
window.helpSystem = new HelpSystem();
