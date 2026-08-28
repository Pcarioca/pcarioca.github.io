(() => {
  const APP = window.PCARIOCA_APP;

  APP.data.content = {
    en: {
      name: "Paul-Andrei Munteanu",
      heroHeadline: "Computer Engineering | Embedded Systems | Computer Architecture | Software Development",
      heroRole: "Computer Engineering Student & Software Developer",
      heroSupport: "Computer Engineering student and software developer interested in hardware-oriented systems and the interaction between software and physical computing platforms.",
      heroResume: "View Resume",
      heroGithub: "GitHub",
      heroLinkedIn: "LinkedIn",
      heroContact: "Contact",
      leftWhoAmITitle: "Who I am",
      leftWhoAmINote: "I enjoy understanding how things work, then building them carefully.",
      leftWhoAmISections: [
        { title: "Traits", pills: ["Systems thinker", "Curious", "Detail-oriented", "Independent learner", "Practical problem solver"] },
        { title: "Tech identity", pills: ["Computer Engineering", "Embedded Systems", "Low-Level Software", "Hardware-Software Integration"] },
        { title: "Interests", pills: ["Computer Architecture", "Electronics", "Psychology & Learning", "Engineering Education"] },
        { title: "Hobbies", pills: ["Speedcubing", "Electronics tinkering", "Tennis", "Coffee"] }
      ],
      resume: "Open my resume.",
      statementTitle: "Engineering Statement",
      statementText: "I understand computers across the full stack, from electronic circuits and digital logic to embedded software, operating systems, networks, and cloud-connected systems.",
      aboutTitle: "About Me",
      expertiseTitle: "Technical Expertise",
      workTitle: "Work Experience",
      educationTitle: "Education",
      teachingTitle: "Teaching & Mentoring",
      languagesTitle: "Languages",
      selectedProjectsTitle: "Selected Projects",
      recognitionTitle: "Awards, Certifications & Recognition",
      resourcesTitle: "Volunteering, Erasmus & Academic References",
      focusLabel: "Focus areas",
      copyEmailTip: "Copy email",
      footerLeft: "Tip:",
      audioTip: "Tip: click here to enable sounds",
      eggChaosOn: "Chaos mode enabled.",
      eggChaosOff: "Chaos mode disabled.",
      eggMatrixOn: "Matrix mode enabled.",
      eggPawOn: "Paw trail enabled.",
      eggMelodyPerfect: "Perfect melody run.",
      eggScrambleCopied: "Scramble copied.",
      scramblePanelTitle: "Cube Scramble",
      scrambleRegenerate: "Regenerate",
      scrambleCopy: "Copy",
      scrambleClose: "Close",
      quickTrayTitle: "Quick Access",
      quickTrayPinned: "Pinned Pills",
      quickTrayStarred: "Starred Resources",
      holdHudDefault: "Hold...",
      holdGithubCopied: "GitHub link copied.",
      holdMailDraftCopied: "Mail draft copied.",
      holdLinkedInCopied: "LinkedIn link copied.",
      holdResumeCopied: "Resume link copied.",
      holdBulletCopied: "Bullet copied.",
      holdResourceStarred: "Resource added to quick tray.",
      holdResourceUnstarred: "Resource removed from quick tray.",
      holdPillPinned: "Pill pinned.",
      holdPillUnpinned: "Pill removed from quick tray.",
      holdTagFilterOn: "Tag filter applied.",
      holdTagFilterOff: "Tag filter removed.",
      holdSoundClassic: "Hold sound profile: classic.",
      holdSoundArcade: "Hold sound profile: arcade.",
      holdOrbitOn: "Orbit cursor mode for 20s.",
      holdOrbitOff: "Orbit cursor mode off.",
      holdOrbGameStart: "Build the D Latch",
      holdOrbGameEnd: "System session complete.",
      debugGameTitle: "DEBUG THE SYSTEM",
      debugGameHelp: "Collect blue packets. Avoid red bugs. Use ← → or A / D.",
      debugGameCorrupted: "SYSTEM CORRUPTED",
      debugGameStart: "Start",
      debugGameRestart: "Restart",
      debugGameExit: "Exit",
      debugGameMoveLeft: "Move left",
      debugGameMoveRight: "Move right",
      debugGameScore: "Score",
      debugGameBest: "Best",
      debugGameLevel: "Level",
      latchTitle: "Build the D Latch",
      latchSubtitle: "Complete the circuit, then test D and Enable.",
      latchClose: "Close D latch puzzle",
      latchTray: "Gate tray",
      latchCircuit: "D latch circuit",
      latchNotSlot: "NOT gate position",
      latchUpperSlot: "Upper AND gate position",
      latchLowerSlot: "Lower AND gate position",
      latchPrompt: "Place the three gates, then test the latch.",
      latchComplete: "Circuit complete. Try it.",
      latchD: "D",
      latchEnable: "Enable",
      latchToggleD: "Toggle D",
      latchToggleEnable: "Toggle Enable",
      latchOutputs: "Latch outputs",
      holdTraceGameStart: "Constellation Trace",
      holdTraceGameEnd: "Trace complete.",
      holdInspectionStart: "Inspection timer started.",
      holdInspectionEnd: "Inspection complete.",
      bullets: [
        { icon: "cap", html: "<b>Computer Engineering student</b> at Politehnica University Timișoara, focused on hardware-oriented systems." },
        { icon: "code", html: "<b>Software developer</b> with experience building and maintaining production software and distributed systems." },
        { icon: "chip", html: "Interested in <b>computer architecture, embedded systems, digital electronics, FPGA, IoT, networking, and low-level programming</b>." },
        { icon: "cap", html: "Experienced in <b>technical teaching and mentoring</b>, from complete beginners to university students and competition preparation." },
        { icon: "ai", html: "I like understanding systems end-to-end: the interaction between <b>hardware, software, networks, and infrastructure</b>." }
      ],
      expertiseGroups: [
        { title: "Hardware & Computer Engineering", skills: ["Computer Architecture", "Digital Logic", "Electronic Circuits", "Embedded Systems", "FPGA / HDL", "Microcontrollers", "Sensors & Actuators", "PWM", "Control Systems"] },
        { title: "Systems", skills: ["Linux", "Low-Level Programming", "Operating Systems", "Computer Networks", "TCP/IP", "IoT", "Edge Computing", "Hardware-Software Integration"] },
        { title: "Programming", skills: ["C", "Python", "C#", "Java", "JavaScript"] },
        { title: "Software Engineering", skills: ["Git", "APIs", "Backend Development", "Databases", "Testing", "Debugging", "System Integration", "Automation"] },
        { title: "Teaching", skills: ["Technical Tutoring", "Programming Education", "Educational Psychology", "Mentoring"] }
      ],
      education: [
        { title: "BSc Computer Engineering", institution: "Faculty of Automation and Computers, Politehnica University Timișoara", institutionLinkKey: "acUpt", period: "2023 - 2027", focus: "Computer Architecture · Embedded Systems · Digital Logic · Electronics · Operating Systems · Networks · FPGA · Software Engineering" },
        { title: "Pedagogical Training Module", institution: "Educational Psychology & Teaching Practice", period: "", focus: "" }
      ],
      teachingIntro: "Experience teaching programming and computer science to children, high-school students, and university students, including complete beginners and students preparing for ICT and AcadNet competitions.",
      teachingItems: [
        { title: "Private tutoring", note: "Individual programming and computer science support." },
        { title: "Logiscool Reșița", titleLinkKey: "logiscool", note: "Programming education for children and teenagers.", noteLinks: [{ linkKey: "logiscoolTrainer", label: "Teaching reference" }, { linkKey: "logiscoolTrainerDocument", label: "Trainer document" }] },
        { title: "Volunteer tutoring & mentoring", note: "Supporting learners through structured practice and guidance." },
        { title: "University laboratory tutoring", note: "Helping university students understand technical concepts and coursework." }
      ],
      languages: [
        { name: "Romanian", level: "Native" },
        { name: "English", level: "C1 Advanced / Cambridge", linkKey: "cambridgeC1" },
        { name: "German", level: "DSD / B2-C1 level", linkKey: "deutschesSprachDiplomB2" }
      ],
      workItems: [
        { linkKey: "visionAi", label: "VisionAI", note: "Professional software development." },
        { linkKey: "fiscalXpert", label: "FiscalXpert", note: "Professional software development." },
        { linkKey: "superprof", label: "Private Tutor / Superprof", note: "Programming and computer science tutoring." },
        { linkKey: "logiscool", label: "Logiscool Reșița", note: "Programming trainer." }
      ],
      projectGroups: [{
        title: "Personal & Academic Work",
        items: [
          { linkKey: "githubProfile", label: "GitHub Profile", note: "Personal and academic repository portfolio" },
          { linkKey: "pidControlResearch", label: "PID Control Research & Educational Platform", note: "Raspberry Pi · Python · IMU · PWM · PID Control · Brushless Motors — Closed-loop control platform designed to explore PID control, real-time sensor measurements, motor actuation, and system stability." },
          { linkKey: "operatingSystemsProject", label: "Operating Systems Project", note: "C · Linux · Systems Programming — Low-level programming project exploring operating-system concepts and systems programming in C." },
          { linkKey: "markovLanguageModel", label: "Markov Language Model", note: "Programming · Probability · NLP — Experimental language model based on Markov chains and probabilistic text generation." },
          { linkKey: "electronicsProjects", label: "Electronics Projects", note: "Collection of personal experiments involving digital electronics, embedded systems, circuit design, and computer engineering." },
          { linkKey: "githubProfile", label: "More projects on GitHub →", note: "Explore the complete repository portfolio" }
        ]
      }],
      recognitionGroups: [{
        title: "Selected Recognition",
        items: [
          { linkKey: "infoeducatieDiploma", label: "National Finalist, InfoEducație – Web Development", note: "Web development", noteLinks: [{ linkKey: "infoeducatieResults", label: "Official results" }] },
          { linkKey: "euCodeWeekHackathon", label: "2nd Place, EU Code Week Hackathon", note: "Fake News Identifier" },
          { linkKey: "volunteerOfTheYear", label: "Volunteer of the Year 2021", note: "Recognition for social impact" },
          { linkKey: "microsoftTechnologyAssociate", label: "Microsoft Technology Associate", note: "Official Certiport verification", noteLinks: [{ linkKey: "microsoftTechnologyAssociateDocument", label: "Credential document" }] },
          { linkKey: "protoshopGim", label: "Protoshop GIM / 3D Printing Instructor", note: "Selected teaching recognition" }
        ]
      }],
      resourceGroups: [
        {
          title: "Volunteering",
          items: [
            { linkKey: "saveTheChildrenActivity", label: "Save the Children", note: "Volunteer activity", noteLinks: [{ linkKey: "saveTheChildrenRecommendation", label: "Recommendation" }] },
            { linkKey: "magnifyWellness", label: "Magnify Wellness – Technology Team Director", note: "Volunteer leadership role" },
            { linkKey: "studentBuddyProgramme", label: "Student Buddy Programme UPT", note: "Student support programme" },
            { linkKey: "volunteerTutorMentor", label: "Volunteer Tutor & Mentor", note: "Codeville · Magnify Wellness · Română versus Informatică" }
          ]
        },
        {
          title: "Erasmus Projects",
          items: [
            { linkKey: "humanityBeyondBorders", label: "Humanity Beyond Borders Youth Exchange", note: "Erasmus Youth Exchange participation" },
            { linkKey: "healthyLifeErasmus", label: "A Healthy Life in a Healthy Environment – Erasmus+", note: "Erasmus+ project", noteLinks: [{ linkKey: "healthyLifeErasmusDocument", label: "Project document" }] }
          ]
        },
        {
          title: "Academic Recommendations",
          items: [
            { linkKey: "universityTaRecommendation", label: "University TA Recommendation", note: "Teaching assistant recommendation letter" },
            { linkKey: "associateProfessorRecommendation", label: "Associate Professor Recommendation", note: "Academic recommendation letter" },
            { linkKey: "academicRecommendation", label: "Politehnica University Timișoara Recommendation", note: "Academic recommendation letter" }
          ]
        }
      ]
    },

    ro: {
      name: "Paul-Andrei Munteanu",
      heroHeadline: "Ingineria Calculatoarelor | Sisteme Embedded | Arhitectura Calculatoarelor | Dezvoltare Software",
      heroRole: "Student la Ingineria Calculatoarelor și Software Developer",
      heroSupport: "Student la Ingineria Calculatoarelor și software developer, interesat de sisteme orientate spre hardware și de interacțiunea dintre software și platformele fizice de calcul.",
      heroResume: "Vezi CV-ul",
      heroGithub: "GitHub",
      heroLinkedIn: "LinkedIn",
      heroContact: "Contact",
      leftWhoAmITitle: "Cine sunt",
      leftWhoAmINote: "Îmi place să înțeleg cum funcționează lucrurile și apoi să le construiesc cu grijă.",
      leftWhoAmISections: [
        { title: "Trăsături", pills: ["Gândire sistemică", "Curios", "Atent la detalii", "Învățare independentă", "Rezolv probleme practic"] },
        { title: "Identitate tehnică", pills: ["Ingineria Calculatoarelor", "Sisteme Embedded", "Software low-level", "Integrare hardware-software"] },
        { title: "Interese", pills: ["Arhitectura Calculatoarelor", "Electronică", "Psihologie și învățare", "Educație inginerească"] },
        { title: "Hobby-uri", pills: ["Speedcubing", "Mesterit în electronică", "Tenis", "Cafea"] }
      ],
      resume: "Deschide CV-ul.",
      statementTitle: "Declarație inginerească",
      statementText: "Înțeleg calculatoarele pe întregul lor stack, de la circuite electronice și logică digitală până la software embedded, sisteme de operare, rețele și sisteme conectate la cloud.",
      aboutTitle: "Despre mine",
      expertiseTitle: "Expertiză tehnică",
      workTitle: "Experiență profesională",
      educationTitle: "Educație",
      teachingTitle: "Predare și mentorat",
      languagesTitle: "Limbi",
      selectedProjectsTitle: "Proiecte selectate",
      recognitionTitle: "Premii, certificări și recunoaștere",
      resourcesTitle: "Voluntariat, Erasmus și recomandări academice",
      focusLabel: "Direcții de interes",
      copyEmailTip: "Copiază emailul",
      footerLeft: "Sfat:",
      audioTip: "Sfat: apasă aici pentru a activa sunetele",
      eggChaosOn: "Modul haos activat.",
      eggChaosOff: "Modul haos dezactivat.",
      eggMatrixOn: "Modul Matrix activat.",
      eggPawOn: "Urmele de lăbuțe au fost activate.",
      eggMelodyPerfect: "Secvență muzicală perfectă.",
      eggScrambleCopied: "Scramble copiat.",
      scramblePanelTitle: "Scramble pentru cub",
      scrambleRegenerate: "Generează",
      scrambleCopy: "Copiază",
      scrambleClose: "Închide",
      quickTrayTitle: "Acces rapid",
      quickTrayPinned: "Pill-uri fixate",
      quickTrayStarred: "Resurse favorite",
      holdHudDefault: "Ține apăsat...",
      holdGithubCopied: "Linkul GitHub a fost copiat.",
      holdMailDraftCopied: "Draftul de email a fost copiat.",
      holdLinkedInCopied: "Linkul LinkedIn a fost copiat.",
      holdResumeCopied: "Linkul CV-ului a fost copiat.",
      holdBulletCopied: "Elementul a fost copiat.",
      holdResourceStarred: "Resursa a fost adăugată în accesul rapid.",
      holdResourceUnstarred: "Resursa a fost eliminată din accesul rapid.",
      holdPillPinned: "Element fixat.",
      holdPillUnpinned: "Element eliminat din accesul rapid.",
      holdTagFilterOn: "Filtrul a fost aplicat.",
      holdTagFilterOff: "Filtrul a fost eliminat.",
      holdSoundClassic: "Profil audio la apăsare: classic.",
      holdSoundArcade: "Profil audio la apăsare: arcade.",
      holdOrbitOn: "Mod cursor orbită activ timp de 20 s.",
      holdOrbitOff: "Mod cursor orbită dezactivat.",
      holdOrbGameStart: "Construiește latch-ul D",
      holdOrbGameEnd: "Sesiunea de depanare s-a încheiat.",
      debugGameTitle: "DEPANEAZĂ SISTEMUL",
      debugGameHelp: "Colectează pachetele albastre. Evită erorile roșii. Folosește ← → sau A / D.",
      debugGameCorrupted: "SISTEM CORUPT",
      debugGameStart: "Start",
      debugGameRestart: "Repornește",
      debugGameExit: "Ieșire",
      debugGameMoveLeft: "Mișcă la stânga",
      debugGameMoveRight: "Mișcă la dreapta",
      debugGameScore: "Scor",
      debugGameBest: "Record",
      debugGameLevel: "Nivel",
      latchTitle: "Construiește latch-ul D",
      latchSubtitle: "Completează circuitul, apoi testează D și Enable.",
      latchClose: "Închide puzzle-ul latch D",
      latchTray: "Tavă cu porți",
      latchCircuit: "Circuit latch D",
      latchNotSlot: "Poziția porții NOT",
      latchUpperSlot: "Poziția porții AND de sus",
      latchLowerSlot: "Poziția porții AND de jos",
      latchPrompt: "Plasează cele trei porți, apoi testează latch-ul.",
      latchComplete: "Circuit complet. Încearcă-l.",
      latchD: "D",
      latchEnable: "Enable",
      latchToggleD: "Comută D",
      latchToggleEnable: "Comută Enable",
      latchOutputs: "Ieșirile latch-ului",
      holdTraceGameStart: "Constellation Trace",
      holdTraceGameEnd: "Trasare încheiată.",
      holdInspectionStart: "Cronometrul de inspecție a pornit.",
      holdInspectionEnd: "Inspecție finalizată.",
      bullets: [
        { icon: "cap", html: "<b>Student la Ingineria Calculatoarelor</b> la Politehnica Timișoara, cu focus pe sisteme orientate spre hardware." },
        { icon: "code", html: "<b>Software developer</b> cu experiență în dezvoltarea și mentenanța software-ului de producție și a sistemelor distribuite." },
        { icon: "chip", html: "Interesat de <b>arhitectura calculatoarelor, sisteme embedded, electronică digitală, FPGA, IoT, rețele și programare low-level</b>." },
        { icon: "cap", html: "Experiență în <b>predare tehnică și mentorat</b>, de la începători compleți până la studenți și pregătire pentru competiții." },
        { icon: "ai", html: "Îmi place să înțeleg sistemele cap-coadă: interacțiunea dintre <b>hardware, software, rețele și infrastructură</b>." }
      ],
      expertiseGroups: [
        { title: "Hardware și Ingineria Calculatoarelor", skills: ["Arhitectura Calculatoarelor", "Logică digitală", "Circuite electronice", "Sisteme Embedded", "FPGA / HDL", "Microcontrolere", "Senzori și actuatori", "PWM", "Sisteme de control"] },
        { title: "Sisteme", skills: ["Linux", "Programare low-level", "Sisteme de operare", "Rețele de calculatoare", "TCP/IP", "IoT", "Edge Computing", "Integrare hardware-software"] },
        { title: "Programare", skills: ["C", "Python", "C#", "Java", "JavaScript"] },
        { title: "Inginerie software", skills: ["Git", "API-uri", "Dezvoltare backend", "Baze de date", "Testare", "Debugging", "Integrare de sisteme", "Automatizare"] },
        { title: "Predare", skills: ["Meditații tehnice", "Educație în programare", "Psihologie educațională", "Mentorat"] }
      ],
      education: [
        { title: "BSc Ingineria Calculatoarelor", institution: "Facultatea de Automatică și Calculatoare, Universitatea Politehnica Timișoara", institutionLinkKey: "acUpt", period: "2023 - 2027", focus: "Arhitectura Calculatoarelor · Sisteme Embedded · Logică digitală · Electronică · Sisteme de operare · Rețele · FPGA · Inginerie software" },
        { title: "Modul de formare pedagogică", institution: "Psihologie educațională și practică pedagogică", period: "", focus: "" }
      ],
      teachingIntro: "Experiență în predarea programării și informaticii pentru copii, elevi de liceu și studenți, inclusiv începători compleți și elevi care se pregătesc pentru competițiile ICT și AcadNet.",
      teachingItems: [
        { title: "Meditații private", note: "Sprijin individual pentru programare și informatică." },
        { title: "Logiscool Reșița", titleLinkKey: "logiscool", note: "Educație în programare pentru copii și adolescenți.", noteLinks: [{ linkKey: "logiscoolTrainer", label: "Referință de predare" }, { linkKey: "logiscoolTrainerDocument", label: "Document de trainer" }] },
        { title: "Predare și mentorat voluntar", note: "Sprijin pentru învățare prin exercițiu și îndrumare structurată." },
        { title: "Laboratoare universitare", note: "Ajutor pentru înțelegerea conceptelor tehnice și a materiei de curs." }
      ],
      languages: [
        { name: "Română", level: "Nativă" },
        { name: "Engleză", level: "C1 Advanced / Cambridge", linkKey: "cambridgeC1" },
        { name: "Germană", level: "DSD / nivel B2-C1", linkKey: "deutschesSprachDiplomB2" }
      ],
      workItems: [
        { linkKey: "visionAi", label: "VisionAI", note: "Dezvoltare software profesională." },
        { linkKey: "fiscalXpert", label: "FiscalXpert", note: "Dezvoltare software profesională." },
        { linkKey: "superprof", label: "Meditator privat / Superprof", note: "Meditații la programare și informatică." },
        { linkKey: "logiscool", label: "Logiscool Reșița", note: "Trainer de programare." }
      ],
      projectGroups: [{
        title: "Proiecte personale și academice",
        items: [
          { linkKey: "githubProfile", label: "Profil GitHub", note: "Portofoliu de repository-uri personale și academice" },
          { linkKey: "pidControlResearch", label: "Cercetare PID și platformă educațională", note: "Raspberry Pi · Python · IMU · PWM · control PID · motoare brushless — Platformă de control în buclă închisă pentru explorarea controlului PID, a măsurătorilor în timp real, a acționării motoarelor și a stabilității sistemului." },
          { linkKey: "operatingSystemsProject", label: "Proiect de sisteme de operare", note: "C · Linux · programare de sisteme — Proiect low-level despre concepte de sisteme de operare și programare de sisteme în C." },
          { linkKey: "markovLanguageModel", label: "Markov Language Model", note: "Programare · probabilități · NLP — Model experimental de limbaj bazat pe lanțuri Markov și generare probabilistică de text." },
          { linkKey: "electronicsProjects", label: "Proiecte de electronică", note: "Colecție de experimente personale cu electronică digitală, sisteme embedded, proiectare de circuite și ingineria calculatoarelor." },
          { linkKey: "githubProfile", label: "Mai multe proiecte pe GitHub →", note: "Vezi portofoliul complet de repository-uri" }
        ]
      }],
      recognitionGroups: [{
        title: "Recunoaștere selectată",
        items: [
          { linkKey: "infoeducatieDiploma", label: "Finalist național, InfoEducație – Web Development", note: "Web development", noteLinks: [{ linkKey: "infoeducatieResults", label: "Rezultate oficiale" }] },
          { linkKey: "euCodeWeekHackathon", label: "Locul 2, EU Code Week Hackathon", note: "Fake News Identifier" },
          { linkKey: "volunteerOfTheYear", label: "Volunteer of the Year 2021", note: "Recunoaștere pentru impact social" },
          { linkKey: "microsoftTechnologyAssociate", label: "Microsoft Technology Associate", note: "Verificare oficială Certiport", noteLinks: [{ linkKey: "microsoftTechnologyAssociateDocument", label: "Document de certificare" }] },
          { linkKey: "protoshopGim", label: "Instructor Protoshop GIM / imprimare 3D", note: "Recunoaștere în predare" }
        ]
      }],
      resourceGroups: [
        {
          title: "Voluntariat",
          items: [
            { linkKey: "saveTheChildrenActivity", label: "Salvați Copiii", note: "Activitate de voluntariat", noteLinks: [{ linkKey: "saveTheChildrenRecommendation", label: "Recomandare" }] },
            { linkKey: "magnifyWellness", label: "Magnify Wellness – Director al echipei tehnice", note: "Rol de coordonare în voluntariat" },
            { linkKey: "studentBuddyProgramme", label: "Student Buddy Programme UPT", note: "Program de sprijin pentru studenți" },
            { linkKey: "volunteerTutorMentor", label: "Meditator și mentor voluntar", note: "Codeville · Magnify Wellness · Română versus Informatică" }
          ]
        },
        {
          title: "Proiecte Erasmus",
          items: [
            { linkKey: "humanityBeyondBorders", label: "Schimb de tineret Humanity Beyond Borders", note: "Participare la un schimb de tineret Erasmus" },
            { linkKey: "healthyLifeErasmus", label: "A Healthy Life in a Healthy Environment – Erasmus+", note: "Proiect Erasmus+", noteLinks: [{ linkKey: "healthyLifeErasmusDocument", label: "Documentul proiectului" }] }
          ]
        },
        {
          title: "Recomandări academice",
          items: [
            { linkKey: "universityTaRecommendation", label: "Recomandare pentru activitatea de TA", note: "Scrisoare de recomandare pentru activitatea de teaching assistant" },
            { linkKey: "associateProfessorRecommendation", label: "Recomandare de la profesor asociat", note: "Scrisoare de recomandare academică" },
            { linkKey: "academicRecommendation", label: "Recomandare Politehnica Timișoara", note: "Scrisoare de recomandare academică" }
          ]
        }
      ]
    },

    de: {
      name: "Paul-Andrei Munteanu",
      heroHeadline: "Computer Engineering | Embedded Systems | Computerarchitektur | Softwareentwicklung",
      heroRole: "Student der Computertechnik & Softwareentwickler",
      heroSupport: "Student der Computertechnik und Softwareentwickler mit Interesse an hardwareorientierten Systemen und dem Zusammenspiel von Software und physischen Rechenplattformen.",
      heroResume: "Lebenslauf ansehen",
      heroGithub: "GitHub",
      heroLinkedIn: "LinkedIn",
      heroContact: "Kontakt",
      leftWhoAmITitle: "Wer ich bin",
      leftWhoAmINote: "Ich möchte verstehen, wie Dinge funktionieren, und sie anschließend sorgfältig bauen.",
      leftWhoAmISections: [
        { title: "Eigenschaften", pills: ["Systemdenker", "Neugierig", "Detailorientiert", "Selbstständiger Lerner", "Praktischer Problemlöser"] },
        { title: "Technische Identität", pills: ["Computertechnik", "Embedded Systems", "Low-Level-Software", "Hardware-Software-Integration"] },
        { title: "Interessen", pills: ["Computerarchitektur", "Elektronik", "Psychologie und Lernen", "Ingenieurpädagogik"] },
        { title: "Hobbys", pills: ["Speedcubing", "Elektronik-Tüftelei", "Tennis", "Kaffee"] }
      ],
      resume: "Lebenslauf öffnen.",
      statementTitle: "Ingenieurstatement",
      statementText: "Ich verstehe Computer über den gesamten Stack hinweg – von elektronischen Schaltungen und digitaler Logik über Embedded Software, Betriebssysteme und Netzwerke bis zu cloudverbundenen Systemen.",
      aboutTitle: "Über mich",
      expertiseTitle: "Technische Schwerpunkte",
      workTitle: "Berufserfahrung",
      educationTitle: "Ausbildung",
      teachingTitle: "Lehre & Mentoring",
      languagesTitle: "Sprachen",
      selectedProjectsTitle: "Ausgewählte Projekte",
      recognitionTitle: "Auszeichnungen, Zertifikate & Anerkennung",
      resourcesTitle: "Ehrenamt, Erasmus & akademische Empfehlungen",
      focusLabel: "Schwerpunkte",
      copyEmailTip: "E-Mail kopieren",
      footerLeft: "Tipp:",
      audioTip: "Tipp: hier klicken, um Sounds zu aktivieren",
      eggChaosOn: "Chaosmodus aktiviert.",
      eggChaosOff: "Chaosmodus deaktiviert.",
      eggMatrixOn: "Matrixmodus aktiviert.",
      eggPawOn: "Pfotenspur aktiviert.",
      eggMelodyPerfect: "Perfekte Melodiesequenz.",
      eggScrambleCopied: "Scramble kopiert.",
      scramblePanelTitle: "Würfel-Scramble",
      scrambleRegenerate: "Neu erzeugen",
      scrambleCopy: "Kopieren",
      scrambleClose: "Schließen",
      quickTrayTitle: "Schnellzugriff",
      quickTrayPinned: "Angeheftete Pills",
      quickTrayStarred: "Favorisierte Ressourcen",
      holdHudDefault: "Gedrückt halten...",
      holdGithubCopied: "GitHub-Link kopiert.",
      holdMailDraftCopied: "E-Mail-Entwurf kopiert.",
      holdLinkedInCopied: "LinkedIn-Link kopiert.",
      holdResumeCopied: "Lebenslauf-Link kopiert.",
      holdBulletCopied: "Eintrag kopiert.",
      holdResourceStarred: "Ressource zum Schnellzugriff hinzugefügt.",
      holdResourceUnstarred: "Ressource aus dem Schnellzugriff entfernt.",
      holdPillPinned: "Pill angeheftet.",
      holdPillUnpinned: "Pill aus dem Schnellzugriff entfernt.",
      holdTagFilterOn: "Tag-Filter angewendet.",
      holdTagFilterOff: "Tag-Filter entfernt.",
      holdSoundClassic: "Soundprofil beim Halten: classic.",
      holdSoundArcade: "Soundprofil beim Halten: arcade.",
      holdOrbitOn: "Orbit-Cursor-Modus für 20 s aktiviert.",
      holdOrbitOff: "Orbit-Cursor-Modus deaktiviert.",
      holdOrbGameStart: "Das D-Latch bauen",
      holdOrbGameEnd: "Debug-Sitzung beendet.",
      debugGameTitle: "DEBUG THE SYSTEM",
      debugGameHelp: "Sammle blaue Pakete. Vermeide rote Bugs. Nutze ← → oder A / D.",
      debugGameCorrupted: "SYSTEM KORRUMPIERT",
      debugGameStart: "Start",
      debugGameRestart: "Neustart",
      debugGameExit: "Beenden",
      debugGameMoveLeft: "Nach links bewegen",
      debugGameMoveRight: "Nach rechts bewegen",
      debugGameScore: "Punkte",
      debugGameBest: "Bestwert",
      debugGameLevel: "Level",
      latchTitle: "Das D-Latch bauen",
      latchSubtitle: "Vervollständige die Schaltung und teste dann D und Enable.",
      latchClose: "D-Latch-Puzzle schließen",
      latchTray: "Gatterablage",
      latchCircuit: "D-Latch-Schaltung",
      latchNotSlot: "Position des NOT-Gatters",
      latchUpperSlot: "Position des oberen AND-Gatters",
      latchLowerSlot: "Position des unteren AND-Gatters",
      latchPrompt: "Platziere die drei Gatter und teste anschließend das Latch.",
      latchComplete: "Schaltung vollständig. Probier sie aus.",
      latchD: "D",
      latchEnable: "Enable",
      latchToggleD: "D umschalten",
      latchToggleEnable: "Enable umschalten",
      latchOutputs: "Latch-Ausgänge",
      holdTraceGameStart: "Constellation Trace",
      holdTraceGameEnd: "Nachzeichnen beendet.",
      holdInspectionStart: "Inspektionstimer gestartet.",
      holdInspectionEnd: "Inspektion abgeschlossen.",
      bullets: [
        { icon: "cap", html: "<b>Student der Computertechnik</b> an der Politehnica University Timișoara mit Schwerpunkt auf hardwareorientierten Systemen." },
        { icon: "code", html: "<b>Softwareentwickler</b> mit Erfahrung in der Entwicklung und Wartung von Produktionssoftware und verteilten Systemen." },
        { icon: "chip", html: "Interesse an <b>Computerarchitektur, Embedded Systems, digitaler Elektronik, FPGA, IoT, Netzwerken und Low-Level-Programmierung</b>." },
        { icon: "cap", html: "Erfahrung in <b>technischer Lehre und Mentoring</b> – von kompletten Anfängern bis zu Universitätsstudierenden und Wettbewerbsvorbereitung." },
        { icon: "ai", html: "Ich möchte Systeme ganzheitlich verstehen: das Zusammenspiel von <b>Hardware, Software, Netzwerken und Infrastruktur</b>." }
      ],
      expertiseGroups: [
        { title: "Hardware & Computertechnik", skills: ["Computerarchitektur", "Digitale Logik", "Elektronische Schaltungen", "Embedded Systems", "FPGA / HDL", "Mikrocontroller", "Sensoren & Aktoren", "PWM", "Regelungstechnik"] },
        { title: "Systeme", skills: ["Linux", "Low-Level-Programmierung", "Betriebssysteme", "Computernetzwerke", "TCP/IP", "IoT", "Edge Computing", "Hardware-Software-Integration"] },
        { title: "Programmierung", skills: ["C", "Python", "C#", "Java", "JavaScript"] },
        { title: "Software Engineering", skills: ["Git", "APIs", "Backend-Entwicklung", "Datenbanken", "Tests", "Debugging", "Systemintegration", "Automatisierung"] },
        { title: "Lehre", skills: ["Technische Nachhilfe", "Programmierunterricht", "Pädagogische Psychologie", "Mentoring"] }
      ],
      education: [
        { title: "BSc Computer Engineering", institution: "Fakultät für Automatisierung und Computertechnik, Politehnica University Timișoara", institutionLinkKey: "acUpt", period: "2023 - 2027", focus: "Computerarchitektur · Embedded Systems · Digitale Logik · Elektronik · Betriebssysteme · Netzwerke · FPGA · Software Engineering" },
        { title: "Pädagogisches Ausbildungsmodul", institution: "Pädagogische Psychologie & Unterrichtspraxis", period: "", focus: "" }
      ],
      teachingIntro: "Erfahrung im Unterrichten von Programmierung und Informatik für Kinder, Schülerinnen und Schüler sowie Universitätsstudierende – einschließlich kompletter Anfänger und der Vorbereitung auf ICT- und AcadNet-Wettbewerbe.",
      teachingItems: [
        { title: "Private Nachhilfe", note: "Individuelle Unterstützung in Programmierung und Informatik." },
        { title: "Logiscool Reșița", titleLinkKey: "logiscool", note: "Programmierunterricht für Kinder und Jugendliche.", noteLinks: [{ linkKey: "logiscoolTrainer", label: "Lehrreferenz" }, { linkKey: "logiscoolTrainerDocument", label: "Trainerdokument" }] },
        { title: "Freiwillige Nachhilfe & Mentoring", note: "Begleitung von Lernenden durch strukturiertes Üben und Beratung." },
        { title: "Universitäre Laborbetreuung", note: "Unterstützung beim Verständnis technischer Konzepte und Studieninhalte." }
      ],
      languages: [
        { name: "Rumänisch", level: "Muttersprache" },
        { name: "Englisch", level: "C1 Advanced / Cambridge", linkKey: "cambridgeC1" },
        { name: "Deutsch", level: "DSD / Niveau B2-C1", linkKey: "deutschesSprachDiplomB2" }
      ],
      workItems: [
        { linkKey: "visionAi", label: "VisionAI", note: "Professionelle Softwareentwicklung." },
        { linkKey: "fiscalXpert", label: "FiscalXpert", note: "Professionelle Softwareentwicklung." },
        { linkKey: "superprof", label: "Privatlehrer / Superprof", note: "Nachhilfe in Programmierung und Informatik." },
        { linkKey: "logiscool", label: "Logiscool Reșița", note: "Programmiertrainer." }
      ],
      projectGroups: [{
        title: "Persönliche & akademische Projekte",
        items: [
          { linkKey: "githubProfile", label: "GitHub-Profil", note: "Portfolio persönlicher und akademischer Repositories" },
          { linkKey: "pidControlResearch", label: "PID-Regelungsforschung & Lernplattform", note: "Raspberry Pi · Python · IMU · PWM · PID-Regelung · bürstenlose Motoren — Geschlossene Regelungsplattform zur Untersuchung von PID-Regelung, Echtzeitmessungen, Motoransteuerung und Systemstabilität." },
          { linkKey: "operatingSystemsProject", label: "Betriebssysteme-Projekt", note: "C · Linux · Systemprogrammierung — Low-Level-Projekt zu Betriebssystemkonzepten und Systemprogrammierung in C." },
          { linkKey: "markovLanguageModel", label: "Markov Language Model", note: "Programmierung · Wahrscheinlichkeit · NLP — Experimentelles Sprachmodell auf Basis von Markov-Ketten und probabilistischer Textgenerierung." },
          { linkKey: "electronicsProjects", label: "Elektronikprojekte", note: "Sammlung persönlicher Experimente mit digitaler Elektronik, Embedded Systems, Schaltungsentwurf und Computertechnik." },
          { linkKey: "githubProfile", label: "Weitere Projekte auf GitHub →", note: "Das vollständige Repository-Portfolio ansehen" }
        ]
      }],
      recognitionGroups: [{
        title: "Ausgewählte Anerkennung",
        items: [
          { linkKey: "infoeducatieDiploma", label: "Nationaler Finalist, InfoEducație – Web Development", note: "Webentwicklung", noteLinks: [{ linkKey: "infoeducatieResults", label: "Offizielle Ergebnisse" }] },
          { linkKey: "euCodeWeekHackathon", label: "2. Platz, EU Code Week Hackathon", note: "Fake News Identifier" },
          { linkKey: "volunteerOfTheYear", label: "Volunteer of the Year 2021", note: "Anerkennung für gesellschaftliches Engagement" },
          { linkKey: "microsoftTechnologyAssociate", label: "Microsoft Technology Associate", note: "Offizielle Certiport-Verifizierung", noteLinks: [{ linkKey: "microsoftTechnologyAssociateDocument", label: "Zertifikatsdokument" }] },
          { linkKey: "protoshopGim", label: "Protoshop GIM / 3D-Druck-Instruktor", note: "Ausgewählte Lehranerkennung" }
        ]
      }],
      resourceGroups: [
        {
          title: "Ehrenamt",
          items: [
            { linkKey: "saveTheChildrenActivity", label: "Save the Children", note: "Ehrenamtliche Tätigkeit", noteLinks: [{ linkKey: "saveTheChildrenRecommendation", label: "Empfehlung" }] },
            { linkKey: "magnifyWellness", label: "Magnify Wellness – Leiter des Technology Teams", note: "Ehrenamtliche Führungsrolle" },
            { linkKey: "studentBuddyProgramme", label: "Student Buddy Programme UPT", note: "Unterstützungsprogramm für Studierende" },
            { linkKey: "volunteerTutorMentor", label: "Freiwilliger Tutor & Mentor", note: "Codeville · Magnify Wellness · Română versus Informatică" }
          ]
        },
        {
          title: "Erasmus-Projekte",
          items: [
            { linkKey: "humanityBeyondBorders", label: "Humanity Beyond Borders Youth Exchange", note: "Teilnahme an einem Erasmus-Jugendaustausch" },
            { linkKey: "healthyLifeErasmus", label: "A Healthy Life in a Healthy Environment – Erasmus+", note: "Erasmus+-Projekt", noteLinks: [{ linkKey: "healthyLifeErasmusDocument", label: "Projektdokument" }] }
          ]
        },
        {
          title: "Akademische Empfehlungen",
          items: [
            { linkKey: "universityTaRecommendation", label: "Empfehlung für die TA-Tätigkeit", note: "Empfehlungsschreiben als Teaching Assistant" },
            { linkKey: "associateProfessorRecommendation", label: "Empfehlung eines Associate Professors", note: "Akademisches Empfehlungsschreiben" },
            { linkKey: "academicRecommendation", label: "Empfehlung der Politehnica Timișoara", note: "Akademisches Empfehlungsschreiben" }
          ]
        }
      ]
    }
  };
})();
