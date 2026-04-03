// ============================================
// GLOBAL STATE & INITIALIZATION
// ============================================
const MED_API_KEY = "AIzaSyBaWJbo1Bznh69c4xD4dvCEias0wAmqlkc";
let userLocation = { lat: null, lng: null };
let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadDashboard();
});

function initializeApp() {
    // Initialize localStorage if needed
    if (!localStorage.getItem('donors')) localStorage.setItem('donors', JSON.stringify([]));
    if (!localStorage.getItem('notifications')) localStorage.setItem('notifications', JSON.stringify([]));
    if (!localStorage.getItem('healthTests')) localStorage.setItem('healthTests', JSON.stringify([]));
}

// ============================================
// NAVIGATION & UI MANAGEMENT
// ============================================
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchSection(e.target.dataset.section));
    });

    // Donor Registration
    document.getElementById('donor-form').addEventListener('submit', registerDonor);
    document.getElementById('detect-location-btn').addEventListener('click', detectLocationForRegistration);
    document.getElementById('search-detect-location-btn').addEventListener('click', detectLocationForSearch);

    // Donor Search
    document.getElementById('search-donors-btn').addEventListener('click', searchDonors);

    // Medicine Search
    document.getElementById('search-medicine-btn').addEventListener('click', searchMedicine);
    document.getElementById('online-search-btn').addEventListener('click', onlineSearchMedicine);

    // Health Test
    document.getElementById('health-test-form').addEventListener('submit', submitHealthTest);

    // Chatbot
    document.getElementById('send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('voice-btn').addEventListener('click', startVoiceInput);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Quick buttons
    document.getElementById('quick-donors').addEventListener('click', () => quickChatAction('find donors'));
    document.getElementById('quick-medicine').addEventListener('click', () => quickChatAction('medicine for fever'));
    document.getElementById('quick-health-test').addEventListener('click', () => quickChatAction('health test'));
    document.getElementById('quick-tips').addEventListener('click', () => quickChatAction('health tips'));
    document.getElementById('quick-blood-groups').addEventListener('click', () => quickChatAction('blood groups info'));
    document.getElementById('quick-eligibility').addEventListener('click', () => quickChatAction('eligibility'));
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
    updateDonorCount();
    updateTestCount();
    updateNotificationCount();
}

function updateDonorCount() {
    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    document.getElementById('donor-count').textContent = donors.length;
}

function updateTestCount() {
    const tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    document.getElementById('test-count').textContent = tests.length;
}

function updateNotificationCount() {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    document.getElementById('notification-count').textContent = notifications.length;
}

