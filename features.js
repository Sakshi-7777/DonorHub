// ============================================
// ADVANCED FEATURES
// ============================================

// ============================================
// 1. DARK/LIGHT THEME TOGGLE
// ============================================

function initThemeToggle() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    // Add theme toggle button to sidebar if it exists
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-toggle-btn';
        themeBtn.className = 'theme-toggle-btn';
        themeBtn.innerHTML = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
        themeBtn.onclick = toggleTheme;
        
        const footer = sidebar.querySelector('.sidebar-footer');
        if (footer) {
            footer.parentNode.insertBefore(themeBtn, footer);
        }
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.innerHTML = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('light-theme');
    } else {
        root.classList.remove('light-theme');
    }
}

// ============================================
// 2. SOCIAL FEATURES - Share Health Tips & Stories
// ============================================

function initSocialFeatures() {
    const socialSection = document.getElementById('social-feed');
    if (socialSection) {
        loadSocialFeed();
    }
}

function loadSocialFeed() {
    const feed = JSON.parse(localStorage.getItem('social-feed')) || [];
    const container = document.getElementById('social-feed');
    
    if (!container) return;
    
    if (feed.length === 0) {
        container.innerHTML = '<div class="info-message">No posts yet. Be the first to share!</div>';
        return;
    }
    
    let html = '<div class="social-feed-container">';
    feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(post => {
        html += `
            <div class="social-post">
                <div class="post-header">
                    <h4>${post.author}</h4>
                    <span class="post-date">${formatDate(post.timestamp)}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${post.type === 'tip' ? '<span class="badge badge-info">💡 Health Tip</span>' : '<span class="badge badge-success">📖 Story</span>'}
                </div>
                <div class="post-actions">
                    <button onclick="likePost('${post.id}')" class="btn-small">👍 ${post.likes || 0}</button>
                    <button onclick="sharePost('${post.id}')" class="btn-small">📤 Share</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function createSocialPost(author, content, type = 'tip') {
    const post = {
        id: Date.now(),
        author: author,
        content: content,
        type: type,
        timestamp: new Date().toISOString(),
        likes: 0
    };
    
    let feed = JSON.parse(localStorage.getItem('social-feed')) || [];
    feed.push(post);
    localStorage.setItem('social-feed', JSON.stringify(feed));
    loadSocialFeed();
    return post;
}

function likePost(postId) {
    let feed = JSON.parse(localStorage.getItem('social-feed')) || [];
    const post = feed.find(p => p.id == postId);
    if (post) {
        post.likes = (post.likes || 0) + 1;
        localStorage.setItem('social-feed', JSON.stringify(feed));
        loadSocialFeed();
    }
}

function sharePost(postId) {
    const feed = JSON.parse(localStorage.getItem('social-feed')) || [];
    const post = feed.find(p => p.id == postId);
    if (post && navigator.share) {
        navigator.share({
            title: 'Aura Healthcare',
            text: post.content,
            url: window.location.href
        });
    } else if (post) {
        alert('Post: ' + post.content);
    }
}

// ============================================
// 3. APPOINTMENT BOOKING
// ============================================

function initAppointments() {
    const appointmentSection = document.getElementById('appointments');
    if (appointmentSection) {
        loadAppointments();
    }
}

function bookAppointment(donorId, date, time) {
    const appointment = {
        id: Date.now(),
        donorId: donorId,
        date: date,
        time: time,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    return appointment;
}

function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const container = document.getElementById('appointments');
    
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = '<div class="info-message">No appointments booked yet.</div>';
        return;
    }
    
    let html = '<div class="appointments-list">';
    appointments.forEach(apt => {
        html += `
            <div class="appointment-card">
                <h4>Appointment #${apt.id}</h4>
                <p><strong>Date:</strong> ${apt.date}</p>
                <p><strong>Time:</strong> ${apt.time}</p>
                <p><strong>Status:</strong> <span class="badge badge-${apt.status === 'pending' ? 'warning' : 'success'}">${apt.status}</span></p>
                <button onclick="cancelAppointment(${apt.id})" class="btn btn-secondary">Cancel</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function cancelAppointment(appointmentId) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments = appointments.filter(a => a.id !== appointmentId);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

// ============================================
// 4. HOSPITAL & BLOOD BANK FINDER
// ============================================

const HOSPITALS_DATA = [
    { id: 1, name: "Greater Noida Medical Center", type: "Hospital", lat: 28.4744, lng: 77.5714, phone: "9876543210", services: ["Blood Bank", "Emergency", "ICU"] },
    { id: 2, name: "Noida Blood Bank", type: "Blood Bank", lat: 28.4750, lng: 77.5720, phone: "9876543211", services: ["Blood Donation", "Blood Testing"] },
    { id: 3, name: "City Hospital", type: "Hospital", lat: 28.4730, lng: 77.5700, phone: "9876543212", services: ["Blood Bank", "Surgery", "Cardiology"] },
    { id: 4, name: "Red Cross Blood Center", type: "Blood Bank", lat: 28.4760, lng: 77.5730, phone: "9876543213", services: ["Blood Donation", "Plasma Collection"] },
    { id: 5, name: "Apollo Health Center", type: "Hospital", lat: 28.4720, lng: 77.5690, phone: "9876543214", services: ["Blood Bank", "Diagnostics", "Pharmacy"] }
];

function findNearbyHospitals(userLat, userLng, radius = 10) {
    return HOSPITALS_DATA.map(hospital => ({
        ...hospital,
        distance: haversineDistance(userLat, userLng, hospital.lat, hospital.lng)
    })).filter(h => h.distance <= radius).sort((a, b) => a.distance - b.distance);
}

function displayHospitals(hospitals) {
    const container = document.getElementById('hospitals-list');
    if (!container) return;
    
    if (hospitals.length === 0) {
        container.innerHTML = '<div class="info-message">No hospitals found nearby.</div>';
        return;
    }
    
    let html = '<div class="hospitals-grid">';
    hospitals.forEach(hospital => {
        html += `
            <div class="hospital-card">
                <h4>${hospital.name}</h4>
                <p><strong>Type:</strong> ${hospital.type}</p>
                <p><strong>Distance:</strong> ${hospital.distance.toFixed(2)} km</p>
                <p><strong>Phone:</strong> <a href="tel:${hospital.phone}">${hospital.phone}</a></p>
                <p><strong>Services:</strong> ${hospital.services.join(', ')}</p>
                <button onclick="openMaps(${hospital.lat}, ${hospital.lng})" class="btn btn-primary">📍 Open Map</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function openMaps(lat, lng) {
    const url = `https://www.google.com/maps/search/${lat},${lng}`;
    window.open(url, '_blank');
}

// ============================================
// 5. EMERGENCY SOS ALERTS
// ============================================

function initEmergencySOS() {
    const sosBtn = document.getElementById('sos-button');
    if (sosBtn) {
        sosBtn.addEventListener('click', triggerEmergencySOS);
    }
}

function triggerEmergencySOS() {
    const user = JSON.parse(localStorage.getItem('current-user')) || {};
    const bloodType = user.blood_type || 'Unknown';
    
    const alert = {
        id: Date.now(),
        userId: user.id,
        bloodType: bloodType,
        message: `EMERGENCY: Need ${bloodType} blood urgently!`,
        location: user.location || 'Location not available',
        timestamp: new Date().toISOString(),
        status: 'active'
    };
    
    let alerts = JSON.parse(localStorage.getItem('emergency-alerts')) || [];
    alerts.push(alert);
    localStorage.setItem('emergency-alerts', JSON.stringify(alerts));
    
    // Show notification
    showMessage('sos-status', '🚨 Emergency alert sent to nearby donors!', 'success');
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        alert.status = 'resolved';
        localStorage.setItem('emergency-alerts', JSON.stringify(alerts));
    }, 30000);
    
    return alert;
}

function getEmergencyAlerts() {
    return JSON.parse(localStorage.getItem('emergency-alerts')) || [];
}

// ============================================
// 6. REWARDS & GAMIFICATION SYSTEM
// ============================================

function initRewards() {
    const rewardsContainer = document.getElementById('rewards-dashboard');
    if (rewardsContainer) {
        loadRewardsDashboard();
    }
}

function addRewardPoints(userId, points, reason) {
    let rewards = JSON.parse(localStorage.getItem('rewards')) || {};
    if (!rewards[userId]) {
        rewards[userId] = { points: 0, badges: [], history: [] };
    }
    
    rewards[userId].points += points;
    rewards[userId].history.push({
        points: points,
        reason: reason,
        date: new Date().toISOString()
    });
    
    // Check for badges
    checkBadges(userId, rewards[userId]);
    
    localStorage.setItem('rewards', JSON.stringify(rewards));
    return rewards[userId];
}

function checkBadges(userId, userRewards) {
    const badges = [];
    
    if (userRewards.points >= 100) badges.push('🥇 Century Donor');
    if (userRewards.points >= 500) badges.push('🥈 Elite Donor');
    if (userRewards.points >= 1000) badges.push('🥉 Legend Donor');
    
    userRewards.badges = [...new Set(badges)];
}

function loadRewardsDashboard() {
    const user = JSON.parse(localStorage.getItem('current-user')) || {};
    let rewards = JSON.parse(localStorage.getItem('rewards')) || {};
    const userRewards = rewards[user.id] || { points: 0, badges: [], history: [] };
    
    const container = document.getElementById('rewards-dashboard');
    if (!container) return;
    
    let html = `
        <div class="rewards-container">
            <div class="points-display">
                <h3>Your Points</h3>
                <p class="points-value">${userRewards.points}</p>
            </div>
            
            <div class="badges-display">
                <h3>Badges</h3>
                <div class="badges-grid">
                    ${userRewards.badges.length > 0 ? userRewards.badges.map(b => `<span class="badge-item">${b}</span>`).join('') : '<p>No badges yet. Keep donating!</p>'}
                </div>
            </div>
            
            <div class="rewards-history">
                <h3>Recent Activity</h3>
                ${userRewards.history.slice(-5).reverse().map(h => `
                    <div class="history-item">
                        <p><strong>+${h.points} points</strong> - ${h.reason}</p>
                        <span class="date">${formatDate(h.date)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// 7. VIDEO TUTORIALS
// ============================================

const VIDEO_TUTORIALS = [
    { id: 1, title: "How to Register as a Blood Donor", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "5:32" },
    { id: 2, title: "Finding Blood Donors Near You", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "3:45" },
    { id: 3, title: "Health Assessment Guide", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "4:20" },
    { id: 4, title: "Using the AI Health Assistant", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "6:15" },
    { id: 5, title: "Emergency Blood Request Process", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "3:50" }
];

function loadVideoTutorials() {
    const container = document.getElementById('video-tutorials');
    if (!container) return;
    
    let html = '<div class="videos-grid">';
    VIDEO_TUTORIALS.forEach(video => {
        html += `
            <div class="video-card">
                <div class="video-thumbnail">
                    <iframe width="100%" height="200" src="${video.url}" frameborder="0" allowfullscreen></iframe>
                </div>
                <h4>${video.title}</h4>
                <p class="video-duration">⏱️ ${video.duration}</p>
                <button onclick="playVideo('${video.url}')" class="btn btn-primary">▶️ Watch</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function playVideo(url) {
    window.open(url, '_blank');
}

// ============================================
// 8. MULTI-LANGUAGE SUPPORT (HINDI)
// ============================================

const TRANSLATIONS = {
    en: {
        dashboard: "Dashboard",
        bloodDonors: "Blood Donors",
        medicines: "Medicines",
        healthTest: "Health Test",
        aiAssistant: "AI Assistant",
        profile: "Profile",
        socialFeed: "Social Feed",
        appointments: "Appointments",
        hospitals: "Hospitals & Blood Banks",
        emergency: "Emergency SOS",
        rewards: "Rewards",
        tutorials: "Video Tutorials"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        bloodDonors: "रक्त दाता",
        medicines: "दवाएं",
        healthTest: "स्वास्थ्य परीक्षण",
        aiAssistant: "एआई सहायक",
        profile: "प्रोफाइल",
        socialFeed: "सामाजिक फीड",
        appointments: "नियुक्तियां",
        hospitals: "अस्पताल और रक्त बैंक",
        emergency: "आपातकालीन एसओएस",
        rewards: "पुरस्कार",
        tutorials: "वीडियो ट्यूटोरियल"
    }
};

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updateLanguage(lang);
}

function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });
}

function getTranslation(key, lang = 'en') {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initSocialFeatures();
    initAppointments();
    initEmergencySOS();
    initRewards();
    
    const lang = localStorage.getItem('language') || 'en';
    updateLanguage(lang);
    
    // Load video tutorials if section exists
    if (document.getElementById('video-tutorials')) {
        loadVideoTutorials();
    }
});
