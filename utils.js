// ============================================
// UTILITY FUNCTIONS & SHARED CODE
// ============================================

const MED_API_KEY = "AIzaSyBaWJbo1Bznh69c4xD4dvCEias0wAmqlkc";

// Initialize localStorage
function initStorage() {
    if (!localStorage.getItem('donors')) localStorage.setItem('donors', JSON.stringify([]));
    if (!localStorage.getItem('notifications')) localStorage.setItem('notifications', JSON.stringify([]));
    if (!localStorage.getItem('healthTests')) localStorage.setItem('healthTests', JSON.stringify([]));
    if (!localStorage.getItem('medicines-favorites')) localStorage.setItem('medicines-favorites', JSON.stringify([]));
    if (!localStorage.getItem('search-history')) localStorage.setItem('search-history', JSON.stringify([]));
    if (!localStorage.getItem('user-profile')) localStorage.setItem('user-profile', JSON.stringify({}));
}

// Tab switching
function setupTabNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            switchTab(tabName);
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Message display
function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `<div class="${type}-message">${message}</div>`;
    element.classList.add('show');
    
    if (type !== 'error') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 5000);
    }
}

// Haversine distance calculation
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Fuzzy match
function fuzzyMatch(query, text) {
    let queryIdx = 0;
    let textIdx = 0;
    let score = 0;

    query = query.toLowerCase();
    text = text.toLowerCase();

    while (queryIdx < query.length && textIdx < text.length) {
        if (query[queryIdx] === text[textIdx]) {
            score++;
            queryIdx++;
        }
        textIdx++;
    }

    return queryIdx === query.length ? score : 0;
}

// Medicine database
const medicineDatabase = [
    { name: 'Aspirin', use: 'Pain relief, fever, heart health', dosage: '500mg', side_effects: 'Stomach upset, bleeding', category: 'pain' },
    { name: 'Paracetamol', use: 'Fever, headache, pain relief', dosage: '500mg', side_effects: 'Rare, liver damage if overdose', category: 'fever' },
    { name: 'Ibuprofen', use: 'Inflammation, pain, fever', dosage: '200-400mg', side_effects: 'Stomach upset, kidney issues', category: 'pain' },
    { name: 'Amoxicillin', use: 'Bacterial infections', dosage: '250-500mg', side_effects: 'Allergic reactions, diarrhea', category: 'antibiotics' },
    { name: 'Metformin', use: 'Diabetes management', dosage: '500-1000mg', side_effects: 'Nausea, lactic acidosis', category: 'chronic' },
    { name: 'Lisinopril', use: 'High blood pressure', dosage: '10-40mg', side_effects: 'Cough, dizziness', category: 'chronic' },
    { name: 'Atorvastatin', use: 'Cholesterol management', dosage: '10-80mg', side_effects: 'Muscle pain, liver issues', category: 'chronic' },
    { name: 'Omeprazole', use: 'Acid reflux, GERD', dosage: '20-40mg', side_effects: 'Headache, nausea', category: 'digestive' },
    { name: 'Cetirizine', use: 'Allergies, itching', dosage: '10mg', side_effects: 'Drowsiness, dry mouth', category: 'allergy' },
    { name: 'Loratadine', use: 'Allergies, hay fever', dosage: '10mg', side_effects: 'Headache, dry mouth', category: 'allergy' },
    { name: 'Cough Syrup', use: 'Cough relief', dosage: '5-10ml', side_effects: 'Drowsiness, dizziness', category: 'cold' },
    { name: 'Antacid', use: 'Heartburn, indigestion', dosage: '1-2 tablets', side_effects: 'Constipation, diarrhea', category: 'digestive' },
    { name: 'Vitamin C', use: 'Immune support', dosage: '500-1000mg', side_effects: 'Kidney stones if excess', category: 'vitamins' },
    { name: 'Vitamin D', use: 'Bone health, immunity', dosage: '1000-2000 IU', side_effects: 'Rare toxicity', category: 'vitamins' },
    { name: 'Multivitamin', use: 'General health', dosage: '1 tablet daily', side_effects: 'Nausea if taken empty stomach', category: 'vitamins' },
    { name: 'Insulin', use: 'Diabetes management', dosage: 'Varies', side_effects: 'Hypoglycemia, weight gain', category: 'chronic' },
    { name: 'Antihistamine', use: 'Allergies, itching', dosage: '25-50mg', side_effects: 'Drowsiness', category: 'allergy' },
    { name: 'Cold Medicine', use: 'Cold symptoms', dosage: 'As per label', side_effects: 'Drowsiness, dizziness', category: 'cold' },
    { name: 'Flu Medicine', use: 'Flu symptoms', dosage: 'As per label', side_effects: 'Nausea, headache', category: 'cold' },
    { name: 'Asthma Inhaler', use: 'Asthma relief', dosage: '1-2 puffs', side_effects: 'Tremor, anxiety', category: 'respiratory' },
    { name: 'Decongestant', use: 'Nasal congestion', dosage: '30-60mg', side_effects: 'Insomnia, anxiety', category: 'cold' },
    { name: 'Probiotic', use: 'Gut health', dosage: '1-2 capsules', side_effects: 'Bloating initially', category: 'digestive' },
    { name: 'Calcium Supplement', use: 'Bone health', dosage: '500-1000mg', side_effects: 'Constipation', category: 'vitamins' },
    { name: 'Iron Supplement', use: 'Anemia treatment', dosage: '325mg', side_effects: 'Constipation, nausea', category: 'vitamins' },
    { name: 'Magnesium', use: 'Muscle relaxation', dosage: '200-400mg', side_effects: 'Diarrhea', category: 'vitamins' },
    { name: 'Melatonin', use: 'Sleep aid', dosage: '1-5mg', side_effects: 'Headache, dizziness', category: 'sleep' },
    { name: 'Ginger Supplement', use: 'Nausea, inflammation', dosage: '500-1000mg', side_effects: 'Heartburn', category: 'natural' },
    { name: 'Turmeric', use: 'Anti-inflammatory', dosage: '500-1000mg', side_effects: 'Stomach upset', category: 'natural' },
    { name: 'Fish Oil', use: 'Heart, brain health', dosage: '1000-3000mg', side_effects: 'Fish burps, bleeding', category: 'vitamins' },
    { name: 'Glucosamine', use: 'Joint health', dosage: '1500mg', side_effects: 'Nausea, diarrhea', category: 'joint' }
];