// ============================================
// BLOOD DONATION SYSTEM - DONOR REGISTRATION
// ============================================
function registerDonor(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('register-message');

    const donor = {
        id: Date.now(),
        name: document.getElementById('donor-name').value,
        phone: document.getElementById('donor-phone').value,
        blood_type: document.getElementById('donor-blood-type').value,
        last_donation_date: document.getElementById('donor-last-donation').value || null,
        donation_count: parseInt(document.getElementById('donor-count-input').value) || 0,
        latitude: parseFloat(document.getElementById('donor-latitude').value),
        longitude: parseFloat(document.getElementById('donor-longitude').value),
        registered_date: new Date().toISOString()
    };

    // Validation
    if (!donor.blood_type) {
        messageDiv.innerHTML = '<div class="error-message">Please select a blood type.</div>';
        return;
    }
    if (isNaN(donor.latitude) || isNaN(donor.longitude)) {
        messageDiv.innerHTML = '<div class="error-message">Please provide valid latitude and longitude.</div>';
        return;
    }

    // Save to localStorage
    let donors = JSON.parse(localStorage.getItem('donors')) || [];
    donors.push(donor);
    localStorage.setItem('donors', JSON.stringify(donors));

    messageDiv.innerHTML = `<div class="success-message">✅ Registered successfully! Your ID: ${donor.id}</div>`;
    document.getElementById('donor-form').reset();
    document.getElementById('location-status').textContent = '';

    // Update dashboard
    updateDonorCount();
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
                userLocation = { lat, lng };
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
                userLocation = { lat, lng };
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
// HAVERSINE FORMULA - Calculate distance
// ============================================
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ============================================
// AVAILABILITY SCORE - Calculate donor availability
// ============================================
function calculateAvailabilityScore(lastDonationDate, donationCount) {
    if (!lastDonationDate) {
        return 100; // Never donated, fully available
    }

    const last = new Date(lastDonationDate);
    const today = new Date();
    const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    // Blood donation eligibility: minimum 56 days between donations
    const minDaysBetween = 56;
    let score = 0;

    if (daysSince < minDaysBetween) {
        score = (daysSince / minDaysBetween) * 50; // 0-50 if not eligible
    } else if (daysSince < 90) {
        score = 50 + ((daysSince - minDaysBetween) / 34) * 25; // 50-75
    } else {
        score = 75 + Math.min(25, (daysSince - 90) / 100 * 25); // 75-100
    }

    // Bonus for multiple donations
    if (donationCount > 5) score = Math.min(100, score + 10);

    return Math.round(score);
}

function getAvailabilityBadge(score) {
    if (score >= 75) return { class: 'high', text: 'High Availability' };
    if (score >= 50) return { class: 'medium', text: 'Medium Availability' };
    return { class: 'low', text: 'Low Availability' };
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
        resultsDiv.innerHTML = '<div class="error-message">Please select a blood type.</div>';
        return;
    }
    if (isNaN(userLat) || isNaN(userLng)) {
        resultsDiv.innerHTML = '<div class="error-message">Please provide valid location coordinates.</div>';
        return;
    }

    const donors = JSON.parse(localStorage.getItem('donors')) || [];
    const matchingDonors = donors.filter(d => d.blood_type === bloodType);

    if (matchingDonors.length === 0) {
        resultsDiv.innerHTML = '<div class="info-message">No donors found with this blood type.</div>';
        return;
    }

    // Calculate distances and filter by radius
    const donorsWithDistance = matchingDonors.map(d => ({
        ...d,
        distance: haversineDistance(userLat, userLng, d.latitude, d.longitude),
        availabilityScore: calculateAvailabilityScore(d.last_donation_date, d.donation_count)
    })).filter(d => d.distance <= radius).sort((a, b) => a.distance - b.distance);

    if (donorsWithDistance.length === 0) {
        resultsDiv.innerHTML = `<div class="info-message">No donors found within ${radius} km radius.</div>`;
        return;
    }

    // Display results
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
                    <p><strong>Last Donation:</strong> ${donor.last_donation_date || 'Never'}</p>
                    <span class="badge ${badge.class}">${badge.text} (${donor.availabilityScore}%)</span>
                    <button onclick="notifyDonor(${donor.id})" style="margin-top: 10px;">Send Notification</button>
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

// ============================================
// NOTIFY DONOR
// ============================================
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
    updateNotificationCount();
}

// ============================================
// MEDICINE SEARCH SYSTEM
// ============================================

