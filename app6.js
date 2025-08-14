// Password-protected image expansion and copy/download prevention for data6IMAGESS

document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        const img = e.target.closest('.expandable-img[data-dataset="data6IMAGESS"]');
        if (!img) return;

        const password = img.getAttribute('data-password');
        const src = img.getAttribute('src');
        const title = img.getAttribute('alt') || '';
        const desc = img.getAttribute('data-desc') || '';

        // If password is null, allow expand/copy/download
        if (!password || password === 'null') {
            showImageModal(src, title, desc, false, false);
            return;
        }

        // If blurred, ask for password
        if (img.classList.contains('blurred')) {
            const userPassword = prompt('Enter password to view this image:');
            if (userPassword === null || userPassword !== password) {
                // Cancelled or incorrect: show blank page with back arrow
                showBlankWithBackArrow();
                if (userPassword !== null && userPassword !== password) {
                    alert('Incorrect password!');
                }
                return;
            }
            // Correct password: remove blur, show modal without blur
            img.classList.remove('blurred');
            showImageModal(src, title, desc, true, false);
        } else {
            // Already unblurred, allow expand
            showImageModal(src, title, desc, true, false);
        }
    });

    // Prevent right-click, drag, and copy for protected images
    document.body.addEventListener('contextmenu', function(e) {
        const img = e.target.closest('.expandable-img[data-dataset="data6IMAGESS"]');
        if (img && img.getAttribute('data-password') && img.getAttribute('data-password') !== 'null') {
            e.preventDefault();
        }
    });
    document.body.addEventListener('dragstart', function(e) {
        const img = e.target.closest('.expandable-img[data-dataset="data6IMAGESS"]');
        if (img && img.getAttribute('data-password') && img.getAttribute('data-password') !== 'null') {
            e.preventDefault();
        }
    });
    document.body.addEventListener('copy', function(e) {
        const img = e.target.closest('.expandable-img[data-dataset="data6IMAGESS"]');
        if (img && img.getAttribute('data-password') && img.getAttribute('data-password') !== 'null') {
            e.preventDefault();
        }
    });

    // Modal close logic
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('image-modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            const modalImg = document.getElementById('image-modal-img');
            if (modalImg) {
                modalImg.removeAttribute('oncontextmenu');
                modalImg.removeAttribute('ondragstart');
                modalImg.removeAttribute('oncopy');
                modalImg.classList.remove('blurred');
            }
        };
    }
});

// Show image modal, optionally protect copy/download, optionally keep blur
function showImageModal(src, title, desc, protect, keepBlur) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const caption = document.getElementById('image-modal-caption');
    if (!modal || !modalImg) return;

    modal.style.display = 'flex';
    modalImg.src = src;
    modalImg.alt = title;
    caption.textContent = title + (desc ? ' - ' + desc : '');

    if (protect) {
        modalImg.oncontextmenu = function(e) { e.preventDefault(); };
        modalImg.ondragstart = function(e) { e.preventDefault(); };
        modalImg.oncopy = function(e) { e.preventDefault(); };
        modalImg.removeAttribute('download');
    } else {
        modalImg.oncontextmenu = null;
        modalImg.ondragstart = null;
        modalImg.oncopy = null;
    }

    if (keepBlur) {
        modalImg.classList.add('blurred');
    } else {
        modalImg.classList.remove('blurred');
    }
}

// Show blank page with back arrow, restore previous state on click
function showBlankWithBackArrow() {
    // Save current body HTML
    const prevHtml = document.body.innerHTML;
    document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;">
            <button id="back-arrow-btn" style="font-size:2em;padding:16px 32px;border:none;background:none;cursor:pointer;">
                &#8592; Back
            </button>
        </div>
    `;
    document.body.style.background = "#fff";
    document.getElementById('back-arrow-btn').onclick = function() {
        document.body.innerHTML = prevHtml;
        document.body.style.background = "";
        // Re-run scripts that attach events (minimal: reload root)
        if (window.dataApp && typeof window.dataApp.render === "function") {
            window.dataApp.render();
        }
    };
}
