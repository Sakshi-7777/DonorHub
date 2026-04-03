// ============================================
// MEDICINES PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupEventListeners();
    loadFavorites();
    loadSearchHistory();
});

function setupEventListeners() {
    document.getElementById('search-medicine-btn').addEventListener('click', searchMedicine);
    document.getElementById('online-search-btn').addEventListener('click', onlineSearchMedicine);
    document.getElementById('medicine-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchMedicine();
    });
}

// ============================================
// MEDICINE SEARCH
// ============================================

function searchMedicine() {
    const query = document.getElementById('medicine-search').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('medicine-results');

    if (!query) {
        resultsDiv.innerHTML = '<div class="info-message">Enter a medicine name or use to search.</div>';
        return;
    }

    // Add to search history
    addToSearchHistory(query);

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

    displayMedicineResults(results.slice(0, 10), resultsDiv);
}

function displayMedicineResults(medicines, container) {
    let html = `<h3>Found ${medicines.length} medicine(s)</h3>`;
    const favorites = JSON.parse(localStorage.getItem('medicines-favorites')) || [];
    
    medicines.forEach(med => {
        const isFavorite = favorites.some(f => f.name === med.name);
        html += `
            <div class="medicine-item">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4>${med.name}</h4>
                        <p><strong>Use:</strong> ${med.use}</p>
                        <p><strong>Dosage:</strong> ${med.dosage}</p>
                        <p><strong>Side Effects:</strong> ${med.side_effects}</p>
                    </div>
                    <button onclick="toggleFavorite('${med.name}')" class="btn-icon" title="Add to favorites">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// FAVORITES
// ============================================

function toggleFavorite(medicineName) {
    let favorites = JSON.parse(localStorage.getItem('medicines-favorites')) || [];
    const medicine = medicineDatabase.find(m => m.name === medicineName);
    
    const index = favorites.findIndex(f => f.name === medicineName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(medicine);
    }
    
    localStorage.setItem('medicines-favorites', JSON.stringify(favorites));
    
    // Refresh current view
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab.id === 'search-tab') {
        searchMedicine();
    } else if (activeTab.id === 'favorites-tab') {
        loadFavorites();
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('medicines-favorites')) || [];
    const container = document.getElementById('favorites-list');
    
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="info-message">No favorite medicines yet. Add some from search results!</div>';
        return;
    }

    displayMedicineResults(favorites, container);
}

// ============================================
// SEARCH HISTORY
// ============================================

function addToSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem('search-history')) || [];
    
    // Remove if already exists
    history = history.filter(h => h !== query);
    
    // Add to beginning
    history.unshift(query);
    
    // Keep only last 20
    history = history.slice(0, 20);
    
    localStorage.setItem('search-history', JSON.stringify(history));
}

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('search-history')) || [];
    const container = document.getElementById('history-list');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<div class="info-message">No search history yet.</div>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    history.forEach((item, idx) => {
        html += `
            <div class="history-item">
                <span onclick="document.getElementById('medicine-search').value='${item}'; searchMedicine();" style="cursor: pointer; color: var(--primary); font-weight: 600;">
                    🔍 ${item}
                </span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// ============================================
// CATEGORIES
// ============================================

function filterByCategory(category) {
    const results = medicineDatabase.filter(m => m.category === category);
    const container = document.getElementById('category-results');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="info-message">No medicines in this category.</div>';
        return;
    }

    displayMedicineResults(results, container);
}

function searchMedicineByTag(tag) {
    document.getElementById('medicine-search').value = tag;
    searchMedicine();
}

// ============================================
// ONLINE SEARCH
// ============================================

function onlineSearchMedicine() {
    const query = document.getElementById('medicine-search').value.trim();
    const resultsDiv = document.getElementById('medicine-results');

    if (!query) {
        resultsDiv.innerHTML = '<div class="info-message">Enter a medicine name to search online.</div>';
        return;
    }

    resultsDiv.innerHTML = `<div class="info-message">🔍 Online search for "${query}" would use Google API. For privacy, local search is recommended. Your data stays on your device.</div>`;
}