// Built-in medicine database
const medicineDatabase = [
    { name: 'Aspirin', use: 'Pain relief, fever, heart health', dosage: '500mg', side_effects: 'Stomach upset, bleeding' },
    { name: 'Paracetamol', use: 'Fever, headache, pain relief', dosage: '500mg', side_effects: 'Rare, liver damage if overdose' },
    { name: 'Ibuprofen', use: 'Inflammation, pain, fever', dosage: '200-400mg', side_effects: 'Stomach upset, kidney issues' },
    { name: 'Amoxicillin', use: 'Bacterial infections', dosage: '250-500mg', side_effects: 'Allergic reactions, diarrhea' },
    { name: 'Metformin', use: 'Diabetes management', dosage: '500-1000mg', side_effects: 'Nausea, lactic acidosis' },
    { name: 'Lisinopril', use: 'High blood pressure', dosage: '10-40mg', side_effects: 'Cough, dizziness' },
    { name: 'Atorvastatin', use: 'Cholesterol management', dosage: '10-80mg', side_effects: 'Muscle pain, liver issues' },
    { name: 'Omeprazole', use: 'Acid reflux, GERD', dosage: '20-40mg', side_effects: 'Headache, nausea' },
    { name: 'Cetirizine', use: 'Allergies, itching', dosage: '10mg', side_effects: 'Drowsiness, dry mouth' },
    { name: 'Loratadine', use: 'Allergies, hay fever', dosage: '10mg', side_effects: 'Headache, dry mouth' },
    { name: 'Cough Syrup', use: 'Cough relief', dosage: '5-10ml', side_effects: 'Drowsiness, dizziness' },
    { name: 'Antacid', use: 'Heartburn, indigestion', dosage: '1-2 tablets', side_effects: 'Constipation, diarrhea' },
    { name: 'Vitamin C', use: 'Immune support', dosage: '500-1000mg', side_effects: 'Kidney stones if excess' },
    { name: 'Vitamin D', use: 'Bone health, immunity', dosage: '1000-2000 IU', side_effects: 'Rare toxicity' },
    { name: 'Multivitamin', use: 'General health', dosage: '1 tablet daily', side_effects: 'Nausea if taken empty stomach' },
    { name: 'Insulin', use: 'Diabetes management', dosage: 'Varies', side_effects: 'Hypoglycemia, weight gain' },
    { name: 'Antibacterial Cream', use: 'Wound care', dosage: 'Apply topically', side_effects: 'Allergic reactions' },
    { name: 'Antihistamine', use: 'Allergies, itching', dosage: '25-50mg', side_effects: 'Drowsiness' },
    { name: 'Cough Drops', use: 'Throat soothing', dosage: '1-2 drops', side_effects: 'Rare' },
    { name: 'Antidiarrheal', use: 'Diarrhea relief', dosage: '2mg', side_effects: 'Constipation, dizziness' },
    { name: 'Laxative', use: 'Constipation relief', dosage: 'Varies', side_effects: 'Dehydration, cramping' },
    { name: 'Antacid Gel', use: 'Heartburn', dosage: '15-30ml', side_effects: 'Constipation' },
    { name: 'Antibiotic Ointment', use: 'Skin infections', dosage: 'Apply topically', side_effects: 'Allergic reactions' },
    { name: 'Pain Relief Gel', use: 'Muscle pain', dosage: 'Apply topically', side_effects: 'Skin irritation' },
    { name: 'Cold Medicine', use: 'Cold symptoms', dosage: 'As per label', side_effects: 'Drowsiness, dizziness' },
    { name: 'Flu Medicine', use: 'Flu symptoms', dosage: 'As per label', side_effects: 'Nausea, headache' },
    { name: 'Allergy Medicine', use: 'Allergic reactions', dosage: '10-25mg', side_effects: 'Drowsiness' },
    { name: 'Asthma Inhaler', use: 'Asthma relief', dosage: '1-2 puffs', side_effects: 'Tremor, anxiety' },
    { name: 'Bronchodilator', use: 'Breathing difficulty', dosage: 'As per label', side_effects: 'Tremor, headache' },
    { name: 'Decongestant', use: 'Nasal congestion', dosage: '30-60mg', side_effects: 'Insomnia, anxiety' },
    { name: 'Antiemetic', use: 'Nausea relief', dosage: '25-50mg', side_effects: 'Drowsiness' },
    { name: 'Probiotic', use: 'Gut health', dosage: '1-2 capsules', side_effects: 'Bloating initially' },
    { name: 'Calcium Supplement', use: 'Bone health', dosage: '500-1000mg', side_effects: 'Constipation' },
    { name: 'Iron Supplement', use: 'Anemia treatment', dosage: '325mg', side_effects: 'Constipation, nausea' },
    { name: 'Magnesium', use: 'Muscle relaxation', dosage: '200-400mg', side_effects: 'Diarrhea' },
    { name: 'Zinc Supplement', use: 'Immune support', dosage: '15-30mg', side_effects: 'Nausea, metallic taste' },
    { name: 'B-Complex', use: 'Energy, metabolism', dosage: '1 tablet daily', side_effects: 'Rare' },
    { name: 'Melatonin', use: 'Sleep aid', dosage: '1-5mg', side_effects: 'Headache, dizziness' },
    { name: 'Valerian Root', use: 'Sleep, anxiety', dosage: '400-900mg', side_effects: 'Drowsiness, headache' },
    { name: 'Ginger Supplement', use: 'Nausea, inflammation', dosage: '500-1000mg', side_effects: 'Heartburn' },
    { name: 'Turmeric', use: 'Anti-inflammatory', dosage: '500-1000mg', side_effects: 'Stomach upset' },
    { name: 'Garlic Supplement', use: 'Heart health', dosage: '600-1200mg', side_effects: 'Bad breath, stomach upset' },
    { name: 'Fish Oil', use: 'Heart, brain health', dosage: '1000-3000mg', side_effects: 'Fish burps, bleeding' },
    { name: 'Glucosamine', use: 'Joint health', dosage: '1500mg', side_effects: 'Nausea, diarrhea' },
    { name: 'Chondroitin', use: 'Joint support', dosage: '1200mg', side_effects: 'Nausea, diarrhea' },
    { name: 'Collagen', use: 'Skin, joint health', dosage: '10-20g', side_effects: 'Bloating' },
    { name: 'Biotin', use: 'Hair, skin, nails', dosage: '2.5mg', side_effects: 'Rare' },
    { name: 'Hyaluronic Acid', use: 'Skin hydration', dosage: '50-200mg', side_effects: 'Rare' },
    { name: 'CoQ10', use: 'Heart health', dosage: '100-300mg', side_effects: 'Insomnia, heartburn' },
    { name: 'Resveratrol', use: 'Antioxidant', dosage: '150-500mg', side_effects: 'Rare' },
    { name: 'Quercetin', use: 'Allergy relief', dosage: '500-1000mg', side_effects: 'Headache' },
    { name: 'Spirulina', use: 'Nutrition supplement', dosage: '1-3g', side_effects: 'Nausea, constipation' },
    { name: 'Chlorella', use: 'Detox support', dosage: '3-10g', side_effects: 'Nausea, constipation' },
    { name: 'Wheatgrass', use: 'Nutrition, detox', dosage: '1-3g', side_effects: 'Nausea, appetite loss' }
];

