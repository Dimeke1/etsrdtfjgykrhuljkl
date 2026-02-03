import { db, auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    const errorMessage = document.getElementById('error-message');

    let currentUser = null;

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadChatHistory();
        } else {
            currentUser = null;
            chatHistory.innerHTML = '';
        }
    });

    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    sendBtn.addEventListener('click', handleSend);

    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        errorMessage.classList.add('hidden');
        userInput.value = '';
        userInput.style.height = 'auto';

        appendMessage('user', text);
        const typingId = showTypingIndicator();

        try {
            await new Promise(r => setTimeout(r, 1200));
            const analysis = simulateAnalysis(text);

            removeTypingIndicator(typingId);
            appendMessage('ai', analysis.message, analysis.risk);

            if (currentUser && db) {
                saveToFirebase(text, analysis);
            }

        } catch (error) {
            console.error("Analysis failed:", error);
            removeTypingIndicator(typingId);
            appendMessage('ai', window.t('error_generic'), 'medium');
        }
    }

    /* 
     * ENHANCED SIMULATED AI LOGIC 
     * Categorizes scams into: Phishing, Investment, Emergency, Suspicious, Safe
     */
    function simulateAnalysis(text) {
        const lowerText = text.toLowerCase();

        // 1. Phishing Keywords (Links, Passwords, Cards)
        const phishingKeywords = [
            'http', 'www', '.com', '.ru', '.kz', 'link', 'click', 'password', 'login', 'verify',
            'ссылка', 'перейди', 'пароль', 'вход', 'подтверди', 'карта', 'cvv', 'срок действия',
            'сілтеме', 'бас', 'құпия сөз', 'кіру', 'растау', 'картасы', 'ссылка', 'перейди', 'нажми', 'подтвердить', 'аккаунт', 'пароль', 'логин', 'вход', 'проверь', 'обнови данные',
  'твоя карта', 'cvv', 'срок действия', 'код подтверждения', 'двухфакторная', 'счёт заблокирован', 'письмо от банка',
  'письмо от госуслуг', 'письмо от налоговой', 'письмо от почты', 'письмо от мвд', 'письмо от соцзащиты',
  'wildberries', 'ozon', 'авито', 'сбербанк онлайн', 'тинькофф', 'альфа-банк', 'фрисби', 'халык банк',
  

  'сілтеме', 'бас', 'батырманы бас', 'растау', 'аккаунт', 'құпия сөз', 'кіру', 'пароль', 'мәліметтеріңізді жаңартыңыз',
  'картаңыз', 'cvv', 'мерзімі', 'растайтын код', 'екі факторлы', 'есеп шоты блокталды', 'банк хабарламасы',
  'мемлекеттік қызметтер', 'салық инспекциясы', 'пошта', 'полиция', 'әлеуметтік қорғау', 'wildberries', 'ozon',
  'avito', 'халық банкі', 'альфа-банк', 'фрисби'

        ];

        // 2. Investment Keywords (Crypto, Easy Money, Profit)
        const investmentKeywords = [
            'crypto', 'bitcoin', 'invest', 'profit', 'earnings', 'bonus', 'rich',
            'крипто', 'биткоин', 'инвестиции', 'доход', 'заработок', 'бонус', 'прибыль', 'пирамида',
            'инвестиция', 'табыс', 'ақша табу', 'пайда', 'акция',
  'крипта', 'биткоин', 'эфириум', 'догикоин', 'инвестируй', 'удвой деньги', 'гарантированная прибыль',
  'пассивный доход', 'финансовая свобода', 'заработай', 'без риска', 'ограниченное предложение',
  'форекс', 'бинарные опционы', 'майнинг', 'эирдроп', 'nft', 'быстро разбогатеть', 'пирамида', 'mlm',
  'прибыль за 24 часа', 'вывод заблокирован', 'деньги не выводятся',
  
  // Қазақша
  'крипто', 'биткойн', 'эфир', 'инвестиция', 'ақшаңды екі есе көбейт', 'кепілді пайда', 'пассив табыс',
  'қаржылық бостандық', 'ақша тап', 'қауіпсіз', 'шектеулі ұсыныс', 'форекс', 'бинарлық опциондар',
  'майнинг', 'эирдроп', 'nft', 'тез байлану', 'пирамида', 'mlm', '24 сағатта пайда', 'шығару блокталды',
  'ақша шықпайды'
];

        // 3. Emergency/Social Engineering Keywords (Urgent, Accident, Police, Mom/Dad)
        const emergencyKeywords = [
            'urgent', 'accident', 'help', 'money', 'police', 'mom', 'dad', 'arrest',
            'срочно', 'помоги', 'деньги', 'беда', 'полиция', 'мама', 'папа', 'дтп', 'больница',
            'шұғыл', 'көмек', 'ақша', 'полиция', 'апат', 'аурухана', 'ана', 'әке',
  // Русский
  'срочно', 'экстренно', 'авария', 'дтп', 'больница', 'арестовали', 'полиция', 'суд', 'штраф', 'залог',
  'мама', 'папа', 'сын', 'дочь', 'бабушка', 'помоги', 'скинь деньги', 'у меня проблемы', 'похитили',
  'выкуп', 'сидят', 'срочно нужны деньги', 'потерял телефон', 'не могу говорить', 'звонят с незнакомого',
  
  // Қазақша
  'шұғыл', 'апат', 'авария', 'аурухана', 'қамауға алды', 'полиция', ' сот', 'айыппұл', 'кауел', 'ана', 'әке',
  'ұл', 'қыз', 'әже', 'көмек керек', 'ақша жібер', 'менің қиындығым бар', 'ұрлады', 'құтқару ақысы',
  'отырмын', 'ақша шұғыл керек', 'телефоным жоғалды', 'сөйлей алмаймын', 'танымайтын нөмірден қоңырау'
];
       

        let category = 'safe';
        let risk = 'low';

        // Detection Logic (Priority: Phishing > Investment > Emergency)
        if (phishingKeywords.some(w => lowerText.includes(w))) {
            category = 'phishing';
            risk = 'high';
        } else if (investmentKeywords.some(w => lowerText.includes(w))) {
            category = 'investment';
            risk = 'high';
        } else if (emergencyKeywords.some(w => lowerText.includes(w))) {
            category = 'emergency';
            risk = 'high';
        } else if (text.length < 5) {
            // Too short to judge, but likely just chatting
            category = 'safe';
            risk = 'low';
        } else {
            // General heuristics for "Suspicious" if no specific category but still weird?
            // For now, default to safe if no keywords, or maybe add a "suspicious" catch-all if needed.
            // Let's add a small catch-all for unknown contexts that might be medium risk if they ask for something.
            if (lowerText.includes('?')) {
                // Questions might be suspicious? stick to safe for now to avoid false positives.
            }
        }

        // Construct Message
        const header = window.t(`risk_${risk}`);
        const advice = window.t(`advice_${category}`) || window.t('advice_safe');

        return {
            risk: risk,
            category: category,
            message: `${header}\n\n${advice}`
        };
    }

    function appendMessage(sender, text, riskLevel = 'low') {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'user' ? 'message-user' : 'message-ai');

        if (sender === 'ai' && riskLevel) {
            div.classList.add(`risk-border-${riskLevel}`);
        }

        div.innerHTML = text.replace(/\n/g, '<br>');

        chatHistory.appendChild(div);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.classList.add('message', 'message-ai', 'typing-indicator');
        div.innerHTML = '<span></span><span></span><span></span>';
        chatHistory.appendChild(div);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function saveToFirebase(text, analysis) {
        try {
            const batch = db.batch();
            const messagesRef = db.collection('chats').doc(currentUser.uid).collection('messages');

            const userMsgRef = messagesRef.doc();
            batch.set(userMsgRef, {
                sender: 'user',
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            const aiMsgRef = messagesRef.doc();
            batch.set(aiMsgRef, {
                sender: 'ai',
                text: analysis.message,
                risk: analysis.risk,
                category: analysis.category, // Save category too for analytics if needed
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            await batch.commit();

        } catch (e) {
            // console.warn("Could not save to Firebase");
        }
    }

    function loadChatHistory() {
        if (!db || !currentUser) return;

        db.collection('chats').doc(currentUser.uid).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                chatHistory.innerHTML = '';

                if (snapshot.empty) {
                    const greeting = window.t('greeting');
                    appendMessage('ai', greeting);
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    appendMessage(data.sender, data.text, data.risk);
                });
            }, error => {
                console.error("Error loading chat:", error);
            });
    }
});
