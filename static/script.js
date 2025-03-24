const synthesis = window.speechSynthesis;
let selectedLang = 'en';
let selectedMode = '';
let isTyping = false;

function toggleChat() {
    const chatbox = document.getElementById("chatbox");
    chatbox.style.display = (chatbox.style.display === "none" || chatbox.style.display === "") ? "flex" : "none";
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function resetToLanguageSelection() {
    $("#messages").html(`
        <div class="message bot">
            Hi! I’m here to assist you.<br>
            Choose a language:<br>
            <span class="lang-option" onclick="selectLanguage('en')">English</span>
            <span class="lang-option" onclick="selectLanguage('hi')">हिन्दी</span>
            <span class="lang-option" onclick="selectLanguage('sa')">संस्कृतम्</span>
            <span class="lang-option" onclick="selectLanguage('bho')">भोजपुरी</span>
            <span class="lang-option" onclick="selectLanguage('ur')">اردو</span>
            <span class="more-option" onclick="showMoreLanguages()">More...</span>
        </div>
    `);
    selectedLang = 'en';
}

function showMoreLanguages() {
    $("#messages").html(`
        <div class="message bot">
            Select a language:<br>
            <span class="lang-option" onclick="selectLanguage('en')">English</span>
            <span class="lang-option" onclick="selectLanguage('hi')">हिन्दी</span>
            <span class="lang-option" onclick="selectLanguage('ur')">اردو</span>
            <span class="lang-option" onclick="selectLanguage('sa')">संस्कृतम्</span>
            <span class="lang-option" onclick="selectLanguage('bho')">भोजपुरी</span>
            <span class="lang-option" onclick="selectLanguage('es')">Español</span>
            <span class="lang-option" onclick="selectLanguage('fr')">Français</span>
            <span class="lang-option" onclick="selectLanguage('de')">Deutsch</span>
            <span class="lang-option" onclick="selectLanguage('ja')">日本語</span>
        </div>
    `);
}

function selectLanguage(lang) {
    selectedLang = lang;
    $("#messages").empty();

    const welcomeMessages = {
        'en': 'Language selected! Please choose an option:',
        'hi': 'भाषा चयनित हुई! कृपया एक विकल्प चुनें:',
        'ur': 'زبان منتخب ہوگئی! براہ کرم ایک اختیار منتخب کریں:',
        'sa': 'भाषा संनादति! कृपया एकं विकल्पं चिनोतु:',
        'es': '¡Idioma seleccionado! Por favor, elige una opción:',
        'fr': 'Langue sélectionnée ! Veuillez choisir une option :',
        'de': 'Sprache ausgewählt! Bitte wählen Sie eine Option:',
        'ja': '言語が選択されました！オプションを選んでください：',
        'bho': 'भाषा चुनल गइल! कृपया एकटा विकल्प चुनs:'
    };

    const welcomeMessage = welcomeMessages[lang] || 'Language selected! Please choose an option:';
    const time = getCurrentTime();
    $("#messages").append(`
        <div class='message bot'>
            ${welcomeMessage}<br>
            <span class="mode-option" onclick="selectMode('chat')">Chat</span>
            <span class="mode-option" onclick="selectMode('faq')">FAQ</span>
            <span class="mode-option" onclick="selectMode('form')">Submit Form</span>
            <span class='timestamp'>${time}</span>
        </div>
    `);
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    speak(welcomeMessage);
}

function selectMode(mode) {
    selectedMode = mode;
    $("#messages").empty();
    const time = getCurrentTime();

    const modeMessages = {
        'chat': {
            'en': 'Chat mode activated! How can I assist you?',
            'hi': 'चैट मोड सक्रिय! मैं आपकी कैसे मदद कर सकता हूँ?',
            'ur': 'چیٹ موڈ فعال! میں آپ کی کس طرح مدد کر سکتا ہوں؟',
            'sa': 'संनादन मोडः सक्रियति! कथं भवतः सहायामि?',
            'es': '¡Modo de chat activado! ¿Cómo puedo ayudarte?',
            'fr': 'Mode chat activé ! Comment puis-je vous aider ?',
            'de': 'Chat-Modus aktiviert! Wie kann ich Ihnen helfen?',
            'ja': 'チャットモードが有効になりました！どのようにお手伝いしましょうか？',
            'bho': 'चैट मोड चालू भइल! हम का मदद कर सकीला?'
        },
        'faq': {
            'en': 'FAQ mode activated! Select a question:',
            'hi': 'FAQ मोड सक्रिय! एक प्रश्न चुनें:',
            'ur': 'FAQ موڈ فعال! ایک سوال منتخب کریں:',
            'sa': 'FAQ मोडः सक्रियति! एकं प्रश्नं चिनोतु:',
            'es': '¡Modo FAQ activado! Selecciona una pregunta:',
            'fr': 'Mode FAQ activé ! Sélectionnez une question :',
            'de': 'FAQ-Modus aktiviert! Wählen Sie eine Frage:',
            'ja': 'FAQモードが有効になりました！質問を選んでください：',
            'bho': 'FAQ मोड चालू भइल! एकटा सवाल चुनs:'
        },
        'form': {
            'en': 'Form submission mode activated! Please fill out the details below:',
            'hi': 'फॉर्म जमा करने का मोड सक्रिय! कृपया नीचे विवरण भरें:',
            'ur': 'فارم جمع کرانے کا موڈ فعال! براہ کرم نیچے دیے گئے تفصیلات بھریں:',
            'sa': 'प्रपत्रजमा मोडः सक्रियति! कृपया अधः विवरणं पूरयतु:',
            'es': '¡Modo de envío de formulario activado! Por favor, completa los detalles a continuación:',
            'fr': 'Mode de soumission de formulaire activé ! Veuillez remplir les détails ci-dessous :',
            'de': 'Formularübermittlungsmodus aktiviert! Bitte füllen Sie die Details unten aus:',
            'ja': 'フォーム送信モードが有効になりました！以下に詳細を記入してください：',
            'bho': 'फॉर्म जमा करे वाला मोड चालू भइल! कृपया नीचे विवरण भरीं:'
        }
    };

    const modeMessage = modeMessages[mode][selectedLang] || modeMessages[mode]['en'];

    if (mode === 'faq') {
        $("#messages").append(`
            <div class='message bot' id='faqInitial'>
                ${modeMessage}<br>
                <span class="faq-option" onclick="selectFAQ('q1')">What is cybersecurity?</span>
                <span class="faq-option" onclick="selectFAQ('q2')">How to protect my data?</span>
                <span class="faq-option" onclick="selectFAQ('q3')">What to do if hacked?</span>
                <span class="more-option" onclick="showMoreFAQs('faqInitial')">More...</span>
                <span class='timestamp'>${time}</span>
            </div>
        `);
        $("#user_input").prop('disabled', true);
    } else if (mode === 'form') {
        $("#messages").append(`
            <div class='message bot'>
                ${modeMessage}
                <div class="form-container">
                    <input type="text" id="formName" placeholder="Name">
                    <input type="email" id="formEmail" placeholder="Email">
                    <textarea id="formMessage" placeholder="Message" rows="3"></textarea>
                    <button onclick="submitForm()">Submit</button>
                </div>
                <span class='timestamp'>${time}</span>
            </div>
        `);
        $("#user_input").prop('disabled', true);
    } else {
        $("#messages").append(`
            <div class='message bot'>
                ${modeMessage}
                <span class='timestamp'>${time}</span>
            </div>
        `);
        $("#user_input").prop('disabled', false);
    }
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    speak(modeMessage);
}

function showMoreFAQs(divId) {
    const faqDiv = document.getElementById(divId);
    if (!faqDiv) return;

    // Slide out current content
    faqDiv.classList.add('slide-out');
    setTimeout(() => {
        // Replace content with new FAQ options
        faqDiv.innerHTML = `
            <br>Select another question:<br>
            <span class="faq-option" onclick="selectFAQ('q4')">What is phishing?</span>
            <span class="faq-option" onclick="selectFAQ('q5')">How to recognize malware?</span>
            <span class="faq-option" onclick="selectFAQ('q6')">What is encryption?</span>
            <span class='timestamp'>${getCurrentTime()}</span>
        `;
        faqDiv.classList.remove('slide-out');
        faqDiv.classList.add('slide-in');
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    }, 300); // Match animation duration
}

function typeAnswer(text, elementId, callback) {
    let index = 0;
    const speed = 30;

    function type() {
        if (index < text.length) {
            document.getElementById(elementId).innerText = text.substring(0, index + 1);
            index++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

function selectFAQ(questionId) {
    if (isTyping) return;
    isTyping = true;

    const faqAnswers = {
        'q1': {
            'en': 'Cybersecurity is the practice of protecting systems, networks, and data from digital attacks.',
            'hi': 'साइबर सुरक्षा सिस्टम, नेटवर्क और डेटा को डिजिटल हमलों से बचाने की प्रक्रिया है।',
            'ur': 'سائبر سیکیورٹی سسٹمز، نیٹ ورکس اور ڈیٹا کو ڈیجیٹل حملوں سے بچانے کا عمل ہے۔',
            'sa': 'साइबरसुरक्षा संनादं, संजालं च डेटा डिजिटलआक्रमणेभ्यः संरक्षणस्य प्रक्रिया अस्ति।',
            'es': 'La ciberseguridad es la práctica de proteger sistemas, redes y datos de ataques digitales.',
            'fr': 'La cybersécurité est la pratique de protéger les systèmes, réseaux et données contre les attaques numériques.',
            'de': 'Cybersicherheit ist die Praxis, Systeme, Netzwerke und Daten vor digitalen Angriffen zu schützen.',
            'ja': 'サイバーセキュリティは、システム、ネットワーク、データをデジタル攻撃から保護する実践です。',
            'bho': 'साइबर सुरक्षा सिस्टम, नेटवर्क आ डेटा के डिजिटल हमला से बचावे के प्रक्रिया हs।'
        },
        'q2': {
            'en': 'To protect your data: use strong passwords, enable 2FA, and keep software updated.',
            'hi': 'अपने डेटा की सुरक्षा के लिए: मजबूत पासवर्ड का उपयोग करें, 2FA चालू करें, और सॉफ्टवेयर अपडेट रखें।',
            'ur': 'اپنے ڈیٹا کی حفاظت کے لیے: مضبوط پاس ورڈ استعمال کریں، 2FA فعال کریں، اور سافٹ ویئر اپ ڈیٹ رکھیں۔',
            'sa': 'स्व डेटा संरक्षणाय: दृढं कूटशब्दं प्रयोगतु, 2FA सक्रियतु, संनादपत्रं च नवीकृतं रक्षतु।',
            'es': 'Para proteger tus datos: usa contraseñas fuertes, habilita 2FA y mantén el software actualizado.',
            'fr': 'Pour protéger vos données : utilisez des mots de passe forts, activez la 2FA et gardez les logiciels à jour.',
            'de': 'Um Ihre Daten zu schützen: Verwenden Sie starke Passwörter, aktivieren Sie 2FA und halten Sie Software aktuell.',
            'ja': 'データを保護するには：強力なパスワードを使用し、2FAを有効にし、ソフトウェアを最新に保ちます。',
            'bho': 'आपन डेटा के सुरक्षित रखे खातिर: मजबूत पासवर्ड यूज करs, 2FA चालू करs, आ सॉफ्टवेयर अपडेट रखs।'
        },
        'q3': {
            'en': 'If hacked: disconnect from the internet, change passwords, and contact support.',
            'hi': 'यदि हैक हो जाए: इंटरनेट से डिस्कनेक्ट करें, पासवर्ड बदलें, और सहायता से संपर्क करें।',
            'ur': 'اگر ہیک ہو جائیں: انٹرنیٹ سے منقطع کریں، پاس ورڈ تبدیل کریں، اور سپورٹ سے رابطہ کریں۔',
            'sa': 'यदि संनादभङ्गः भवति: संजालात् वियोजतु, कूटशब्दं परिवर्ततु, सहायता च संनादतु।',
            'es': 'Si te hackean: desconéctate de internet, cambia contraseñas y contacta soporte.',
            'fr': 'En cas de piratage : déconnectez-vous d’internet, changez les mots de passe et contactez le support.',
            'de': 'Bei einem Hack: Trennen Sie sich vom Internet, ändern Sie Passwörter und kontaktieren Sie den Support.',
            'ja': 'ハッキングされた場合：インターネットから切断し、パスワードを変更し、サポートに連絡してください。',
            'bho': 'अगर हैक हो जाई: इन्टरनेट से काटs, पासवर्ड बदलs, आ सहायता से संपर्क करs।'
        },
        'q4': {
            'en': 'Phishing is a cyberattack where attackers trick users into providing sensitive information by posing as a trustworthy entity.',
            'hi': 'फ़िशिंग एक साइबर हमला है जिसमें हमलावर किसी भरोसेमंद इकाई के रूप में प्रस्तुत होकर उपयोगकर्ताओं से संवेदनशील जानकारी प्राप्त करते हैं।',
            'ur': 'فشنگ ایک سائبر حملہ ہے جہاں حملہ آور قابل اعتماد ادارے کے طور پر پیش آ کر صارفین سے حساس معلومات حاصل کرتے ہیں۔',
            'sa': 'फिशिंगः साइबरआक्रमणमस्ति यत्र आक्रमकाः विश्वसनीयसंस्थानस्य रूपेण प्रस्तुत्वा संवेदनशीलां जानकारीं प्राप्नुवन्ति।',
            'es': 'El phishing es un ciberataque donde los atacantes engañan a los usuarios para obtener información sensible haciéndose pasar por una entidad confiable.',
            'fr': 'Le phishing est une cyberattaque où les attaquants trompent les utilisateurs pour obtenir des informations sensibles en se faisant passer pour une entité fiable.',
            'de': 'Phishing ist ein Cyberangriff, bei dem Angreifer Nutzer täuschen, um sensible Informationen zu erhalten, indem sie sich als vertrauenswürdige Einheit ausgeben.',
            'ja': 'フィッシングは、攻撃者が信頼できる存在を装ってユーザーを騙し、機密情報を取得するサイバー攻撃です。',
            'bho': 'फ़िशिंग एगो साइबर हमला हs जे में हमलावर भरोसेमंद इकाई के रूप में प्रस्तुत होके संवेदनशील जानकारी लs।'
        },
        'q5': {
            'en': 'To recognize malware, look for slow performance, unexpected pop-ups, or unusual network activity.',
            'hi': 'मैलवेयर को पहचानने के लिए, धीमी गति, अप्रत्याशित पॉप-अप, या असामान्य नेटवर्क गतिविधि देखें।',
            'ur': 'میلویئر کو پہچاننے کے لیے، سست کارکردگی، غیر متوقع پاپ اپس، یا غیر معمولی نیٹ ورک سرگرمی دیکھیں۔',
            'sa': 'मैलवेयरं संनादति चेत्, मन्दगतिं, अप्रत्याशितं पॉप-अपं वा असामान्यं संजालक्रियाकलापं zauważ।',
            'es': 'Para reconocer malware, busca un rendimiento lento, ventanas emergentes inesperadas o actividad de red inusual.',
            'fr': 'Pour reconnaître un malware, surveillez une performance lente, des pop-ups inattendus ou une activité réseau inhabituelle.',
            'de': 'Um Malware zu erkennen, achten Sie auf langsame Leistung, unerwartete Pop-ups oder ungewöhnliche Netzwerkaktivität.',
            'ja': 'マルウェアを認識するには、遅いパフォーマンス、予期しないポップアップ、または異常なネットワーク活動に注意してください。',
            'bho': 'मैलवेयर के पहचाने खातिर, धीमा प्रदर्शन, अप्रत्याशित पॉप-अप, या असामान्य नेटवर्क गतिविधि देखs।'
        },
        'q6': {
            'en': 'Encryption is the process of converting data into a coded form to prevent unauthorized access.',
            'hi': 'एन्क्रिप्शन डेटा को एक कोडित रूप में परिवर्तित करने की प्रक्रिया है ताकि अनधिकृत पहुँच रोकी जा सके।',
            'ur': 'انکرپشن ڈیٹا کو کوڈ شدہ شکل میں تبدیل کرنے کا عمل ہے تاکہ غیر مجاز رسائی کو روکا جا سکے۔',
            'sa': 'एन्क्रिप्शन डेटा कूटितरूपेण परिवर्तनस्य प्रक्रिया अस्ति येन अनधिकृतप्रवेशः निवारति।',
            'es': 'La encriptación es el proceso de convertir datos en una forma codificada para prevenir accesos no autorizados.',
            'fr': 'Le chiffrement est le processus de conversion des données en une forme codée pour empêcher tout accès non autorisé.',
            'de': 'Verschlüsselung ist der Prozess, Daten in eine codierte Form umzuwandeln, um unbefugten Zugriff zu verhindern.',
            'ja': '暗号化は、データを符号化された形式に変換して不正アクセスを防ぐプロセスです。',
            'bho': 'एन्क्रिप्शन डेटा के कोडित रूप में बदलs के प्रक्रिया हs ताकि अनधिकृत पहुँच रोका जा सके।'
        }
    };

    const questionText = {
        'q1': 'What is cybersecurity?',
        'q2': 'How to protect my data?',
        'q3': 'What to do if hacked?',
        'q4': 'What is phishing?',
        'q5': 'How to recognize malware?',
        'q6': 'What is encryption?'
    }[questionId];
    const answer = faqAnswers[questionId][selectedLang] || faqAnswers[questionId]['en'];
    const time = getCurrentTime();

    // Disable FAQ options during typing
    $(".faq-option").addClass('disabled');

    // Append user's selected question
    $("#messages").append(`
        <div class='message user'>
            Selected: ${questionText}
            <span class='timestamp'>${time}</span>
        </div>
    `);

    // Append bot's answer div
    const answerDivId = `answer_${questionId}_${Date.now()}`; // Unique ID to avoid conflicts
    $("#messages").append(`
        <div class='message bot' id='${answerDivId}'>
            <span id='answerText_${answerDivId}'></span>
            <span class='timestamp'>${getCurrentTime()}</span>
        </div>
    `);
    $("#messages").scrollTop($("#messages")[0].scrollHeight);

    // Type the answer into the correct div and append FAQ options
    typeAnswer(answer, `answerText_${answerDivId}`, () => {
        const faqOptionsDivId = `faqOptions_${answerDivId}`;
        $("#messages").append(`
            <div class='message bot' id='${faqOptionsDivId}'>
                <br>Select another question:<br>
                <span class="faq-option" onclick="selectFAQ('q1')">What is cybersecurity?</span>
                <span class="faq-option" onclick="selectFAQ('q2')">How to protect my data?</span>
                <span class="faq-option" onclick="selectFAQ('q3')">What to do if hacked?</span>
                <span class="more-option" onclick="showMoreFAQs('${faqOptionsDivId}')">More...</span>
            </div>
        `);
        requestAnimationFrame(() => {
            $(`#${faqOptionsDivId}`).addClass('slide-in');
            $("#messages").scrollTop($("#messages")[0].scrollHeight);
            $(".faq-option").removeClass('disabled');
            isTyping = false;
        });
        speak(answer);
    });
}

function submitForm() {
    const name = $("#formName").val();
    const email = $("#formEmail").val();
    const message = $("#formMessage").val();
    const time = getCurrentTime();

    if (!name || !email || !message) {
        $("#messages").append(`
            <div class='message bot'>
                Please fill all fields!
                <span class='timestamp'>${time}</span>
            </div>
        `);
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
        return;
    }

    $.ajax({
        url: "/submit-form",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ name, email, message, lang: selectedLang }),
        success: function(response) {
            $("#messages").append(`
                <div class='message bot'>
                    Form submitted successfully!
                    <span class='timestamp'>${getCurrentTime()}</span>
                </div>
            `);
            $("#formName").val('');
            $("#formEmail").val('');
            $("#formMessage").val('');
        },
        error: function() {
            $("#messages").append(`
                <div class='message bot'>
                    Error submitting form!
                    <span class='timestamp'>${getCurrentTime()}</span>
                </div>
            `);
        }
    });
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

function sendMessage() {
    if (selectedMode !== 'chat') return;

    const userInput = $("#user_input");
    const message = userInput.val().trim();
    if (!message) return;

    const messages = $("#messages");
    const time = getCurrentTime();

    messages.append(`
        <div class='message user'>
            ${message}
            <span class='timestamp'>${time}</span>
        </div>
    `);
    userInput.val("");

    messages.append(`
        <div class='typing-indicator' id='typing'>Typing...</div>
    `);
    messages.scrollTop(messages[0].scrollHeight);

    setTimeout(() => {
        $("#typing").remove();
        const response = getProfessionalResponse(message);
        const responseTime = getCurrentTime();
        messages.append(`
            <div class='message bot'>
                ${response}
                <span class='timestamp'>${responseTime}</span>
            </div>
        `);
        messages.scrollTop(messages[0].scrollHeight);
        speak(response);
    }, 1000);
}

function getProfessionalResponse(message) {
    const lowerMessage = message.toLowerCase();
    const responses = {
        'en': {
            'hello': 'Greetings! I’m Grok 3, your AI assistant from xAI, specializing in cybersecurity solutions. How may I assist you today?',
            'hi': 'Greetings! I’m Grok 3, your AI assistant from xAI, specializing in cybersecurity solutions. How may I assist you today?',
            'what is cybersecurity': 'Cybersecurity refers to the practice of safeguarding systems, networks, and data from unauthorized access, attacks, or damage. At Jethat Cyber Security, we prioritize protecting your digital assets.',
            'how to stay safe online': 'To stay safe online, use strong, unique passwords, enable two-factor authentication (2FA), avoid suspicious links, and keep your software updated. Would you like detailed guidance on any of these?',
            'default': 'Thank you for your query. I’m here to assist with cybersecurity-related questions. Could you please provide more details or specify your request?'
        },
        'hi': {
            'हाय': 'नमस्ते! मैं Grok 3 हूँ, xAI का AI सहायक, जो साइबर सुरक्षा समाधानों में विशेषज्ञ है। मैं आज आपकी कैसे सहायता कर सकता हूँ?',
            'साइबर सुरक्षा क्या है': 'साइबर सुरक्षा सिस्टम, नेटवर्क और डेटा को अनधिकृत पहुँच, हमलों या क्षति से बचाने की प्रक्रिया को संदर्भित करती है। जेथट साइबर सुरक्षा में, हम आपके डिजिटल संपत्तियों की सुरक्षा को प्राथमिकता देते हैं।',
            'ऑनलाइन सुरक्षित कैसे रहें': 'ऑनलाइन सुरक्षित रहने के लिए, मजबूत और अद्वितीय पासवर्ड का उपयोग करें, दो-कारक प्रमाणीकरण (2FA) सक्षम करें, संदिग्ध लिंक से बचें, और अपने सॉफ्टवेयर को अपडेट रखें। क्या आप इनमें से किसी पर विस्तृत मार्गदर्शन चाहते हैं?',
            'default': 'आपके प्रश्न के लिए धन्यवाद। मैं साइबर सुरक्षा से संबंधित प्रश्नों में सहायता के लिए यहाँ हूँ। कृपया अधिक विवरण दें या अपना अनुरोध स्पष्ट करें।'
        },
        'ur': {
            'ہیلو': 'سلام! میں Grok 3 ہوں، xAI کا AI اسسٹنٹ، جو سائبر سیکیورٹی حل میں مہارت رکھتا ہے۔ میں آج آپ کی کس طرح مدد کر سکتا ہوں؟',
            'default': 'آپ کے سوال کا شکریہ۔ میں سائبر سیکیورٹی سے متعلق سوالات میں مدد کے لیے موجود ہوں۔ براہ کرم مزید تفصیلات فراہم کریں یا اپنی درخواست واضح کریں۔'
        },
        'sa': {
            'default': 'भवतः प्रश्नाय धन्यवादः। अहं साइबरसुरक्षासंबंधिप्रश्नेभ्यः सहायार्थं संनादामि। कृपया अधिकं विवरणं ददातु अथवा स्व अनुरोधं स्पष्टं करोतु।'
        },
        'es': {
            'hola': '¡Saludos! Soy Grok 3, tu asistente de IA de xAI, especializado en soluciones de ciberseguridad. ¿En qué puedo ayudarte hoy?',
            'default': 'Gracias por tu consulta. Estoy aquí para ayudar con preguntas relacionadas con la ciberseguridad. ¿Podrías proporcionar más detalles o especificar tu solicitud?'
        },
        'fr': {
            'bonjour': 'Salutations ! Je suis Grok 3, votre assistant IA de xAI, spécialisé dans les solutions de cybersécurité. Comment puis-je vous aider aujourd’hui ?',
            'default': 'Merci pour votre question. Je suis ici pour aider avec des questions liées à la cybersécurité. Pourriez-vous fournir plus de détails ou préciser votre demande ?'
        },
        'de': {
            'hallo': 'Grüße! Ich bin Grok 3, Ihr KI-Assistent von xAI, spezialisiert auf Cybersicherheitslösungen. Wie kann ich Ihnen heute helfen?',
            'default': 'Danke für Ihre Anfrage. Ich bin hier, um bei Fragen zur Cybersicherheit zu helfen. Könnten Sie bitte mehr Details geben oder Ihre Anfrage konkretisieren?'
        },
        'ja': {
            'こんにちは': 'ご挨拶申し上げます！私はxAIのGrok 3、サイバーセキュリティソリューションに特化したAIアシスタントです。本日、どのようにお手伝いしましょうか？',
            'default': 'ご質問ありがとうございます。私はサイバーセキュリティに関する質問にお答えするためにここにいます。詳細をご提供いただくか、リクエストを明確にしていただけますか？'
        },
        'bho': {
            'नमस्ते': 'नमस्ते! हम Grok 3 हईं, xAI के AI सहायक, जे साइबर सुरक्षा समाधान में माहिर बा। हम आज तोहरा के का मदद कर सकीला?',
            'default': 'तोहरा सवाल खातिर धन्यवाद। हम साइबर सुरक्षा से जुड़ल सवालन के मदद खातिर इहाँ हईं। कृपया जादा जानकारी दs या अपन अनुरोध स्पष्ट करs।'
        }
    };

    const langResponses = responses[selectedLang] || responses['en'];
    return langResponses[lowerMessage] || langResponses['default'];
}

function speak(text) {
    const speechLangMap = {
        'en': 'en-US', 'hi': 'hi-IN', 'ur': 'ur-PK', 'sa': 'sa-IN',
        'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'ja': 'ja-JP',
        'bho': 'hi-IN'
    };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangMap[selectedLang] || 'en-US';
    utterance.rate = 1;
    synthesis.speak(utterance);
}

$(document).ready(resetToLanguageSelection);