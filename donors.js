// ============================================
// BLOOD DONORS PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupEventListeners();
    loadDonationStats();
    // Load fake donor data for testing
    populateFakeDonors();
});

function setupEventListeners() {
    // Register form
    document.getElementById('donor-register-form').addEventListener('submit', registerDonor);
    document.getElementById('detect-location-btn').addEventListener('click', detectLocationForRegistration);
    
    // Search
    document.getElementById('search-detect-location-btn').addEventListener('click', detectLocationForSearch);
    document.getElementById('search-donors-btn').addEventListener('click', searchDonors);
    document.getElementById('search-radius').addEventListener('input', (e) => {
        document.getElementById('radius-display').textContent = e.target.value + ' km';
    });
}

// ============================================
// DONOR REGISTRATION
// ============================================

function registerDonor(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('register-message');

    const donor = {
        id: Date.now(),
        name: document.getElementById('donor-name').value,
        phone: document.getElementById('donor-phone').value,
        email: document.getElementById('donor-email').value,
        blood_type: document.getElementById('donor-blood-type').value,
        last_donation_date: document.getElementById('donor-last-donation').value || null,
        donation_count: parseInt(document.getElementById('donor-count').value) || 0,
        latitude: parseFloat(document.getElementById('donor-latitude').value),
        longitude: parseFloat(document.getElementById('donor-longitude').value),
        registered_date: new Date().toISOString()
    };

    if (!donor.blood_type) {
        showMessage('register-message', 'Please select a blood type', 'error');
        return;
    }
    if (isNaN(donor.latitude) || isNaN(donor.longitude)) {
        showMessage('register-message', 'Please provide valid location coordinates', 'error');
        return;
    }

    let donors = JSON.parse(localStorage.getItem('donors')) || [];
    donors.push(donor);
    localStorage.setItem('donors', JSON.stringify(donors));

    showMessage('register-message', `✅ Registered successfully! Your ID: ${donor.id}`, 'success');
    document.getElementById('donor-register-form').reset();
    document.getElementById('location-status').textContent = '';
    
    updateDashboardStats();
    loadDonationStats();
}

// ============================================
// LOCATION DETECTION
// ============================================

function detectLocationForRegistration() {
    const statusDiv = document.getElementById('location-status');
    if (navigator.geolocation) {
        statusDiv.textContent = '📍 Detecting location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('donor-latitude').value = lat.toFixed(4);
                document.getElementById('donor-longitude').value = lng.toFixed(4);
                statusDiv.textContent = `✅ Location detected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            },
            (error) => {
                statusDiv.textContent = '❌ Location access denied. Please enter manually.';
            }
        );
    } else {
        statusDiv.textContent = '❌ Geolocation not supported.';
    }
}

function detectLocationForSearch() {
    const statusDiv = document.getElementById('search-location-status');
    if (navigator.geolocation) {
        statusDiv.textContent = '📍 Detecting location...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                document.getElementById('search-latitude').value = lat.toFixed(4);
                document.getElementById('search-longitude').value = lng.toFixed(4);
                statusDiv.textContent = `✅ Location detected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            },
            (error) => {
                statusDiv.textContent = '❌ Location access denied. Please enter manually.';
            }
        );
    } else {
        statusDiv.textContent = '❌ Geolocation not supported.';
    }
}

// ============================================
// DONOR SEARCH
// ============================================

