// utils/parser.js - File Parser Module

const Parser = (function() {
    'use strict';

    // Expected column headers - with variations
    const expectedHeaders = [
        'caseno', 'dno', 'nkp', 'vol', 'date', 
        'cassename', 'party1', 'party2', 'bench',
        'remark1', 'remark2', 'remark3', 'remark4', 'remark5'
    ];
    
    // Header mappings to handle variations
    const headerMappings = {
        'case no': 'caseno',
        'caseno': 'caseno',
        'case_no': 'caseno',
        'd.no': 'dno',
        'dno': 'dno',
        'd_no': 'dno',
        'nkp': 'nkp',
        'vol': 'vol',
        'volume': 'vol',
        'date': 'date',
        'case name': 'cassename',
        'cassename': 'cassename',
        'case_name': 'cassename',
        'party 1': 'party1',
        'party1': 'party1',
        'party_1': 'party1',
        'party 2': 'party2',
        'party2': 'party2',
        'party_2': 'party2',
        'bench': 'bench',
        'remark 1': 'remark1',
        'remark1': 'remark1',
        'remark_1': 'remark1',
        'remark 2': 'remark2',
        'remark2': 'remark2',
        'remark_2': 'remark2',
        'remark 3': 'remark3',
        'remark3': 'remark3',
        'remark_3': 'remark3',
        'remark 4': 'remark4',
        'remark4': 'remark4',
        'remark_4': 'remark4',
        'remark 5': 'remark5',
        'remark5': 'remark5',
        'remark_5': 'remark5'
    };

    // Parse CSV/TXT file content
    function parseCSV(content, filename = 'data') {
        try {
            const lines = content.trim().split(/\r?\n/);
            if (lines.length < 2) {
                throw new Error('File must contain at least header and one data row');
            }

            // Parse headers and normalize them
            const rawHeaders = parseCSVLine(lines[0]);
            const headers = normalizeHeaders(rawHeaders);
            
            // Validate headers
            const validation = validateHeaders(headers);
            if (!validation.valid) {
                throw new Error(`Invalid headers: ${validation.errors.join(', ')}`);
            }

            // Parse data rows
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = parseCSVLine(line);
                    const row = createRowObject(headers, values);
                    
                    // Convert date format if needed (DD-MM-YYYY to YYYY-MM-DD)
                    if (row.date && row.date.includes('-')) {
                        row.date = convertDateFormat(row.date);
                    }
                    
                    data.push(row);
                }
            }

            return {
                success: true,
                data: data,
                filename: filename,
                rowCount: data.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                filename: filename
            };
        }
    }
    
    // Normalize headers to match expected format
    function normalizeHeaders(rawHeaders) {
        return rawHeaders.map(header => {
            const normalized = header.trim().toLowerCase();
            return headerMappings[normalized] || normalized;
        });
    }
    
    // Convert date format from DD-MM-YYYY to YYYY-MM-DD
    function convertDateFormat(dateStr) {
        // Check if already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        
        // Convert DD-MM-YYYY to YYYY-MM-DD
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0].length <= 2) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        
        return dateStr;
    }

    // Parse a single CSV line handling quotes and commas
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add last field
        result.push(current.trim());
        return result;
    }

    // Create row object from headers and values
    function createRowObject(headers, values) {
        const row = {};
        
        expectedHeaders.forEach((header, index) => {
            const headerIndex = headers.indexOf(header);
            if (headerIndex !== -1 && values[headerIndex] !== undefined) {
                row[header] = values[headerIndex];
            } else {
                row[header] = ''; // Default empty value
            }
        });

        return row;
    }

    // Validate headers
    function validateHeaders(headers) {
        const errors = [];
        const missingHeaders = [];
        
        expectedHeaders.forEach(expected => {
            if (!headers.includes(expected)) {
                missingHeaders.push(expected);
            }
        });

        if (missingHeaders.length > 0) {
            errors.push(`Missing headers: ${missingHeaders.join(', ')}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Parse multiple files
    async function parseMultipleFiles(files) {
        const results = {};
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const content = await readFileContent(file);
                const parsed = parseCSV(content, file.name.replace('.txt', ''));
                
                if (parsed.success) {
                    const key = file.name.replace('.txt', '');
                    results[key] = parsed.data;
                } else {
                    errors.push(`${file.name}: ${parsed.error}`);
                }
            } catch (error) {
                errors.push(`${file.name}: ${error.message}`);
            }
        }

        return {
            results: results,
            errors: errors
        };
    }

    // Read file content
    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            
            reader.onerror = function(e) {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    // Generate sample data file content
    function generateSampleFile(filename = 'data1') {
        const headers = expectedHeaders.join(',');
        const sampleRows = [
            '001,101,45,3,2025-01-15,Smith vs Jones,John Smith,Mary Jones,Bench-1,Initial hearing,Documents pending,N/A,N/A,N/A',
            '002,102,46,3,2025-01-16,State vs Brown,State,Robert Brown,Bench-2,Criminal case,Bail granted,Next hearing 2025-02-01,N/A,N/A',
            '003,103,47,4,2025-01-17,Johnson Estate,Estate of Johnson,City Council,Bench-1,Property dispute,Survey required,Expert witness needed,N/A,N/A'
        ];
        
        return headers + '\n' + sampleRows.join('\n');
    }

    // Validate data row
    function validateDataRow(row, rowIndex) {
        const errors = [];
        
        // Check required fields
        if (!row.caseno) errors.push(`Row ${rowIndex}: Case number is required`);
        if (!row.dno) errors.push(`Row ${rowIndex}: Document number is required`);
        
        // Validate date format
        if (row.date && !isValidDate(row.date)) {
            errors.push(`Row ${rowIndex}: Invalid date format (use YYYY-MM-DD)`);
        }
        
        // Validate volume is numeric
        if (row.vol && isNaN(parseInt(row.vol))) {
            errors.push(`Row ${rowIndex}: Volume must be numeric`);
        }
        
        return errors;
    }

    // Check if date is valid
    function isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Convert data to CSV format
    function dataToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = expectedHeaders;
        const csv = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape values containing commas or quotes
                if (value.includes(',') || value.includes('"')) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv.push(values.join(','));
        });
        
        return csv.join('\n');
    }

    // Public API
    return {
        parseCSV,
        parseMultipleFiles,
        generateSampleFile,
        validateDataRow,
        dataToCSV,
        expectedHeaders
    };
})();
