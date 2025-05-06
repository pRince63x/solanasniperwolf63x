/**
 * Fix for Solana logo display issues
 * Replaces all Solana logo images with FontAwesome icons
 */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Replace direct img elements with classes sol-logo and sol-icon
    const solLogos = document.querySelectorAll('.sol-logo, .sol-icon');
    
    solLogos.forEach(function(logo) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-coins';
        icon.style.color = '#14F195';
        icon.style.fontSize = '16px';
        icon.style.verticalAlign = 'middle';
        icon.style.marginRight = '5px';
        
        // Replace the img with the icon
        if (logo.parentNode) {
            logo.parentNode.replaceChild(icon, logo);
        }
    });
    
    // 2. Look for any direct references to cryptologos.cc in image sources
    const allImages = document.querySelectorAll('img');
    allImages.forEach(function(img) {
        const src = img.getAttribute('src');
        if (src && (src.includes('cryptologos.cc') || src.includes('solana') || src.includes('sol-logo'))) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-coins';
            icon.style.color = '#14F195';
            icon.style.fontSize = '16px';
            icon.style.verticalAlign = 'middle';
            icon.style.marginRight = '5px';
            
            if (img.parentNode) {
                img.parentNode.replaceChild(icon, img);
            }
        }
    });
    
    // 3. Fix sol-price display and solana-price class instances
    const solanaPriceElements = document.querySelectorAll('.solana-price');
    solanaPriceElements.forEach(function(element) {
        // Remove the image and keep only the price text
        const imgElement = element.querySelector('img');
        if (imgElement) {
            imgElement.remove();
        }
        
        // Add FontAwesome icon at the beginning
        const icon = document.createElement('i');
        icon.className = 'fas fa-coins';
        icon.style.color = '#14F195';
        icon.style.fontSize = '16px';
        icon.style.verticalAlign = 'middle';
        icon.style.marginRight = '5px';
        
        // Insert the icon at the beginning of the element
        element.insertBefore(icon, element.firstChild);
    });
    
    // 4. Fix any Solana logos in stats displays
    const statLogos = document.querySelectorAll('.stat-display .sol-icon, .stat-display .sol-logo');
    statLogos.forEach(function(logo) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-coins';
        icon.style.color = '#14F195';
        icon.style.fontSize = '16px';
        icon.style.verticalAlign = 'middle';
        icon.style.marginRight = '5px';
        
        if (logo.parentNode) {
            logo.parentNode.replaceChild(icon, logo);
        }
    });
    
    // 5. Fix sol-price elements directly
    const solPriceElements = document.querySelectorAll('#sol-price');
    solPriceElements.forEach(function(priceElement) {
        const parentElement = priceElement.parentElement;
        if (parentElement) {
            // Check if there's an image before the price
            const prevElement = parentElement.previousElementSibling;
            if (prevElement && prevElement.tagName === 'IMG') {
                prevElement.remove();
            }
            
            // Add icon if needed
            if (!parentElement.querySelector('.fas.fa-coins')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-coins';
                icon.style.color = '#14F195';
                icon.style.fontSize = '16px';
                icon.style.verticalAlign = 'middle';
                icon.style.marginRight = '5px';
                
                parentElement.insertBefore(icon, parentElement.firstChild);
            }
        }
    });
    
    console.log('SOL logo replacement completed');
}); 