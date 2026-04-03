// ============================================
// HEALTH TEST PAGE FUNCTIONALITY
// ============================================

let currentQuestion = 1;
const totalQuestions = 8;

document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupTestNavigation();
    loadTestResults();
});

function setupTestNavigation() {
    document.getElementById('health-test-form').addEventListener('submit', submitHealthTest);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    
    showQuestion(1);
}

// ============================================
// TEST NAVIGATION
// ============================================

function showQuestion(questionNum) {
    const questions = document.querySelectorAll('.test-question');
    questions.forEach(q => q.classList.remove('active'));
    
    const targetQuestion = document.querySelector(`[data-question="${questionNum}"]`);
    if (targetQuestion) {
        targetQuestion.classList.add('active');
    }

    currentQuestion = questionNum;
    updateProgress();
    updateButtons();
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        showQuestion(currentQuestion + 1);
    }
}

function prevQuestion() {
    if (currentQuestion > 1) {
        showQuestion(currentQuestion - 1);
    }
}

function updateProgress() {
    const percentage = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = `Question ${currentQuestion} of ${totalQuestions}`;
}

function updateButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    prevBtn.style.display = currentQuestion > 1 ? 'block' : 'none';
    nextBtn.style.display = currentQuestion < totalQuestions ? 'block' : 'none';
    submitBtn.style.display = currentQuestion === totalQuestions ? 'block' : 'none';
}

// ============================================
// TEST SUBMISSION
// ============================================

function submitHealthTest(e) {
    e.preventDefault();

    const formData = new FormData(document.getElementById('health-test-form'));
    const answers = Object.fromEntries(formData);

    // Validate all answers
    if (Object.keys(answers).length < totalQuestions) {
        alert('Please answer all questions');
        return;
    }

    // Calculate risk score
    let score = calculateHealthScore(answers);

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

    // Generate recommendations
    const recommendations = generateRecommendations(score, answers);

    // Save test result
    const testResult = {
        id: Date.now(),
        score: score,
        category: category,
        timestamp: new Date().toISOString(),
        answers: answers,
        recommendations: recommendations
    };

    let tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    tests.push(testResult);
    localStorage.setItem('healthTests', JSON.stringify(tests));

    // Display result
    displayTestResult(testResult);
    updateDashboardStats();
}

function calculateHealthScore(answers) {
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

    return Math.min(100, score);
}

function generateRecommendations(score, answers) {
    const recommendations = [];

    if (score < 30) {
        recommendations.push('✅ Maintain your current healthy lifestyle');
        recommendations.push('✅ Continue regular exercise (30 mins daily)');
        recommendations.push('✅ Keep a balanced diet');
        recommendations.push('✅ Get 7-8 hours of sleep daily');
        recommendations.push('✅ Schedule annual health checkups');
    } else if (score < 60) {
        recommendations.push('⚠️ Increase physical activity to 45-60 mins daily');
        recommendations.push('⚠️ Reduce salt and sugar intake');
        recommendations.push('⚠️ Monitor weight and aim for healthy BMI');
        recommendations.push('⚠️ Manage stress through meditation or yoga');
        recommendations.push('⚠️ Schedule a health checkup within 3 months');
    } else {
        recommendations.push('🚨 Consult a healthcare professional immediately');
        recommendations.push('🚨 Increase physical activity gradually');
        recommendations.push('🚨 Follow a strict diet plan');
        recommendations.push('🚨 Monitor vital signs regularly');
        recommendations.push('🚨 Take prescribed medications on time');
    }

    return recommendations;
}

function displayTestResult(result) {
    const container = document.getElementById('results-container');
    
    const categoryEmoji = result.category === 'Low Risk' ? '✅' : 
                         result.category === 'Moderate Risk' ? '⚠️' : '🚨';

    let html = `
        <div class="result-box">
            <h3>Your Health Assessment Result</h3>
            <div class="score">${result.score}/100</div>
            <div class="category ${result.category.toLowerCase().replace(' ', '-')}">
                ${categoryEmoji} ${result.category}
            </div>
            <div class="tips">
                <h4>Recommended Actions:</h4>
                <ul>
                    ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-size: 0.9em;">
                Test completed: ${formatDate(result.timestamp)}
            </p>
        </div>
    `;

    container.innerHTML = html;
    
    // Switch to results tab
    switchTab('results');
}

function loadTestResults() {
    const tests = JSON.parse(localStorage.getItem('healthTests')) || [];
    const container = document.getElementById('results-container');
    
    if (!container) return;
    
    if (tests.length === 0) {
        container.innerHTML = '<div class="info-message">No test results yet. Take a test to get started!</div>';
        return;
    }

    // Show latest result
    const latestTest = tests[tests.length - 1];
    displayTestResult(latestTest);

    // Show tracking chart
    loadTrackingChart(tests);
}

function loadTrackingChart(tests) {
    const container = document.getElementById('tracking-chart');
    if (!container) return;

    let html = '<h3>Your Health Score Over Time</h3>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">';
    
    tests.slice(-10).forEach((test, idx) => {
        const categoryColor = test.category === 'Low Risk' ? '#4caf50' : 
                             test.category === 'Moderate Risk' ? '#ffc107' : '#f44336';
        
        html += `
            <div style="background: var(--bg-hover); padding: 15px; border-radius: 8px; border-left: 4px solid ${categoryColor};">
                <p style="color: var(--text-secondary); font-size: 0.9em;">${formatDate(test.timestamp)}</p>
                <h4 style="color: ${categoryColor}; font-size: 1.5em; margin: 10px 0;">${test.score}/100</h4>
                <p style="color: var(--text-secondary);">${test.category}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}
