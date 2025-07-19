// sql.js - Complete SQL-like Filtering Engine
class SQLFilter {
    constructor() {
        this.operators = {
            '=': (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
            '!=': (a, b) => String(a).toLowerCase() !== String(b).toLowerCase(),
            '>': (a, b) => this.parseNumber(a) > this.parseNumber(b),
            '<': (a, b) => this.parseNumber(a) < this.parseNumber(b),
            '>=': (a, b) => this.parseNumber(a) >= this.parseNumber(b),
            '<=': (a, b) => this.parseNumber(a) <= this.parseNumber(b),
            'LIKE': (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
            'NOT LIKE': (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),
            'IN': (a, b) => {
                const values = b.split(',').map(v => v.trim().toLowerCase());
                return values.includes(String(a).toLowerCase());
            },
            'NOT IN': (a, b) => {
                const values = b.split(',').map(v => v.trim().toLowerCase());
                return !values.includes(String(a).toLowerCase());
            },
            'STARTS WITH': (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
            'ENDS WITH': (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
            'IS NULL': (a, b) => a === null || a === undefined || String(a).trim() === '',
            'IS NOT NULL': (a, b) => a !== null && a !== undefined && String(a).trim() !== ''
        };

        this.aggregationFunctions = {
            'COUNT': values => values.length,
            'SUM': values => values.reduce((a, b) => a + (isNaN(b) ? 0 : Number(b)), 0),
            'AVG': values => {
                const nums = values.map(v => isNaN(v) ? 0 : Number(v));
                return nums.reduce((a, b) => a + b, 0) / nums.length;
            },
            'MAX': values => Math.max(...values.map(v => isNaN(v) ? -Infinity : Number(v))),
            'MIN': values => Math.min(...values.map(v => isNaN(v) ? Infinity : Number(v))),
            'FIRST': values => values[0],
            'LAST': values => values[values.length - 1]
        };
    }

    parseNumber(value) {
        const cleanValue = String(value).replace(/[,$]/g, '');
        const num = parseFloat(cleanValue);
        return isNaN(num) ? 0 : num;
    }

    parseDate(value) {
        if (typeof value === 'string' && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = value.split('-');
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(value);
    }

    parseCondition(condition) {
        condition = condition.trim();
        const sortedOps = Object.keys(this.operators).sort((a, b) => b.length - a.length);
        
        for (const op of sortedOps) {
            const index = condition.toUpperCase().indexOf(op);
            if (index > 0) {
                const column = condition.substring(0, index).trim();
                const value = condition.substring(index + op.length).trim();
                const cleanValue = value.replace(/^['"]|['"]$/g, '');
                
                return {
                    column: column,
                    operator: op,
                    value: cleanValue,
                    evaluate: this.operators[op]
                };
            }
        }
        return null;
    }

    parseOrderByClause(clause) {
        const specs = [];
        const parts = clause.split(',');
        
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            const spaceIndex = trimmed.lastIndexOf(' ');
            let column, direction;
            
            if (spaceIndex > 0) {
                column = trimmed.substring(0, spaceIndex).trim();
                direction = trimmed.substring(spaceIndex + 1).trim().toUpperCase();
            } else {
                column = trimmed;
                direction = 'ASC';
            }
            
            if (direction !== 'ASC' && direction !== 'DESC') {
                direction = 'ASC';
            }
            
            specs.push({ column, direction });
        }
        return specs;
    }

    parseWhereClause(whereClause) {
        try {
            const conditions = this.parseComplexConditions(whereClause);
            return { parsed: conditions, error: null };
        } catch (error) {
            return { parsed: [], error: error.message };
        }
    }

    parseComplexConditions(clause) {
        const andParts = clause.split(/\s+AND\s+/i);
        const conditions = [];

        for (const part of andParts) {
            const orParts = part.split(/\s+OR\s+/i);
            if (orParts.length > 1) {
                const orConditions = orParts.map(orPart => this.parseCondition(orPart.trim()));
                conditions.push({ type: 'OR', conditions: orConditions });
            } else {
                const condition = this.parseCondition(part.trim());
                if (condition) {
                    conditions.push({ type: 'AND', condition: condition });
                }
            }
        }
        return conditions;
    }

    evaluateConditions(row, conditions) {
        for (const cond of conditions) {
            if (cond.type === 'AND') {
                if (!this.evaluateCondition(row, cond.condition)) {
                    return false;
                }
            } else if (cond.type === 'OR') {
                const orResult = cond.conditions.some(c => this.evaluateCondition(row, c));
                if (!orResult) {
                    return false;
                }
            }
        }
        return true;
    }

    evaluateCondition(row, condition) {
        if (!condition) return true;
        const columnValue = row[condition.column];
        if (columnValue === undefined) return false;
        return condition.evaluate(columnValue, condition.value);
    }

    applyGroupBy(data, groupByColumns, selectColumns) {
        const groups = new Map();
        const groupKeys = [];
        const aggregations = {};
        
        if (selectColumns) {
            selectColumns.forEach(col => {
                const aggMatch = col.match(/(COUNT|SUM|AVG|MAX|MIN|FIRST|LAST)\((.+?)\)/i);
                if (aggMatch) {
                    const func = aggMatch[1].toUpperCase();
                    const field = aggMatch[2].trim();
                    aggregations[col] = { func, field };
                }
            });
        }
        
        data.forEach(row => {
            const groupKey = groupByColumns.map(col => row[col]).join('|');
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
                groupKeys.push(groupKey);
            }
            groups.get(groupKey).push(row);
        });
        
        return groupKeys.map(key => {
            const groupRows = groups.get(key);
            const firstRow = groupRows[0];
            const resultRow = {};
            
            groupByColumns.forEach(col => {
                resultRow[col] = firstRow[col];
            });
            
            Object.entries(aggregations).forEach(([col, { func, field }]) => {
                const values = groupRows.map(row => row[field]);
                resultRow[col] = this.aggregationFunctions[func](values);
            });
            
            if (selectColumns) {
                selectColumns.forEach(col => {
                    if (!(col in resultRow) && !aggregations[col]) {
                        if (col in firstRow) {
                            resultRow[col] = firstRow[col];
                        } else {
                            const aliasMatch = col.match(/(.+)\s+AS\s+(.+)/i);
                            if (aliasMatch && aliasMatch[1].trim() in firstRow) {
                                resultRow[aliasMatch[2].trim()] = firstRow[aliasMatch[1].trim()];
                            }
                        }
                    }
                });
            }
            return resultRow;
        });
    }

    getColumnSuggestions(headers) {
        return headers.map(header => ({
            name: header,
            examples: [
                `SELECT ${header} FROM table`,
                `SELECT ${header}, COUNT(*) FROM table GROUP BY ${header}`,
                `SELECT AVG(${header}) FROM table WHERE ...`,
                `SELECT * FROM table ORDER BY ${header} DESC LIMIT 10`
            ]
        }));
    }

    getOperatorHelp() {
        return {
            'SQL Clauses': ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT'],
            'Aggregations': ['COUNT()', 'SUM()', 'AVG()', 'MAX()', 'MIN()', 'FIRST()', 'LAST()'],
            'Comparison': ['=', '!=', '>', '<', '>=', '<='],
            'Text': ['LIKE', 'NOT LIKE', 'STARTS WITH', 'ENDS WITH'],
            'List': ['IN', 'NOT IN'],
            'Null Check': ['IS NULL', 'IS NOT NULL'],
            'Logical': ['AND', 'OR'],
            'Sorting': ['ASC', 'DESC']
        };
    }

    filter(data, sqlQuery) {
        try {
            if (!sqlQuery || sqlQuery.trim() === '') return { data: data, error: null };

            // Parse SELECT
            const selectMatch = sqlQuery.match(/^SELECT\s+(.+?)(?:\s+FROM|\s+WHERE|\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/i);
            let selectedColumns = null;
            let hasAggregations = false;
            
            if (selectMatch) {
                const columnsPart = selectMatch[1].trim();
                if (columnsPart !== '*') {
                    selectedColumns = columnsPart.split(',').map(col => col.trim());
                    hasAggregations = selectedColumns.some(col => 
                        /(COUNT|SUM|AVG|MAX|MIN|FIRST|LAST)\(/i.test(col)
                    );
                }
            }

            // Parse WHERE
            const whereMatch = sqlQuery.match(/WHERE\s+(.+?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|$)/i);
            let filteredData = [...data];
            
            if (whereMatch) {
                const whereClause = whereMatch[1];
                const conditions = this.parseWhereClause(whereClause);
                if (conditions.error) return { data: [], error: conditions.error };
                filteredData = filteredData.filter(row => this.evaluateConditions(row, conditions.parsed));
            }

            // Parse GROUP BY
            const groupByMatch = sqlQuery.match(/GROUP BY\s+(.+?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
            let groupedData = filteredData;
            let groupByColumns = null;
            
            if (groupByMatch) {
                groupByColumns = groupByMatch[1].split(',').map(col => col.trim());
                groupedData = this.applyGroupBy(filteredData, groupByColumns, selectedColumns);
            }

            // Parse ORDER BY
            const orderByMatch = sqlQuery.match(/ORDER BY\s+(.+?)(?:\s+LIMIT|$)/i);
            if (orderByMatch && !hasAggregations) {
                const orderByClause = orderByMatch[1].trim();
                const sortSpecs = this.parseOrderByClause(orderByClause);
                
                if (sortSpecs.length > 0) {
                    groupedData.sort((a, b) => {
                        for (const spec of sortSpecs) {
                            const aValue = a[spec.column];
                            const bValue = b[spec.column];
                            let comparison = 0;
                            
                            if (typeof aValue === 'number' && typeof bValue === 'number') {
                                comparison = aValue - bValue;
                            } 
                            else if (spec.column.toLowerCase() === 'joindate') {
                                comparison = this.parseDate(aValue) - this.parseDate(bValue);
                            }
                            else {
                                comparison = String(aValue).localeCompare(String(bValue));
                            }
                            
                            if (comparison !== 0) {
                                return spec.direction === 'DESC' ? -comparison : comparison;
                            }
                        }
                        return 0;
                    });
                }
            }

            // Parse LIMIT
            const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)(?:\s*,\s*(\d+)|\s+OFFSET\s+(\d+))?/i);
            let limitedData = groupedData;
            
            if (limitMatch) {
                const limit = parseInt(limitMatch[1]);
                const offset = limitMatch[2] ? parseInt(limitMatch[2]) : 
                               limitMatch[3] ? parseInt(limitMatch[3]) : 0;
                limitedData = groupedData.slice(offset, offset + limit);
            }

            // Apply column selection
            if (selectedColumns && !hasAggregations) {
                limitedData = limitedData.map(row => {
                    const selectedRow = {};
                    selectedColumns.forEach(col => {
                        if (col in row) {
                            selectedRow[col] = row[col];
                        } else {
                            const aliasMatch = col.match(/(.+)\s+AS\s+(.+)/i);
                            if (aliasMatch && aliasMatch[1].trim() in row) {
                                selectedRow[aliasMatch[2].trim()] = row[aliasMatch[1].trim()];
                            }
                        }
                    });
                    return selectedRow;
                });
            }

            return { data: limitedData, error: null };
        } catch (error) {
            return { data: [], error: `SQL Error: ${error.message}` };
        }
    }
}

window.sqlFilter = new SQLFilter();