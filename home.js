// ============================================
// HOME PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateHomeStats();
    setupAnimations();
});

function updateHomeStats() {
    const stats = getStats();
    
    document.getElementById('stat-donors').textContent = stats.donors;
    document.getElementById('stat-medicines').textContent = stats.medicines;
    document.getElementById('stat-tests').textContent = stats.tests;
}

function setupAnimations() {
    // Animate stat numbers
    const statElements = document.querySelectorAll('.stat-item h3');
    statElements.forEach(el => {
        const finalValue = parseInt(el.textContent);
        if (finalValue > 0) {
            animateNumber(el, 0, finalValue, 1000);
        }
    });
}

function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}
