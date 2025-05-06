/**
 * Wolf63x Sniper Bot - Sidebar Functionality
 * Handles the sidebar toggle and responsive behavior
 */

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const menuButton = document.querySelector('.menu-button');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Function to toggle sidebar expanded state
    function toggleSidebar() {
        sidebar.classList.toggle('expanded');
        mainContent.classList.toggle('sidebar-expanded');
        
        // Handle mobile overlay
        if (window.innerWidth <= 768 && overlay) {
            if (sidebar.classList.contains('expanded')) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
        
        // Save state to localStorage for persistence
        localStorage.setItem('sidebarExpanded', sidebar.classList.contains('expanded'));
    }
    
    // Initialize from saved state
    function initSidebar() {
        const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
        
        if (sidebarExpanded) {
            sidebar.classList.add('expanded');
            mainContent.classList.add('sidebar-expanded');
        }
        
        // Set correct toggle icon orientation
        if (sidebarToggle) {
            const toggleIcon = sidebarToggle.querySelector('i');
            if (toggleIcon && sidebar.classList.contains('expanded')) {
                toggleIcon.style.transform = 'rotate(180deg)';
            }
        }
    }
    
    // Event listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (menuButton) {
        menuButton.addEventListener('click', toggleSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar.classList.contains('expanded')) {
                toggleSidebar();
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (overlay) overlay.classList.remove('active');
        } else {
            if (sidebar.classList.contains('expanded') && overlay) {
                overlay.classList.add('active');
            }
        }
    });
    
    // Initialize on page load
    initSidebar();
}); 