// FUZZY MATCH - Simple fuzzy string matching
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

// MEDICINE SEARCH
function searchMedicine() {
    const query = document.getElementById('medicine-search').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('medicine-results');

    if (!query) {
        resultsDiv.innerHTML = '<div class="info-message">Enter a medicine name or use to search.</div>';
        return;
    }

    // Exact match
    let results = medicineDatabase.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.use.toLowerCase().includes(query)
    );

    // Fuzzy match if no exact match
    if (results.length === 0) {
        results = medicineDatabase.map(m => ({
            ...m,
            score: Math.max(
                fuzzyMatch(query, m.name),
                fuzzyMatch(query, m.use)
            )
        })).filter(m => m.score > 0).sort((a, b) => b.score - a.score);
    }

    if (results.length === 0) {
        resultsDiv.innerHTML = `<div class="info-message">No medicines found for "${query}". Try different keywords.</div>`;
        return;
    }

    let html = `<h3>Found ${results.length} medicine(s)</h3>`;
    results.slice(0, 10).forEach(med => {
        html += `
            <div class="medicine-item">
                <h4>${med.name}</h4>
                <p><strong>Use:</strong> ${med.use}</p>
                <p><strong>Dosage:</strong> ${med.dosage}</p>
                <p><strong>Side Effects:</strong> ${med.side_effects}</p>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

// ONLINE SEARCH (Simulated)
function onlineSearchMedicine() {
    const query = document.getElementById('medicine-search').value.trim();
    const resultsDiv = document.getElementById('medicine-results');

    if (!query) {
        resultsDiv.innerHTML = '<div class="info-message">Enter a medicine name to search online.</div>';
        return;
    }

    resultsDiv.innerHTML = `<div class="info-message">🔍 Online search for "${query}" would use Google API (key embedded but not sent unless explicitly clicked). For privacy, local search is recommended.</div>`;
}

// ============================================
// HEALTH ASSESSMENT TEST
// ============================================
function submitHealthTest(e) {
    e.preventDefault();

    const formData = new FormData(document.getElementById('health-test-form'));
    const answers = Object.fromEntries(formData);

    // Calculate risk score (0-100)
    let score = 0;

    // Age scoring
    if (answers.age === '18-25') score += 10;
    else if (answers.age === '26-40') score += 15;
    else if (answers.age === '41-60') score += 25;
    else if (answers.age === '60+') score += 35;

    // Weight scoring
    if (answers.weight === 'underweight') score += 15;
    else if (answers.weight === 'normal') score += 5;
    else if (answers.weight === 'overweight') score += 20;
    else if (answers.weight === 'obese') score += 30;

    // Symptoms scoring
    if (answers.symptoms === 'none') score += 0;
    else if (answers.symptoms === 'mild') score += 10;
    else if (answers.symptoms === 'moderate') score += 20;
    else if (answers.symptoms === 'severe') score += 30;

    // Fever scoring
    if (answers.fever === 'no') score += 0;
    else if (answers.fever === 'yes-mild') score += 10;
    else if (answers.fever === 'yes-high') score += 20;

    // Cough scoring
    if (answers.cough === 'no') score += 0;
    else if (answers.cough === 'yes-mild') score += 8;
    else if (answers.cough === 'yes-severe') score += 15;

    // Dizziness scoring
    if (answers.dizziness === 'no') score += 0;
    else if (answers.dizziness === 'occasionally') score += 10;
    else if (answers.dizziness === 'frequently') score += 20;

    // Surgery scoring
    if (answers.surgery === 'no') score += 0;
    else if (answers.surgery === 'yes-minor') score += 10;
    else if (answers.surgery === 'yes-major') score += 20;

    // Blood pressure scoring
    if (answers.bp === 'no') score += 0;
    else if (answers.bp === 'yes-controlled') score += 15;
    else if (answers.bp === 'yes-uncontrolled') score += 25;

    // Normalize to 0-100
    score = Math.min(100, score);

    // Determine category
    let category, categoryClass;
    if (score < 30) {
        category = 'Low Risk';
        categoryClass = 'low-risk';
    } else if (score < 60) {
        category = 'Moderate Risk';
        categoryClass = 'moderate-risk';
    } else {
        category = 'High Risk';
        categoryClass = 'high-risk';
    }

    // Generate tips
    let tips = [];
    if (score < 30) {
        tips = [
            'Maintain your current healthy lifestyle',
            'Continue regular exercise (30 mins daily)',
            'Keep a balanced diet rich in fruits and vegetables',
            'Get 7-8 hours of sleep daily',
            'Schedule annual health checkups'
        ];
    } else if (score < 60) {
        tips = [
            'Increase physical activity to 45-60 mins daily',
            'Reduce salt and sugar intake',
            'Monitor weight and aim for healthy BMI',
            'Manage stress through meditation or yoga',
            'Schedule a health checkup within 3 months',
            'Limit alcohol consumption'
        ];
    } else {
        tips = [
            'Consult a healthcare professional immediately',
            'Increase physical activity gradually',
            'Follow a strict diet plan',
            'Monitor vital signs regularly',
            'Take prescribed medications on time',
            'Avoid stress and get adequate rest'
        ];
    }

    // Save test result
    const testResult = {
        id: Date.now(),
        score: score,
        category: category,
        timestamp: new Date().toISOString(),
        answers: answers
    };

    let tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    tests.push(testResult);
    localStorage.setItem('healthTests', JSON.stringify(tests));

    // Display result
    let resultHTML = `
        <div class="result-box">
            <h3>Your Health Assessment Result</h3>
            <div class="score">${score}/100</div>
            <div class="category ${categoryClass}">${category}</div>
            <div class="tips">
                <h4>Recommended Actions:</h4>
                <ul>
                    ${tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    document.getElementById('health-test-result').innerHTML = resultHTML;
    updateTestCount();
}

// ============================================
// CHATBOT - RULE-BASED NLP
// ============================================

// Detect language (simple keyword check)
function detectLanguage(text) {
    const hindiWords = ['aap', 'mera', 'kya', 'hai', 'hain', 'se', 'ko', 'ne', 'ke', 'ka', 'ki'];
    const words = text.toLowerCase().split(' ');
    const hindiCount = words.filter(w => hindiWords.some(hw => w.includes(hw))).length;
    return hindiCount > 0 ? 'hi' : 'en';
}

// Intent detection
function detectIntent(text) {
    text = text.toLowerCase();
    
    if (text.includes('find') && text.includes('donor')) return 'find_donors';
    if (text.includes('medicine') || text.includes('drug') || text.includes('tablet')) return 'medicine';
    if (text.includes('register') || text.includes('sign up')) return 'register';
    if (text.includes('health') && text.includes('tip')) return 'health_tips';
    if (text.includes('blood') && text.includes('group')) return 'blood_groups';
    if (text.includes('eligible') || text.includes('eligibility')) return 'eligibility';
    if (text.includes('test') || text.includes('assessment')) return 'health_test';
    
    return 'general';
}

// Generate bot response
function generateBotResponse(intent, language) {
    const responses = {
        find_donors: {
            en: 'I can help you find blood donors. Please go to the "Find Donors" section and select your blood type and location.',
            hi: 'मैं आपको रक्त दाता खोजने में मदद कर सकता हूं। कृपया "डोनर खोजें" सेक्शन में जाएं और अपने रक्त प्रकार और स्थान का चयन करें।'
        },
        medicine: {
            en: 'I can search for medicines in our database. Go to "Medicine Search" and enter the medicine name or its use.',
            hi: 'मैं हमारे डेटाबेस में दवाएं खोज सकता हूं। "मेडिसिन सर्च" पर जाएं और दवा का नाम या उपयोग दर्ज करें।'
        },
        register: {
            en: 'To register as a blood donor, go to "Register Donor" section and fill in your details including blood type and location.',
            hi: 'रक्त दाता के रूप में पंजीकरण करने के लिए, "डोनर रजिस्टर करें" सेक्शन पर जाएं और अपने विवरण भरें।'
        },
        health_tips: {
            en: 'Here are some health tips: 1) Exercise 30 mins daily 2) Eat balanced diet 3) Drink 8 glasses of water 4) Get 7-8 hours sleep 5) Manage stress',
            hi: 'यहाँ कुछ स्वास्थ्य सुझाव हैं: 1) रोज 30 मिनट व्यायाम करें 2) संतुलित आहार खाएं 3) 8 गिलास पानी पिएं 4) 7-8 घंटे की नींद लें'
        },
        blood_groups: {
            en: 'Blood groups: O+ (Universal donor), O-, A+, A-, B+, B-, AB+ (Universal recipient), AB-. Each has unique compatibility.',
            hi: 'रक्त समूह: O+ (सार्वभौमिक दाता), O-, A+, A-, B+, B-, AB+ (सार्वभौमिक प्राप्तकर्ता), AB-। प्रत्येक की अनोखी अनुकूलता है।'
        },
        eligibility: {
            en: 'Donor eligibility: Age 18-65, weight >50kg, hemoglobin >12.5g/dL, no infections, 56 days since last donation.',
            hi: 'दाता पात्रता: आयु 18-65, वजन >50kg, हीमोग्लोबिन >12.5g/dL, कोई संक्रमण नहीं, पिछले दान के बाद 56 दिन।'
        },
        health_test: {
            en: 'Take our health assessment test to get a personalized risk score. Go to "Health Test" section.',
            hi: 'अपने स्वास्थ्य का आकलन करने के लिए हमारी परीक्षा लें। "स्वास्थ्य परीक्षण" सेक्शन पर जाएं।'
        },
        general: {
            en: 'I can help you with blood donation, medicine search, health tips, and health assessment. What would you like to know?',
            hi: 'मैं आपको रक्त दान, दवा खोज, स्वास्थ्य सुझाव और स्वास्थ्य मूल्यांकन में मदद कर सकता हूं। आप क्या जानना चाहते हैं?'
        }
    };

    return responses[intent][language] || responses.general[language];
}

// Send chat message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Display user message
    const messagesDiv = document.getElementById('chat-messages');
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    messagesDiv.appendChild(userMsg);

    // Detect language and intent
    const language = detectLanguage(message);
    const intent = detectIntent(message);

    // Generate bot response
    const botResponse = generateBotResponse(intent, language);

    // Display bot message
    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerHTML = `<strong>Assistant:</strong> ${botResponse}`;
    messagesDiv.appendChild(botMsg);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Clear input
    input.value = '';
}

// Voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech Recognition not supported in this browser.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
        document.getElementById('voice-btn').textContent = '🎤 Listening...';
    };

    recognition.onend = () => {
        document.getElementById('voice-btn').textContent = '🎤 Speak';
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        document.getElementById('chat-input').value = transcript;
    };

    recognition.start();
}

// Quick chat action
function quickChatAction(action) {
    document.getElementById('chat-input').value = action;
    sendChatMessage();
}
