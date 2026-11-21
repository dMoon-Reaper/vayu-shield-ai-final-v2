// Hindi and English localization dictionary for Delhi PM2.5 Forecasting Dashboard & VayuShield AI

export const translations = {
  en: {
    // Masthead & Global
    hackathonBadge: 'VERITAS AI INTERNATIONAL HIGH SCHOOL HACKATHON 2026 // AI + CLIMATE TRACK',
    teamCredits: 'Swastik Divyanshu & Krishnendu Patro • Grade 11 • DAV Public School, Chandrasekharpur, Bhubaneswar',
    datasetLive: 'DATASET: LIVE SATELLITE & STATION INGEST',
    datasetReplay: 'DATASET: HELD-OUT TEST REPLAY',
    location: 'NEW DELHI (28.61° N, 77.20° E)',
    unverifiedNotice: 'LIVE FORECAST (UNVERIFIED • NO GROUND TRUTH YET)',
    replayNotice: 'REPLAY OF HELD-OUT TEST DAYS, NOT A LIVE FORECAST',
    appTitle: 'VAYUSHIELD AI // DELHI SCHOOL-CHILD PM2.5 ALERT & FORECASTING SYSTEM',
    appSubtitle: 'Next-Day Preventive Decision Engine for School Morning Assemblies, Outdoor PE & Transit Safety',
    navLanding: '01. Project Specifications',
    navConsole: '02. Live Alert Console',
    navWorkbench: '03. Honesty & Evaluation Workbench',
    themeLit: '☀ LIT MODE',
    themeDark: '☾ DARK BIOLUMINESCENCE',
    uploadJson: '[Upload results.json]',
    refreshSchedule: 'REFRESH // 4× DAILY VIA GITHUB ACTIONS',

    // Landing View
    landingHeroTag: 'AIRSHIELD / VAYUSHIELD AI // PEDIATRIC CLIMATE HEALTH ENGINE',
    landingHeadline: 'Empirical 24-Hour Advance PM2.5 Forecasting Engineered for School Child Protection in Delhi.',
    landingSubheadline: 'An asymmetric decision-intelligence web application protecting 100,000+ school pupils from severe winter morning smog before physical exposure occurs at 07:30 AM.',
    landingLaunchApp: '🚀 Launch Main School Alert System',
    landingLaunchAudit: '📊 Explore Honest Evaluation & Failure Audit',
    landingDevsTitle: 'RESEARCH & DEVELOPMENT TEAM',
    landingDevsGrade: 'Academic Level: Grade 11 • Secondary School Scholars',
    landingDevsSchool: 'DAV Public School, Chandrasekharpur, Bhubaneswar, Odisha, India',
    landingDev1Role: 'ML Architecture, Asymmetric Loss & Full-Stack UI Co-Author',
    landingDev2Role: 'Meteorological Pipeline, Uncertainty Intervals & DevOps Co-Author',

    // Landing Cards (Working Specifications Grid)
    card1Title: 'CARD 1 // END-TO-END ARCHITECTURE & DATA FLOW',
    card1Subtitle: 'Station PM2.5 + Reanalysis Meteorology to School-Gate Protocol',
    card1Desc: 'Real OpenAQ ground measurements merged with Open-Meteo boundary layer dynamics, transformed through non-linear HistGradientBoosting + q80 quantile calibration.',

    card2Title: 'CARD 2 // WHY 60 µg/m³ (INDIAN NAAQS) VS 35 µg/m³ (US EPA)',
    card2Subtitle: 'Preventing Alert Fatigue While Safeguarding Lungs',
    card2Desc: 'In Delhi winter, the US EPA standard of 35 µg/m³ triggers alarms on 63% of days (even during clear monsoon spells), causing dangerous alert fatigue. The CPCB 60 µg/m³ 24-hr threshold targets truly toxic events, while the system still benchmarks 35, 90, 120, and 250 µg/m³.',

    card3Title: 'CARD 3 // DATA PROVENANCE & QUALITY SPECIFICATIONS',
    card3Subtitle: 'Sensor Readout & Transparent Disclosure of Missing Data Gap',
    card3Desc: 'Ground truth from OpenAQ New Delhi station (loc 8118, sensor 23534). OpenAQ vs Open-Meteo correlation r = 0.662 across 1,019 valid days. Openly discloses the 14-day late-September to mid-October sensor dropout gap and its effect on lag feature alignment.',

    card4Title: 'CARD 4 // HOW WE STAND OUT (NOVELTY & UNIQUENESS MATRIX)',
    card4Subtitle: 'VayuShield AI vs. CPCB Sameer, SAFAR-India & IQAir',
    card4Desc: 'Why retrospective 24-hour rolling averages fail school principals, and how our 24-hour advance uncertainty-calibrated engine solves the morning assembly dilemma.',

    // Console & Command Deck
    consoleTitle: 'DELHI SCHOOL-CHILD MORNING ACTION & ALERT CONSOLE',
    consoleSubtitle: 'Hero Command Deck for Principals, Health Coordinators & Parents',
    ruleSelectorLabel: 'OPERATIONAL DECISION RULE:',
    rulePoint: 'Point Forecast (model > threshold)',
    ruleCalibrated: 'Mid-Risk / Calibrated (+6 µg/m³ Buffer) • Recommended',
    ruleConservative: 'Conservative (q80 Upper Bound > threshold)',
    thresholdPillsLabel: 'REGULATORY & HEALTH THRESHOLD:',
    threshold35: '35 µg/m³ (US EPA)',
    threshold60: '60 µg/m³ (Indian NAAQS - Default)',
    threshold90: '90 µg/m³ (Unhealthy Sensitive)',
    threshold120: '120 µg/m³ (Very Poor)',
    threshold250: '250 µg/m³ (Severe+ / Hazardous)',

    // Dynamic School Protocol Card
    protocolGreenTitle: 'CLEARED FOR NORMAL OUTDOOR OPERATIONS',
    protocolGreenBadge: 'NORMAL OPERATIONS // NO ALERT',
    protocolGreenAction: 'Outdoor morning assembly, physical education classes, and playground recess are approved to proceed as scheduled. Standard hydration advisories apply.',
    
    protocolAmberTitle: 'PRECAUTIONARY INDOOR PROTOCOL ACTIVATED',
    protocolAmberBadge: 'MODERATE ALERT // INDOOR SHIFT',
    protocolAmberAction: 'Relocate 07:30 AM morning assembly to covered auditoriums or classrooms. Restrict rigorous outdoor athletic exertion. High alert for infirmary staff with asthmatic inhaler verification.',
    
    protocolCrimsonTitle: 'MANDATORY OUTDOOR SUSPENSION & RESPIRATORY SHIELD',
    protocolCrimsonBadge: 'CRITICAL ALERT // MANDATORY INDOOR CONFINEMENT',
    protocolCrimsonAction: 'Immediately cancel all outdoor morning assemblies and PE sports. Activate school-wide HEPA air purification systems. Mandatory N95 masks for bus transit and pedestrian commuters.',

    // Directives
    assemblyLabel: '01. Morning Assembly (07:30)',
    sportsLabel: '02. PE & Athletic Training',
    recessLabel: '03. Lunch & Playground Recess',
    infirmaryLabel: '04. Infirmary & Asthmatic Care',

    assemblyAlert: 'MANDATORY INDOORS',
    assemblySafe: 'OUTDOOR CLEARED',
    sportsAlert: 'SUSPENDED / INDOOR GYM',
    sportsSafe: 'NORMAL RUNNING',
    recessAlert: 'CLASSROOM CONFINED',
    recessSafe: 'PLAYGROUND PERMITTED',
    infirmaryAlert: 'HIGH ALERT // INHALERS STANDBY',
    infirmarySafe: 'STANDARD PROTOCOL',

    // Real-time Tradeoff stats
    statMissedWarnings: 'Missed Warnings (FN):',
    statFalseAlarms: 'False Alarms (FP):',
    statDaysExceeded: 'Days Above Threshold:',
    statSelectedRule: 'Active Rule:',

    // Stepper & Jumps
    jumpLabel: 'QUICK JUMP:',
    jumpDiwali: 'Diwali Spike',
    jumpPeak: 'Peak PM2.5',
    jumpClean: 'Cleanest Day',
    jumpWorst: 'Worst Error Day',

    // Trajectory Chart
    chartTitle: 'FIG. 1 // 120-DAY HELD-OUT CHRONOLOGICAL TRAJECTORY & UNCERTAINTY ENVELOPE',
    chartSubtitle: 'Ground Station Truth vs. Gradient Boosting Forecast vs. Persistence Baseline',
    chartToggleModel: '[Model Forecast]',
    chartToggleActual: '[Actual PM2.5]',
    chartToggleBaseline: '[Baseline (t=t-1)]',
    chartToggleBand: '[q80 Uncertainty Band]',
    chartToggleSplit: '[15 Oct Season Split]',
    chartToggleGap: '[Late-Sep Data Gap]',
    chartTogglePins: '[Top Failure Pins]',

    // Honesty Scorecard
    scorecardTitle: 'TABLE 1.0 // HONESTY & EVALUATION SCORECARD DECK',
    scorecardSubtitle: 'Full Transparency: Model Performance vs. Naive "Tomorrow = Today" Persistence',
    badgeHonestImprovement: 'MODEST EMPIRICAL IMPROVEMENT OVER PERSISTENCE',
    cardMaeTestTitle: '120-DAY TEST MAE',
    cardMaeBacktestTitle: '5-FOLD WALK-FORWARD MAE',
    cardCoverageTitle: 'q80 INTERVAL COVERAGE',
    cardAccuracyTitle: 'DECISION ACCURACY (@ 60 µg/m³)',
    cardRecallTitle: 'CHILD SAFETY RECALL (@ 60 µg/m³)',
    cardPrecisionTitle: 'DECISION PRECISION (@ 60 µg/m³)',

    // Top Failures
    failuresTitle: 'SEC. 3.0 // TOP 5 MODEL FAILURES & DOMAIN HYPOTHESIS INSPECTOR',
    failuresSubtitle: 'Auditing Where Gradient Boosting Deviates From Reality (Click Cards to Inspect)',
    flagshipStudyTitle: 'CASE STUDY // 12 NOV POST-DIWALI SPIKE & ASYMMETRIC LOSS SUCCESS',

    // Diwali Ablation
    diwaliTitle: 'SEC. 4.0 // 5-VARIANT DIWALI ABLATION EXPERIMENT (model_diwali.py)',
    diwaliSubtitle: 'Do Calendar Features & Log-Ratio Targets Solve Extreme Combustion Spikes?',
    diwaliTakeaway: 'Rigorous Scientific Ablation: Reporting all five variants proves that multiplicative log-ratio targets reduce smog season MAE, while calendar features alone cannot resolve unmeasured single-night episodic firecracker bursts.',

    // Threshold Matrix
    matrixTitle: 'TABLE 2.0 // COMPLETE THRESHOLD TRADE-OFF MATRIX',
    matrixSubtitle: 'Missed Warnings (FN) vs. False Alarms (FP) Across 5 Cutoffs & 3 Operational Rules',

    // Advisory Generator
    advisoryTitle: 'SEC. 5.0 // COORDINATOR ADVISORY DISPATCH GENERATOR',
    advisorySubtitle: 'Instant WhatsApp & Public Address Broadcast for School Leadership',
    generateAdvisoryBtn: '⚡ Generate Directive Broadcast',
    generatingAdvisory: 'Synthesizing verified directive...',
    copyAdvisoryBtn: '📋 Copy Dispatch',
    copiedAdvisoryBtn: '✓ Copied to Clipboard',

    // Footer
    footerDisclaimer: 'Prototype developed for the Veritas AI International High School Hackathon 2026. Not formal medical advice. Station PM2.5 measurements ingested from OpenAQ API v3; surface meteorology from Open-Meteo API.',
    footerColophon: 'DELHI PM2.5 SCHOOL DECISION SYSTEM • RESEARCHED & DEVELOPED BY SWASTIK DIVYANSHU & KRISHNENDU PATRO (GRADE 11, DAV CHANDRASEKHARPUR BHUBANESWAR)',
  },

  hi: {
    // Masthead & Global
    hackathonBadge: 'वेरिटास एआई इंटरनेशनल हाई स्कूल हैकाथॉन 2026 // एआई + क्लाइमेट ट्रैक',
    teamCredits: 'स्वास्तिक दिव्यांशु व कृष्णेंदु पात्रो • कक्षा 11 • डीएवी पब्लिक स्कूल, चंद्रशेखरपुर, भुवनेश्वर',
    datasetLive: 'डेटासेट: उपग्रह व वायु गुणवत्ता स्टेशन लाइव फीड',
    datasetReplay: 'डेटासेट: 120-दिवसीय परीक्षित टेस्ट रीप्ले',
    location: 'नई दिल्ली (28.61° उत्तर, 77.20° पूर्व)',
    unverifiedNotice: 'लाइव पूर्वानुमान (सत्यापन लंबित • कल का वास्तविक डेटा शेष)',
    replayNotice: 'परीक्षित ऐतिहासिक टेस्ट रीप्ले, लाइव पूर्वानुमान नहीं',
    appTitle: 'वायुशील्ड एआई // दिल्ली स्कूली बाल स्वास्थ्य PM2.5 चेतावनी प्रणाली',
    appSubtitle: 'सुबह की प्रार्थना सभा, खेलकूद व यातायात सुरक्षा हेतु 24-घंटे पूर्व निर्णायक प्रणाली',
    navLanding: '01. परियोजना विनिर्देश',
    navConsole: '02. लाइव अलर्ट कंसोल',
    navWorkbench: '03. सत्यनिष्ठा व मूल्यांकन बेंच',
    themeLit: '☀ दिन (लाइट मोड)',
    themeDark: '☾ रात (बायोल्यूमिनेसेंस डार्क)',
    uploadJson: '[results.json अपलोड]',
    refreshSchedule: 'अपडेट // गिटहब एक्शन्स द्वारा 4× दैनिक',

    // Landing View
    landingHeroTag: 'वायुशील्ड एआई // बाल स्वास्थ्य एवं वायु गुणवत्ता सुरक्षा इंजन',
    landingHeadline: 'दिल्ली के स्कूली बच्चों की सुरक्षा हेतु 24-घंटे पूर्व PM2.5 पूर्वानुमान एवं निर्णय प्रणाली।',
    landingSubheadline: 'सवेरे 07:30 बजे प्रार्थना सभा व खेलकूद के दौरान छात्रों को गंभीर प्रदूषण से बचाने हेतु विशेष एआई निर्णय मंच।',
    landingLaunchApp: '🚀 मुख्य स्कूल अलर्ट सिस्टम खोलें',
    landingLaunchAudit: '📊 सत्यनिष्ठा मूल्यांकन व विफलता ऑडिट देखें',
    landingDevsTitle: 'अनुसंधान व विकास दल (समान योगदान)',
    landingDevsGrade: 'शैक्षणिक स्तर: कक्षा 11 • हाई स्कूल शोधार्थी',
    landingDevsSchool: 'डीएवी पब्लिक स्कूल, चंद्रशेखरपुर, भुवनेश्वर, ओडिशा, भारत',
    landingDev1Role: 'एमएल आर्किटेक्चर, असंतुलित लॉस व यूआई सह-लेखक',
    landingDev2Role: 'मौसम डेटा पाइपलाइन, अनिश्चितता अंतराल व देवऑप्स सह-लेखक',

    // Landing Cards
    card1Title: 'कार्ड 1 // संपूर्ण आर्किटेक्चर एवं डेटा प्रवाह',
    card1Subtitle: 'स्टेशन PM2.5 + मौसम विज्ञान से स्कूल-गेट निर्णय तक',
    card1Desc: 'OpenAQ ग्राउंड स्टेशन प्रेक्षणों और Open-Meteo मौसम मापदंडों का एकीकरण, हिस्ट-ग्रेडिएंट बूस्टिंग और q80 अवशेष सीमा द्वारा संचालित।',

    card2Title: 'कार्ड 2 // 60 µg/m³ (भारतीय NAAQS) बनाम 35 µg/m³ (US EPA)',
    card2Subtitle: 'अलर्ट थकान से बचाव और फेफड़ों की सुरक्षा का संतुलन',
    card2Desc: 'दिल्ली की सर्दियों में US EPA का 35 µg/m³ मानक 63% दिनों पर अलार्म बजाता है, जिससे अलर्ट थकान होती है। CPCB का 60 µg/m³ मानक वास्तविक जोखिम पर केंद्रित है।',

    card3Title: 'कार्ड 3 // डेटा स्रोत एवं गुणवत्ता विनिर्देश',
    card3Subtitle: 'स्टेशन विवरण व सितंबर-अक्टूबर डेटा अंतराल का पारदर्शी प्रकटीकरण',
    card3Desc: 'नई दिल्ली OpenAQ स्टेशन (आईडी 8118, सेंसर 23534)। 1,019 दिनों में OpenAQ व Open-Meteo सहसंबंध r = 0.662। 14-दिवसीय सेंसर गैप का खुला प्रकटीकरण।',

    card4Title: 'कार्ड 4 // मौजूदा प्रणालियों से हमारा अंतर (नवीनता मैट्रिक्स)',
    card4Subtitle: 'वायुशील्ड एआई बनाम सीपीसीबी समीर, सफर व आईक्यूएयर',
    card4Desc: 'पुरानी 24-घंटे की औसत रिपोर्ट की तुलना में 24-घंटे पूर्व अनिश्चितता-युक्त अग्रिम स्कूल प्रोटोकॉल की श्रेष्ठता।',

    // Console & Command Deck
    consoleTitle: 'दिल्ली स्कूली बाल स्वास्थ्य सुबह की कार्ययोजना एवं अलर्ट कंसोल',
    consoleSubtitle: 'प्रधानाचार्यों, स्वास्थ्य समन्वयकों व अभिभावकों हेतु मुख्य कमांड डेक',
    ruleSelectorLabel: 'परिचालन निर्णय नियम:',
    rulePoint: 'पॉइंट पूर्वानुमान (मॉडल > सीमा)',
    ruleCalibrated: 'कैलिब्रेटेड सुरक्षा बफर (+6 µg/m³) • अनुशंसित',
    ruleConservative: 'कंजर्वेटिव नियम (80% ऊपरी सीमा > सीमा)',
    thresholdPillsLabel: 'राष्ट्रीय व स्वास्थ्य मानक सीमा:',
    threshold35: '35 µg/m³ (यूएस ईपीए)',
    threshold60: '60 µg/m³ (भारतीय NAAQS - डिफ़ॉल्ट)',
    threshold90: '90 µg/m³ (संवेदनशील हेतु अस्वस्थ)',
    threshold120: '120 µg/m³ (बहुत खराब)',
    threshold250: '250 µg/m³ (अति गंभीर / आपातकालीन)',

    // Dynamic School Protocol Card
    protocolGreenTitle: 'सामान्य बाहरी गतिविधियों हेतु स्वीकृत',
    protocolGreenBadge: 'सामान्य स्थिति // कोई अलर्ट नहीं',
    protocolGreenAction: 'सुबह की प्रार्थना सभा, खेलकूद अभ्यास व मैदान में लंच ब्रेक की अनुमति है। मानक जलयोजन निर्देश लागू हैं।',

    protocolAmberTitle: 'सतर्कता: इनडोर गतिविधियों का आदेश',
    protocolAmberBadge: 'मध्यम चेतावनी // इनडोर स्थानांतरण',
    protocolAmberAction: 'सवेरे 07:30 बजे की प्रार्थना सभा हॉल अथवा कक्षाओं में आयोजित करें। अत्यधिक दौड़-धूप रोकें। दमा पीड़ित छात्रों के इनहेलर की जांच करें।',

    protocolCrimsonTitle: 'अनिवार्य बाहरी निलंबन व श्वसन सुरक्षा निर्देश',
    protocolCrimsonBadge: 'अति गंभीर चेतावनी // पूर्ण इनडोर सुरक्षा',
    protocolCrimsonAction: 'सभी बाहरी खेलकूद व प्रार्थना सभाएं तुरंत रद्द करें। स्कूल के एयर प्यूरीफायर चलाएं। बस व पैदल आवागमन में N95 मास्क अनिवार्य।',

    // Directives
    assemblyLabel: '01. सुबह की प्रार्थना सभा (07:30)',
    sportsLabel: '02. खेलकूद व पीई अभ्यास',
    recessLabel: '03. लंच व खेल मध्यांतर',
    infirmaryLabel: '04. प्राथमिक उपचार व संवेदनशील छात्र',

    assemblyAlert: 'अनिवार्य इनडोर',
    assemblySafe: 'मैदान स्वीकृत',
    sportsAlert: 'स्थगित / इनडोर जिम',
    sportsSafe: 'सामान्य अभ्यास',
    recessAlert: 'कक्षाओं में सीमित',
    recessSafe: 'मैदान में अनुमति',
    infirmaryAlert: 'उच्च सतर्कता // इनहेलर तैयार',
    infirmarySafe: 'मानक प्रोटोकॉल',

    // Real-time Tradeoff stats
    statMissedWarnings: 'छूटी चेतावनियां (FN):',
    statFalseAlarms: 'झूठे अलार्म (FP):',
    statDaysExceeded: 'सीमा पार करने वाले दिन:',
    statSelectedRule: 'सक्रिय नियम:',

    // Stepper & Jumps
    jumpLabel: 'त्वरित जंप:',
    jumpDiwali: 'दीवाली स्पाइक',
    jumpPeak: 'चरम PM2.5',
    jumpClean: 'सबसे साफ दिन',
    jumpWorst: 'चरम त्रुटि दिन',

    // Trajectory Chart
    chartTitle: 'चित्र 1 // 120-दिवसीय टेस्ट रीप्ले व 80% अनिश्चितता दायरा',
    chartSubtitle: 'वास्तविक स्टेशन रीडिंग बनाम मॉडल पूर्वानुमान बनाम बेसलाइन',
    chartToggleModel: '[मॉडल पूर्वानुमान]',
    chartToggleActual: '[वास्तविक PM2.5]',
    chartToggleBaseline: '[बेसलाइन (कल = आज)]',
    chartToggleBand: '[80% अनिश्चितता दायरा]',
    chartToggleSplit: '[15 अक्टूबर मौसम विभाजन]',
    chartToggleGap: '[सितंबर डेटा अंतराल]',
    chartTogglePins: '[मॉडल विफलता पिन]',

    // Honesty Scorecard
    scorecardTitle: 'तालिका 1.0 // सत्यनिष्ठा एवं प्रदर्शन स्कोरकार्ड',
    scorecardSubtitle: 'पूर्ण पारदर्शिता: मॉडल बनाम "कल = आज" बेसलाइन का ईमानदार मूल्यांकन',
    badgeHonestImprovement: 'बेसलाइन पर वास्तविक व विनम्र सुधार',
    cardMaeTestTitle: '120-दिवसीय टेस्ट MAE',
    cardMaeBacktestTitle: '5-फोल्ड वॉक-फॉरवर्ड MAE',
    cardCoverageTitle: 'q80 अंतराल कवरेज',
    cardAccuracyTitle: 'निर्णय सटीकता (@ 60 µg/m³)',
    cardRecallTitle: 'बाल सुरक्षा रिकॉल (@ 60 µg/m³)',
    cardPrecisionTitle: 'निर्णय परिशुद्धता (@ 60 µg/m³)',

    // Top Failures
    failuresTitle: 'अनुभाग 3.0 // शीर्ष 5 मॉडल विफलताएं व भौतिक परिकल्पनाएं',
    failuresSubtitle: 'मॉडल कहां चूका: मौसम व उत्सर्जन परिकल्पना ऑडिट',
    flagshipStudyTitle: 'केस स्टडी // 12 नवंबर दीवाली स्पाइक व असंतुलित सुरक्षा की सफलता',

    // Diwali Ablation
    diwaliTitle: 'अनुभाग 4.0 // 5-वेरिएंट दीवाली प्रयोग (model_diwali.py)',
    diwaliSubtitle: 'क्या कैलेंडर फीचर्स व लॉग-रेशियो चरम स्पाइक को सुधारते हैं?',
    diwaliTakeaway: 'सख्त वैज्ञानिक एब्लेशन: सभी पांच वेरिएंट्स की रिपोर्टिंग यह सिद्ध करती है कि लॉग-रेशियो प्रदूषण काल में सुधार करता है, किंतु कैलेंडर फीचर्स अप्रत्याशित आतिशबाजी का पूर्ण अनुमान नहीं लगा सकते।',

    // Threshold Matrix
    matrixTitle: 'तालिका 2.0 // सम्पूर्ण थ्रेशोल्ड ट्रेड-ऑफ मैट्रिक्स',
    matrixSubtitle: '5 कटऑफ और 3 नियमों में छूटी चेतावनियां (FN) बनाम झूठे अलार्म (FP)',

    // Advisory Generator
    advisoryTitle: 'अनुभाग 5.0 // समन्वयक निर्देश प्रसार जनरेटर',
    advisorySubtitle: 'व्हाट्सएप व सुबह की घोषणा हेतु तत्काल सत्यापित निर्देश',
    generateAdvisoryBtn: '⚡ आधिकारिक निर्देश बनाएं',
    generatingAdvisory: 'निर्देश तैयार किया जा रहा है...',
    copyAdvisoryBtn: '📋 निर्देश कॉपी करें',
    copiedAdvisoryBtn: '✓ क्लिपबोर्ड पर कॉपी हो गया',

    // Footer
    footerDisclaimer: 'वेरिटास एआई इंटरनेशनल हाई स्कूल हैकाथॉन 2026 हेतु विकसित प्रोटोटाइप। चिकित्सा सलाह नहीं। स्टेशन डेटा OpenAQ API v3 से तथा मौसम Open-Meteo से प्राप्त।',
    footerColophon: 'दिल्ली PM2.5 स्कूल सुरक्षा निर्णय प्रणाली • सह-विकासकर्ता: स्वास्तिक दिव्यांशु व कृष्णेंदु पात्रो (कक्षा 11, डीएवी चंद्रशेखरपुर, भुवनेश्वर)',
  }
};
