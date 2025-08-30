// roowcoloor.js - Generalized row coloring utility
// Usage: Call applyRowColorsToTables(info) after rendering tables

function applyRowColorsToTables(info) {
    var primaryKey = (info.primaryKey || '').toLowerCase();
    var rowColors = info.rowColors || {};
    var customColorFn = typeof info.getRowColor === 'function' ? info.getRowColor : null;
    if (!primaryKey || !rowColors) return;

    // Find all tables with STATUS info (by caption or aria-label)
    var tables = Array.from(document.querySelectorAll('table'));
    tables.forEach(function (table) {
        var isStatusTable = false;
        // Check caption or aria-label for STATUS
        var caption = table.querySelector('caption');
        if (caption && /status/i.test(caption.textContent)) isStatusTable = true;
        if (table.getAttribute('aria-label') && /status/i.test(table.getAttribute('aria-label'))) isStatusTable = true;
        // Heuristic: check headers for the primaryKey
        var ths = Array.from(table.querySelectorAll('th'));
        if (ths.some(th => th.textContent.trim().toLowerCase() === primaryKey)) isStatusTable = true;
        if (!isStatusTable) return;

        // Find the index of the primaryKey column
        var headerCells = Array.from(table.querySelectorAll('thead th'));
        var keyIdx = headerCells.findIndex(th => th.textContent.trim().toLowerCase() === primaryKey);
        if (keyIdx === -1) return;

        // Color each row based on the primaryKey value only
        Array.from(table.querySelectorAll('tbody tr')).forEach(function (row) {
            var cells = row.children;
            if (cells.length <= keyIdx) return;
            var cellValueRaw = cells[keyIdx].textContent.trim();
            var cellValueLower = cellValueRaw.toLowerCase();
            var color = '';
            if (customColorFn) {
                color = customColorFn(cellValueRaw, row, table);
            } else {
                color = rowColors[cellValueRaw] || rowColors[cellValueLower] || '';
            }
            // Named colors
            if (color === 'red') row.style.backgroundColor = '#ffd6d6';
            else if (color === 'blue') row.style.backgroundColor = '#d6e6ff';
            else if (color === 'green') row.style.backgroundColor = '#d6ffd6';
            // Allow any valid CSS color
            else if (color && color !== 'default') row.style.backgroundColor = color;
            else row.style.backgroundColor = '';
        });
    });
}

// Optionally, auto-apply on DOMContentLoaded if window.data4StatusInfo exists
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        if (window.data4StatusInfo) {
            applyRowColorsToTables(window.data4StatusInfo);
        }
    });
}
