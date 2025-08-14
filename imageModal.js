// imageModal.js - Handles global image modal overlay for .expandable-img
function setupImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    const caption = document.getElementById('image-modal-caption');
    const closeBtn = document.getElementById('image-modal-close');

    // Delegate click event for all future .expandable-img
    document.body.addEventListener('click', function(e) {
        const img = e.target.closest('.expandable-img');
        if (img) {
            modal.style.display = 'flex';
            modalImg.src = img.getAttribute('data-fullsrc') || img.src;
            caption.textContent = img.alt || '';
        }
    });
    // Close modal on close button
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        modalImg.src = '';
        caption.textContent = '';
    };
    // Close modal when clicking outside the image
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImg.src = '';
            caption.textContent = '';
        }
    };
    // ESC key closes modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            modalImg.src = '';
            caption.textContent = '';
        }
    });
}
window.addEventListener('DOMContentLoaded', setupImageModal);
