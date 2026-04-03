// ============================================
// CHATBOT PAGE FUNCTIONALITY
// ============================================

let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
    setupChatbot();
});

function setupChatbot() {
    document.getElementById('send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('voice-btn').addEventListener('click', startVoiceInput);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('clear-chat').addEventListener('click', clearChat);
}

// ============================================
// CHAT MESSAGE HANDLING
// ============================================

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Display user message
    displayMessage(message, 'user');

    // Detect language and intent
    const language = detectLanguage(message);
    const intent = detectIntent(message);

    // Generate bot response
    const botResponse = generateBotResponse(intent, language);

    // Display bot message
    setTimeout(() => {
        displayMessage(botResponse, 'bot');
    }, 500);

    // Clear input
    input.value = '';
}

function displayMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    const name = sender === 'user' ? 'You' : 'Assistant';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <strong>${name}:</strong> ${text}
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ============================================
// INTENT DETECTION
// ============================================

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

// ============================================
// RESPONSE GENERATION
// ============================================

function generateBotResponse(intent, language) {
    const responses = {
        find_donors: {
            en: 'I can help you find blood donors. Go to the "Blood Donors" section and select your blood type and location to search for available donors near you.',
            hi: 'मैं आपको रक्त दाता खोजने में मदद कर सकता हूं। "रक्त दाता" सेक्शन पर जाएं और अपने रक्त प्रकार और स्थान का चयन करें।'
        },
        medicine: {
            en: 'I can search for medicines in our database. Go to "Medicine Search" and enter the medicine name, use, or symptom. We have 50+ medicines available.',
            hi: 'मैं हमारे डेटाबेस में दवाएं खोज सकता हूं। "मेडिसिन सर्च" पर जाएं और दवा का नाम या उपयोग दर्ज करें।'
        },
        register: {
            en: 'To register as a blood donor, go to "Blood Donors" section and fill in your details including blood type and location. Your information helps save lives!',
            hi: 'रक्त दाता के रूप में पंजीकरण करने के लिए, "रक्त दाता" सेक्शन पर जाएं और अपने विवरण भरें।'
        },
        health_tips: {
            en: 'Here are some health tips: 1) Exercise 30 mins daily 2) Eat balanced diet 3) Drink 8 glasses of water 4) Get 7-8 hours sleep 5) Manage stress 6) Regular checkups',
            hi: 'यहाँ कुछ स्वास्थ्य सुझाव हैं: 1) रोज 30 मिनट व्यायाम करें 2) संतुलित आहार खाएं 3) 8 गिलास पानी पिएं 4) 7-8 घंटे की नींद लें'
        },
        blood_groups: {
            en: 'Blood groups: O+ (Universal donor), O-, A+, A-, B+, B-, AB+ (Universal recipient), AB-. Each has unique compatibility for transfusions.',
            hi: 'रक्त समूह: O+ (सार्वभौमिक दाता), O-, A+, A-, B+, B-, AB+ (सार्वभौमिक प्राप्तकर्ता), AB-।'
        },
        eligibility: {
            en: 'Donor eligibility: Age 18-65, weight >50kg, hemoglobin >12.5g/dL, no infections, 56 days since last donation, good health.',
            hi: 'दाता पात्रता: आयु 18-65, वजन >50kg, हीमोग्लोबिन >12.5g/dL, कोई संक्रमण नहीं, पिछले दान के बाद 56 दिन।'
        },
        health_test: {
            en: 'Take our health assessment test to get a personalized risk score. Go to "Health Test" section and answer 8 quick questions. Takes about 5 minutes!',
            hi: 'अपने स्वास्थ्य का आकलन करने के लिए हमारी परीक्षा लें। "स्वास्थ्य परीक्षण" सेक्शन पर जाएं।'
        },
        general: {
            en: 'I can help you with blood donation, medicine search, health tips, and health assessment. What would you like to know?',
            hi: 'मैं आपको रक्त दान, दवा खोज, स्वास्थ्य सुझाव और स्वास्थ्य मूल्यांकन में मदद कर सकता हूं। आप क्या जानना चाहते हैं?'
        }
    };

    return responses[intent][language] || responses.general[language];
}

// ============================================
// VOICE INPUT
// ============================================

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech Recognition not supported in this browser.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');

    recognition.onstart = () => {
        voiceBtn.textContent = '🎤 Listening...';
        voiceStatus.textContent = 'Listening...';
    };

    recognition.onend = () => {
        voiceBtn.textContent = '🎤 Speak';
        voiceStatus.textContent = '';
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        document.getElementById('chat-input').value = transcript;
        voiceStatus.textContent = `Recognized: "${transcript}"`;
    };

    recognition.onerror = (event) => {
        voiceStatus.textContent = `Error: ${event.error}`;
    };

    recognition.start();
}

// ============================================
// QUICK ACTIONS
// ============================================

function quickAction(action) {
    document.getElementById('chat-input').value = action;
    sendChatMessage();
}

// ============================================
// LANGUAGE TOGGLE
// ============================================

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    const btn = document.getElementById('language-toggle');
    btn.textContent = currentLanguage === 'en' ? '🌐 EN' : '🌐 HI';
}

// ============================================
// CLEAR CHAT
// ============================================

function clearChat() {
    if (confirm('Clear all messages?')) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>Hello! I'm your HealthHub AI Assistant. How can I help you today?</p>
                </div>
            </div>
        `;
    }
}
