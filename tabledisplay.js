// tabledisplay.js - Hide/unhide tables based on datasetInfo.display

(function() {
    // Utility to get dataset key from a DOM element (data-section)
    function getDatasetKeyFromSection(section) {
        // Try to find the dataset key from a data attribute or fallback to header text
        const title = section.querySelector('.data-section-title');
        if (!title) return null;
        // Extract dataset name from header text (e.g., "🖼️ Images Dataset")
        const match = title.textContent.match(/([^\s]+)\s+(.+?)\s+Dataset/);
        if (!match) return null;
        // Try to match by name in datasetInfo
        const name = match[2].trim();
        for (const [key, info] of Object.entries(window.dataApp?.datasetInfo || {})) {
            if (info.name === name) return key;
        }
        return null;
    }

    function applyTableDisplayRules() {
        // For each .data-section, check if its dataset is hidden
        document.querySelectorAll('.data-section').forEach(section => {
            const datasetKey = getDatasetKeyFromSection(section);
            if (!datasetKey) return;
            const info = window.dataApp?.datasetInfo?.[datasetKey];
            if (!info) return;
            if (info.display && info.display.toLowerCase() === "hide") {
                // Hide table, show message
                const table = section.querySelector('.data-table, .image-card-grid');
                if (table) table.style.display = 'none';
                // Remove any previous message
                let msg = section.querySelector('.admin-denied-msg');
                if (!msg) {
                    msg = document.createElement('div');
                    msg.className = 'admin-denied-msg';
                    msg.style.cssText = 'color:#b71c1c;background:#fff3f3;padding:32px 0;text-align:center;font-size:1.2em;font-weight:bold;border-radius:10px;margin:20px 0;';
                    msg.textContent = 'Admin has denied access to this table in the webpage.';
                    section.appendChild(msg);
                }
            } else {
                // Unhide table, remove message
                const table = section.querySelector('.data-table, .image-card-grid');
                if (table) table.style.display = '';
                const msg = section.querySelector('.admin-denied-msg');
                if (msg) msg.remove();
            }
        });
    }

    // Hook into DataApp rendering
    function patchDataAppRender() {
        if (!window.dataApp || window.dataApp.__tabledisplay_patched) return;
        const origRender = window.dataApp.render.bind(window.dataApp);
        window.dataApp.render = function() {
            origRender();
            setTimeout(applyTableDisplayRules, 0);
        };
        window.dataApp.__tabledisplay_patched = true;
    }

    // Wait for DataApp to be ready
    function init() {
        if (window.dataApp && typeof window.dataApp.render === "function") {
            patchDataAppRender();
            // Also run once on load
            setTimeout(applyTableDisplayRules, 100);
        } else {
            setTimeout(init, 100);
        }
    }
    init();
})();
