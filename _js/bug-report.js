// Bug Report Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const bugReportBtn = document.getElementById('bug-report-btn');
    const bugModal = document.getElementById('bug-report-modal');
    const bugModalClose = document.getElementById('bug-modal-close');

    // Open modal
    bugReportBtn.addEventListener('click', function() {
        bugModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal function
    function closeModal() {
        bugModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable background scrolling
    }

    // Close modal events
    bugModalClose.addEventListener('click', closeModal);

    // Close modal when clicking outside
    bugModal.addEventListener('click', function(e) {
        if (e.target === bugModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bugModal.style.display === 'block') {
            closeModal();
        }
    });
});