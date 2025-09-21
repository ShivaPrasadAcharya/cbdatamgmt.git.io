// password.js - Password protection for tables with datasetInfo.password

(function() {
    // Store entered passwords in-memory for the session
    const enteredPasswords = {};

    // Utility to get dataset key from a DOM element (data-section)
    function getDatasetKeyFromSection(section) {
        const title = section.querySelector('.data-section-title');
        if (!title) return null;
        const match = title.textContent.match(/([^\s]+)\s+(.+?)\s+Dataset/);
        if (!match) return null;
        const name = match[2].trim();
        for (const [key, info] of Object.entries(window.dataApp?.datasetInfo || {})) {
            if (info.name === name) return key;
        }
        return null;
    }

    function applyPasswordProtection() {
        document.querySelectorAll('.data-section').forEach(section => {
            const datasetKey = getDatasetKeyFromSection(section);
            if (!datasetKey) return;
            const info = window.dataApp?.datasetInfo?.[datasetKey];
            if (!info) return;
            const password = (info.password !== undefined) ? String(info.password) : null;
            // If no password or password is 'null' or empty, show table as normal
            if (!password || password === 'null' || password === '') {
                // Unhide table, remove password UI/message
                const table = section.querySelector('.data-table, .image-card-grid');
                if (table) table.style.display = '';
                const pwMsg = section.querySelector('.password-protect-msg');
                if (pwMsg) pwMsg.remove();
                return;
            }
            // If password already entered and correct, show table
            if (enteredPasswords[datasetKey] === password) {
                const table = section.querySelector('.data-table, .image-card-grid');
                if (table) table.style.display = '';
                const pwMsg = section.querySelector('.password-protect-msg');
                if (pwMsg) pwMsg.remove();
                return;
            }
            // Hide table, show password entry UI
            const table = section.querySelector('.data-table, .image-card-grid');
            if (table) table.style.display = 'none';
            let pwMsg = section.querySelector('.password-protect-msg');
            if (!pwMsg) {
                pwMsg = document.createElement('div');
                pwMsg.className = 'password-protect-msg';
                pwMsg.style.cssText = 'color:#333;background:#fffbe7;padding:32px 0;text-align:center;font-size:1.1em;font-weight:bold;border-radius:10px;margin:20px 0;';
                pwMsg.innerHTML = `
                    <div style="margin-bottom:12px;">🔒 This table is password protected.</div>
                    <input type="password" placeholder="Enter password" style="padding:8px 16px;border-radius:6px;border:1px solid #bbb;font-size:1em;" />
                    <button style="padding:8px 18px;margin-left:8px;border-radius:6px;background:#4e9af1;color:#fff;border:none;font-weight:600;cursor:pointer;">Unlock</button>
                    <div class="pw-error" style="color:#b71c1c;margin-top:10px;font-size:0.98em;display:none;"></div>
                `;
                section.appendChild(pwMsg);
            }
            // Attach event handler for unlock button
            const input = pwMsg.querySelector('input[type="password"]');
            const btn = pwMsg.querySelector('button');
            const errorDiv = pwMsg.querySelector('.pw-error');
            btn.onclick = function() {
                if (input.value === password) {
                    enteredPasswords[datasetKey] = password;
                    if (errorDiv) errorDiv.style.display = 'none';
                    if (table) table.style.display = '';
                    pwMsg.remove();
                } else {
                    if (errorDiv) {
                        errorDiv.textContent = 'Password do not match. Try again.';
                        errorDiv.style.display = 'block';
                    }
                    input.value = '';
                    input.focus();
                }
            };
            input.onkeydown = function(e) {
                if (e.key === 'Enter') btn.click();
            };
        });
    }

    // Patch DataApp render to apply password protection after rendering
    function patchDataAppRender() {
        if (!window.dataApp || window.dataApp.__password_patched) return;
        const origRender = window.dataApp.render.bind(window.dataApp);
        window.dataApp.render = function() {
            origRender();
            setTimeout(applyPasswordProtection, 0);
        };
        window.dataApp.__password_patched = true;
    }

    // Wait for DataApp to be ready
    function init() {
        if (window.dataApp && typeof window.dataApp.render === "function") {
            patchDataAppRender();
            setTimeout(applyPasswordProtection, 100);
        } else {
            setTimeout(init, 100);
        }
    }
    init();
})();
