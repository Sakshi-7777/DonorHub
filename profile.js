// ============================================
// PROFILE PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupEventListeners();
    loadProfileData();
    loadProfileStats();
});

function setupEventListeners() {
    const personalForm = document.getElementById('personal-form');
    const healthForm = document.getElementById('health-form');
    
    if (personalForm) {
        personalForm.addEventListener('submit', savePersonalInfo);
    }
    
    if (healthForm) {
        healthForm.addEventListener('submit', saveHealthInfo);
    }
    
    // Setup settings checkboxes
    setupSettingsListeners();
}

// ============================================
// PROFILE DATA MANAGEMENT
// ============================================

function loadProfileData() {
    const profile = JSON.parse(localStorage.getItem('user-profile')) || {};
    
    if (profile.name) {
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-name-input').value = profile.name;
    }
    
    if (profile.email) {
        document.getElementById('profile-email').value = profile.email;
    }
    
    if (profile.phone) {
        document.getElementById('profile-phone').value = profile.phone;
    }
    
    if (profile.dob) {
        document.getElementById('profile-dob').value = profile.dob;
    }
    
    if (profile.gender) {
        document.getElementById('profile-gender').value = profile.gender;
    }
    
    if (profile.blood_type) {
        document.getElementById('profile-blood-type').value = profile.blood_type;
    }
    
    if (profile.height) {
        document.getElementById('profile-height').value = profile.height;
    }
    
    if (profile.weight) {
        document.getElementById('profile-weight').value = profile.weight;
    }
    
    if (profile.bp) {
        document.getElementById('profile-bp').value = profile.bp;
    }
    
    if (profile.allergies) {
        document.getElementById('profile-allergies').value = profile.allergies;
    }
    
    if (profile.conditions) {
        document.getElementById('profile-conditions').value = profile.conditions;
    }
    
    if (profile.medications) {
        document.getElementById('profile-medications').value = profile.medications;
    }
}

function savePersonalInfo(e) {
    e.preventDefault();
    
    const profile = JSON.parse(localStorage.getItem('user-profile')) || {};
    
    profile.name = document.getElementById('profile-name-input').value;
    profile.email = document.getElementById('profile-email').value;
    profile.phone = document.getElementById('profile-phone').value;
    profile.dob = document.getElementById('profile-dob').value;
    profile.gender = document.getElementById('profile-gender').value;
    profile.blood_type = document.getElementById('profile-blood-type').value;
    
    localStorage.setItem('user-profile', JSON.stringify(profile));
    
    document.getElementById('profile-name').textContent = profile.name || 'User Profile';
    showMessage('register-message', 'Personal information saved successfully!', 'success');
}

function saveHealthInfo(e) {
    e.preventDefault();
    
    const profile = JSON.parse(localStorage.getItem('user-profile')) || {};
    
    profile.height = document.getElementById('profile-height').value;
    profile.weight = document.getElementById('profile-weight').value;
    profile.bp = document.getElementById('profile-bp').value;
    profile.allergies = document.getElementById('profile-allergies').value;
    profile.conditions = document.getElementById('profile-conditions').value;
    profile.medications = document.getElementById('profile-medications').value;
    
    localStorage.setItem('user-profile', JSON.stringify(profile));
    
    showMessage('register-message', 'Health information saved successfully!', 'success');
}

// ============================================
// PROFILE STATISTICS
// ============================================

function loadProfileStats() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    const favorites = JSON.parse(localStorage.getItem('medicines-favorites')) || [];
    
    // Find user's donor record
    const userDonor = donors.length > 0 ? donors[donors.length - 1] : null;
    
    let donations = 0;
    let status = 'Not registered';
    
    if (userDonor) {
        donations = userDonor.donation_count;
        status = `Registered as ${userDonor.blood_type} donor`;
    }
    
    document.getElementById('stat-donations').textContent = donations;
    document.getElementById('stat-health-tests').textContent = tests.length;
    document.getElementById('stat-medicines-saved').textContent = favorites.length;
    document.getElementById('stat-streak').textContent = calculateStreak();
    
    document.getElementById('profile-status').textContent = status;
    
    // Load recent activity
    loadRecentActivity(userDonor, tests);
}

function calculateStreak() {
    const tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    if (tests.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = tests.length - 1; i >= 0; i--) {
        const testDate = new Date(tests[i].timestamp);
        testDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((today - testDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function loadRecentActivity(donor, tests) {
    const container = document.getElementById('recent-activity');
    let html = '';
    
    if (donor) {
        html += `<div class="activity-item">🩸 Registered as blood donor (${donor.blood_type})</div>`;
    }
    
    if (tests.length > 0) {
        const latestTest = tests[tests.length - 1];
        html += `<div class="activity-item">🏥 Completed health test - Score: ${latestTest.score}/100</div>`;
    }
    
    if (html === '') {
        html = '<p style="color: var(--text-secondary);">No recent activity yet</p>';
    }
    
    container.innerHTML = html;
}

// ============================================
// DONATION HISTORY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const donationHistoryContainer = document.getElementById('donation-history');
    if (donationHistoryContainer) {
        loadDonationHistory();
    }
});

function loadDonationHistory() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const container = document.getElementById('donation-history');
    
    if (donors.length === 0) {
        container.innerHTML = '<div class="info-message">No donation history yet. Register as a donor to get started!</div>';
        return;
    }
    
    let html = '';
    donors.forEach((donor, idx) => {
        html += `
            <div class="donor-card">
                <h4>Donation Record #${idx + 1}</h4>
                <div class="donor-info">
                    <p><strong>Name:</strong> ${donor.name}</p>
                    <p><strong>Blood Type:</strong> ${donor.blood_type}</p>
                    <p><strong>Phone:</strong> ${donor.phone}</p>
                    <p><strong>Total Donations:</strong> ${donor.donation_count}</p>
                    <p><strong>Last Donation:</strong> ${formatDate(donor.last_donation_date)}</p>
                    <p><strong>Registered:</strong> ${formatDate(donor.registered_date)}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// SETTINGS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('app-settings')) || {};
    
    if (document.getElementById('notify-donations')) {
        document.getElementById('notify-donations').checked = settings.notifyDonations !== false;
    }
    if (document.getElementById('notify-health')) {
        document.getElementById('notify-health').checked = settings.notifyHealth !== false;
    }
    if (document.getElementById('notify-urgent')) {
        document.getElementById('notify-urgent').checked = settings.notifyUrgent !== false;
    }
    if (document.getElementById('privacy-profile')) {
        document.getElementById('privacy-profile').checked = settings.privacyProfile !== false;
    }
    if (document.getElementById('privacy-data')) {
        document.getElementById('privacy-data').checked = settings.privacyData === true;
    }
    
    // Save settings on change
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveSettings);
    });
}

function setupSettingsListeners() {
    loadSettings();
}

function saveSettings() {
    const settings = {
        notifyDonations: document.getElementById('notify-donations')?.checked || false,
        notifyHealth: document.getElementById('notify-health')?.checked || false,
        notifyUrgent: document.getElementById('notify-urgent')?.checked || false,
        privacyProfile: document.getElementById('privacy-profile')?.checked || false,
        privacyData: document.getElementById('privacy-data')?.checked || false
    };
    
    localStorage.setItem('app-settings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
}
