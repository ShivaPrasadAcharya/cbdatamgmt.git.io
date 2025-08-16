var data5Url = `sno,subject,description,shorturl,longurl
01a,Contact List,BPSG 7th sem-2082,contact list,contactlist.docx
01a,Contact List,BPSG 7th sem-2082,contact list,contactlist.htm
003a,CBJMS,git-links,CBDATA,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data1Trainees.js
003b,CBJMS,git-links,Images,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data2Images.js
003c,CBJMS,git-links,Links,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data3Links.js
003d,CBJMS,git-links,Najir,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data4Status.js
003e,CBJMS,git-links,Trainees,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data5Url.js
003f,CBJMS,git-links,पालो,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/data6IMAGEESS.js
003g,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app1.js
003h,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app2.js
003i,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app3.js
003j,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app4.js
003k,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app5.js
003l,CBJMS,git-links,otherfiles-app,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/app6.js
003m,CBJMS,git-links,otherfiles-css,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/styles.css
003n,CBJMS,git-links,otherfiles-html,https://github.com/ShivaPrasadAcharya/cbdatamgmt.git.io/edit/main/index.html
`;

// Dataset metadata
var data5UrlInfo = {
    name: "Not4U",
    description: "Sample URL mapping table with short and long URLs.",
    emoji: "🔗",
    columns: 5,
    primaryKey: "subject",
    rowColors: {
        // Example: highlight a specific shorturl
        "subject": "blue"
    }
};

// Script to make shorturl a clickable redirect to longurl (web or local file), and longurl cell truncated with ellipsis
function makeShortUrlLinks() {
    var info = window.data5UrlInfo || {};
    var tables = Array.from(document.querySelectorAll('table'));
    
    tables.forEach(function (table) {
        // Skip if already processed
        if (table.dataset.urlLinksProcessed === 'true') return;
        
        // Heuristic: check headers for 'shorturl' and 'longurl'
        var ths = Array.from(table.querySelectorAll('th'));
        var hasShort = ths.some(th => th.textContent.trim().toLowerCase() === 'shorturl');
        var hasLong = ths.some(th => th.textContent.trim().toLowerCase() === 'longurl');
        if (!(hasShort && hasLong)) return;
        
        // Find column indices
        var headerCells = Array.from(table.querySelectorAll('thead th'));
        var shortIdx = headerCells.findIndex(th => th.textContent.trim().toLowerCase() === 'shorturl');
        var longIdx = headerCells.findIndex(th => th.textContent.trim().toLowerCase() === 'longurl');
        if (shortIdx === -1 || longIdx === -1) return;
        
        // Enhance each row
        Array.from(table.querySelectorAll('tbody tr')).forEach(function (row) {
            var cells = row.children;
            if (cells.length <= Math.max(shortIdx, longIdx)) return;
            
            var shortCell = cells[shortIdx];
            var longCell = cells[longIdx];
            var shortUrl = shortCell.textContent.trim();
            var longUrl = longCell.textContent.trim();
            
            // If already a link, skip
            if (!shortCell.querySelector('a')) {
                var href = (/^https?:\/\//i.test(longUrl)) ? longUrl : encodeURI(longUrl);
                shortCell.innerHTML = `<a href="${href}" target="_blank" title="${longUrl}">${shortUrl}</a>`;
            }
            
            // Truncate longurl for display, but keep full in tooltip and link
            if (!longCell.querySelector('a')) {
                var displayUrl = longUrl.length > 18 ? longUrl.slice(0, 15) + '...' : longUrl;
                var href = (/^https?:\/\//i.test(longUrl)) ? longUrl : encodeURI(longUrl);
                longCell.innerHTML = `<a href="${href}" target="_blank" title="${longUrl}">${displayUrl}</a>`;
                longCell.style.maxWidth = '120px';
                longCell.style.overflow = 'hidden';
                longCell.style.textOverflow = 'ellipsis';
                longCell.style.whiteSpace = 'nowrap';
            }
        });
        
        // Mark as processed to prevent re-processing
        table.dataset.urlLinksProcessed = 'true';
    });
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', makeShortUrlLinks);

// Use a more selective observer that only watches for new table additions
var observer = new MutationObserver(function(mutations) {
    var shouldProcess = false;
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && (node.tagName === 'TABLE' || node.querySelector('table'))) {
                    shouldProcess = true;
                }
            });
        }
    });
    
    if (shouldProcess) {
        // Add a small delay to avoid rapid repeated calls
        setTimeout(makeShortUrlLinks, 100);
    }
});

observer.observe(document.body, { 
    childList: true, 
    subtree: true 

});