function searchDonors() {
    const bloodType = document.getElementById('search-blood-type').value;
    const radius = parseFloat(document.getElementById('search-radius').value);
    const userLat = parseFloat(document.getElementById('search-latitude').value);
    const userLng = parseFloat(document.getElementById('search-longitude').value);
    const resultsDiv = document.getElementById('search-results');

    if (!bloodType) {
        resultsDiv.innerHTML = '<div class="info-message">Please select a blood type.</div>';
        return;
    }
    if (isNaN(userLat) || isNaN(userLng)) {
        resultsDiv.innerHTML = '<div class="info-message">Please provide valid location coordinates.</div>';
        return;
    }

    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const matchingDonors = donors.filter(d => d.blood_type === bloodType);

    if (matchingDonors.length === 0) {
        resultsDiv.innerHTML = '<div class="info-message">No donors found with this blood type. Be the first to register!</div>';
        return;
    }

    const donorsWithDistance = matchingDonors.map(d => ({
        ...d,
        distance: haversineDistance(userLat, userLng, d.latitude, d.longitude),
        availabilityScore: calculateAvailabilityScore(d.last_donation_date, d.donation_count)
    })).filter(d => d.distance <= radius).sort((a, b) => a.distance - b.distance);

    if (donorsWithDistance.length === 0) {
        resultsDiv.innerHTML = `<div class="info-message">No donors found within ${radius} km radius.</div>`;
        return;
    }

    let html = `<h3>Found ${donorsWithDistance.length} donor(s)</h3>`;
    donorsWithDistance.forEach((donor, idx) => {
        const badge = getAvailabilityBadge(donor.availabilityScore);
        html += `
            <div class="donor-card">
                <h4>#${idx + 1} - ${donor.name}</h4>
                <div class="donor-info">
                    <p><strong>Blood Type:</strong> ${donor.blood_type}</p>
                    <p><strong>Phone:</strong> ${donor.phone}</p>
                    <p><strong>Distance:</strong> ${donor.distance.toFixed(2)} km</p>
                    <p><strong>Total Donations:</strong> ${donor.donation_count}</p>
                    <p><strong>Last Donation:</strong> ${formatDate(donor.last_donation_date)}</p>
                </div>
                <span class="badge ${badge.class}">${badge.text} (${donor.availabilityScore}%)</span>
                <button onclick="notifyDonor(${donor.id})" class="btn btn-secondary" style="margin-top: 10px;">Send Notification</button>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

function notifyDonor(donorId) {
    const notification = {
        id: Date.now(),
        donorId: donorId,
        message: 'Blood donation request received',
        timestamp: new Date().toISOString()
    };

    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    alert('✅ Notification sent to donor!');
    updateDashboardStats();
}

// ============================================
// DONATION STATISTICS
// ============================================

function loadDonationStats() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    
    let totalDonations = 0;
    let availableNow = 0;
    let eligibleSoon = 0;
    const bloodTypeCount = {};

    donors.forEach(donor => {
        totalDonations += donor.donation_count;
        const score = calculateAvailabilityScore(donor.last_donation_date, donor.donation_count);
        
        if (score >= 75) availableNow++;
        else if (score >= 50) eligibleSoon++;
        
        bloodTypeCount[donor.blood_type] = (bloodTypeCount[donor.blood_type] || 0) + 1;
    });

    document.getElementById('stat-total-donors').textContent = donors.length;
    document.getElementById('stat-total-donations').textContent = totalDonations;
    document.getElementById('stat-available').textContent = availableNow;
    document.getElementById('stat-eligible-soon').textContent = eligibleSoon;

    // Blood type chart
    const chartDiv = document.getElementById('blood-type-chart');
    if (chartDiv) {
        let chartHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
        Object.entries(bloodTypeCount).forEach(([type, count]) => {
            chartHTML += `
                <div style="background: var(--bg-hover); padding: 15px; border-radius: 8px; text-align: center;">
                    <h4 style="color: var(--primary); margin-bottom: 10px;">${type}</h4>
                    <p style="font-size: 1.5em; color: var(--secondary); font-weight: bold;">${count}</p>
                </div>
            `;
        });
        chartHTML += '</div>';
        chartDiv.innerHTML = chartHTML;
    }
}

// ============================================
// FAKE DONOR DATA FOR TESTING
// ============================================

function populateFakeDonors() {
    const fakeDonors = [
        {
            id: 1001,
            name: "Rajesh Kumar",
            phone: "9876543210",
            email: "rajesh@example.com",
            blood_type: "O+",
            last_donation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 5,
            latitude: 28.4744,
            longitude: 77.5714,
            registered_date: new Date().toISOString()
        },
        {
            id: 1002,
            name: "Priya Singh",
            phone: "9876543211",
            email: "priya@example.com",
            blood_type: "B+",
            last_donation_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 3,
            latitude: 28.4750,
            longitude: 77.5720,
            registered_date: new Date().toISOString()
        },
        {
            id: 1003,
            name: "Amit Patel",
            phone: "9876543212",
            email: "amit@example.com",
            blood_type: "A+",
            last_donation_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 8,
            latitude: 28.4730,
            longitude: 77.5700,
            registered_date: new Date().toISOString()
        },
        {
            id: 1004,
            name: "Neha Gupta",
            phone: "9876543213",
            email: "neha@example.com",
            blood_type: "AB+",
            last_donation_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 2,
            latitude: 28.4760,
            longitude: 77.5730,
            registered_date: new Date().toISOString()
        },
        {
            id: 1005,
            name: "Vikram Sharma",
            phone: "9876543214",
            email: "vikram@example.com",
            blood_type: "O+",
            last_donation_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 6,
            latitude: 28.4720,
            longitude: 77.5690,
            registered_date: new Date().toISOString()
        },
        {
            id: 1006,
            name: "Anjali Verma",
            phone: "9876543215",
            email: "anjali@example.com",
            blood_type: "B-",
            last_donation_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 4,
            latitude: 28.4755,
            longitude: 77.5710,
            registered_date: new Date().toISOString()
        },
        {
            id: 1007,
            name: "Suresh Reddy",
            phone: "9876543216",
            email: "suresh@example.com",
            blood_type: "A-",
            last_donation_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 1,
            latitude: 28.4740,
            longitude: 77.5725,
            registered_date: new Date().toISOString()
        },
        {
            id: 1008,
            name: "Meera Nair",
            phone: "9876543217",
            email: "meera@example.com",
            blood_type: "O+",
            last_donation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            donation_count: 7,
            latitude: 28.4735,
            longitude: 77.5705,
            registered_date: new Date().toISOString()
        }
    ];

    localStorage.setItem('donors', JSON.stringify(fakeDonors));
    console.log('✅ Fake donor data loaded. Total donors:', fakeDonors.length);
    loadDonationStats();
}