// Availability score
function calculateAvailabilityScore(lastDonationDate, donationCount) {
    if (!lastDonationDate) return 100;

    const last = new Date(lastDonationDate);
    const today = new Date();
    const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    const minDaysBetween = 56;
    let score = 0;

    if (daysSince < minDaysBetween) {
        score = (daysSince / minDaysBetween) * 50;
    } else if (daysSince < 90) {
        score = 50 + ((daysSince - minDaysBetween) / 34) * 25;
    } else {
        score = 75 + Math.min(25, (daysSince - 90) / 100 * 25);
    }

    if (donationCount > 5) score = Math.min(100, score + 10);

    return Math.round(score);
}

function getAvailabilityBadge(score) {
    if (score >= 75) return { class: 'high', text: 'High Availability' };
    if (score >= 50) return { class: 'medium', text: 'Medium Availability' };
    return { class: 'low', text: 'Low Availability' };
}

// Detect language
function detectLanguage(text) {
    const hindiWords = ['aap', 'mera', 'kya', 'hai', 'hain', 'se', 'ko', 'ne', 'ke', 'ka', 'ki'];
    const words = text.toLowerCase().split(' ');
    const hindiCount = words.filter(w => hindiWords.some(hw => w.includes(hw))).length;
    return hindiCount > 0 ? 'hi' : 'en';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get stats
function getStats() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    return {
        donors: donors.length,
        tests: tests.length,
        notifications: notifications.length,
        medicines: medicineDatabase.length
    };
}

// Update dashboard stats
function updateDashboardStats() {
    const stats = getStats();
    const elements = {
        'stat-donors': stats.donors,
        'donor-count': stats.donors,
        'stat-total-donors': stats.donors,
        'stat-medicines': stats.medicines,
        'test-count': stats.tests,
        'stat-total-tests': stats.tests,
        'notification-count': stats.notifications
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.querySelector('.nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    setupTabNavigation();
    setupMobileMenu();
    updateDashboardStats();
});

// Export data
function exportData() {
    const data = {
        donors: JSON.parse(localStorage.getItem('donors')),
        tests: JSON.parse(localStorage.getItem('healthTests')),
        profile: JSON.parse(localStorage.getItem('user-profile')),
        exported: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthhub-data-${Date.now()}.json`;
    link.click();
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure? This will delete all your data permanently.')) {
        localStorage.clear();
        initStorage();
        alert('All data cleared');
        location.reload();
    }
}
