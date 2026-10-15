/* ============================================================
   PyMentor — Frontend logic (Vanilla JS)
   لا يوجد أي مفتاح API هنا. الواجهة تتحدث فقط مع FastAPI المحلي.
   ============================================================ */

/* ---------- إعدادات عامة وتخزين محلي ---------- */
const STORAGE_KEYS = {
  chats: "pymentor_chats",
  activeChat: "pymentor_active_chat",
  progress: "pymentor_progress",
  settings: "pymentor_settings",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- بيانات المواضيع التعليمية ---------- */
const TOPICS = [
  { id: "basics", icon: "🐍", title: "أساسيات بايثون", desc: "ما هي بايثون، كيف تكتب أول برنامج، وقواعد الكتابة العامة." },
  { id: "variables", icon: "🔤", title: "المتغيرات", desc: "تخزين البيانات، تسمية المتغيرات، وإسناد القيم." },
  { id: "datatypes", icon: "🔢", title: "أنواع البيانات", desc: "الأعداد، النصوص، القوائم، والقيم المنطقية." },
  { id: "conditions", icon: "🔀", title: "الجمل الشرطية", desc: "if / elif / else واتخاذ القرارات داخل الكود." },
  { id: "loops", icon: "🔁", title: "الحلقات التكرارية", desc: "for و while وتكرار العمليات بكفاءة." },
  { id: "functions", icon: "🧩", title: "الدوال", desc: "تنظيم الكود في دوال قابلة لإعادة الاستخدام." },
  { id: "lists", icon: "📋", title: "القوائم Lists", desc: "تخزين مجموعات من القيم والتعامل معها." },
  { id: "dicts", icon: "🗂️", title: "القواميس Dictionaries", desc: "تخزين البيانات على شكل مفتاح وقيمة." },
  { id: "strings", icon: "✒️", title: "النصوص Strings", desc: "التعامل مع النصوص وتقطيعها وتنسيقها." },
  { id: "errors", icon: "⚠️", title: "معالجة الأخطاء", desc: "فهم رسائل الخطأ واستخدام try/except." },
];

const EXERCISES = [
  {
    id: "ex1", diff: "easy", diffLabel: "سهل",
    prompt: "ما ناتج تنفيذ الكود التالي؟",
    code: `x = 5\ny = 2\nprint(x % y)`,
    options: ["2", "2.5", "1", "خطأ"],
    correct: 2,
    explain: "العامل % يُعيد باقي القسمة. 5 ÷ 2 = 2 والباقي 1.",
  },
  {
    id: "ex2", diff: "easy", diffLabel: "سهل",
    prompt: "ما نوع البيانات الناتج عن هذا التعبير؟",
    code: `value = "10" + "5"\nprint(value)`,
    options: ["15 (رقم)", '"105" (نص)', "خطأ في التنفيذ", "None"],
    correct: 1,
    explain: 'جمع نصّين في بايثون يقوم بدمجهما (Concatenation)، لذا الناتج هو النص "105" وليس عملية جمع رياضية.',
  },
  {
    id: "ex3", diff: "medium", diffLabel: "متوسط",
    prompt: "كم مرة ستتم طباعة كلمة Hi؟",
    code: `for i in range(3):\n    print("Hi")`,
    options: ["مرتان", "ثلاث مرات", "أربع مرات", "لا نهائي"],
    correct: 1,
    explain: "range(3) تولّد القيم 0 و1 و2، أي ثلاث دورات، فتُطبع Hi ثلاث مرات.",
  },
  {
    id: "ex4", diff: "medium", diffLabel: "متوسط",
    prompt: "ما الخطأ في هذا الكود؟",
    code: `def greet(name)\n    print("Hello " + name)`,
    options: ["اسم الدالة غير صحيح", "ناقصة نقطتان (:) بعد التعريف", "لا يوجد خطأ", "greet كلمة محجوزة"],
    correct: 1,
    explain: "أي تعريف دالة، حلقة، أو شرط في بايثون يجب أن ينتهي بنقطتين (:) قبل بدء الجسم.",
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "أي من التالي يُستخدم لتعريف دالة في بايثون؟",
    options: ["function", "def", "func", "define"],
    correct: 1,
    explain: "الكلمة المحجوزة def هي المستخدمة لتعريف الدوال في بايثون، مثل: def my_func():",
  },
  {
    q: "ما ناتج print(type(3.5))؟",
    options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"],
    correct: 1,
    explain: "أي رقم يحتوي على فاصلة عشرية يُصنَّف تلقائيًا كنوع float في بايثون.",
  },
  {
    q: "أي رمز يبدأ التعليق (Comment) في بايثون؟",
    options: ["//", "#", "<!-- -->", "/* */"],
    correct: 1,
    explain: "الرمز # يجعل بايثون تتجاهل كل ما بعده في نفس السطر ويُستخدم لكتابة التعليقات.",
  },
  {
    q: "ما ناتج len([1, 2, 3, 4])؟",
    options: ["3", "4", "5", "خطأ"],
    correct: 1,
    explain: "الدالة len() تُعيد عدد العناصر داخل القائمة، والقائمة تحتوي على 4 عناصر.",
  },
  {
    q: "أي جملة تستخدم للتكرار طالما شرط معين صحيح؟",
    options: ["for", "loop", "while", "repeat"],
    correct: 2,
    explain: "جملة while تُكرر تنفيذ الكود طالما الشرط المكتوب أمامها لا يزال صحيحًا (True).",
  },
];

const SUGGESTED_QUESTIONS = [
  "ما الفرق بين list و tuple؟",
  "لماذا أحصل على IndentationError؟",
  "اشرح لي حلقة for بمثال بسيط",
  "كيف أتعامل مع الأخطاء باستخدام try/except؟",
];

/* ---------- الحالة العامة للتقدّم ---------- */
const defaultProgress = {
  topicsLearned: {},   // {topicId: true}
  questionsAsked: 0,
  bestQuizScore: null, // percentage
  exercisesSolved: {}, // {exId: true}
  streak: 3,           // قيمة تجريبية أولية معقولة لعرض تصميم "Streak"
};
let progress = loadJSON(STORAGE_KEYS.progress, defaultProgress);

let settings = loadJSON(STORAGE_KEYS.settings, {
  level: "beginner",
  hints: "hints",
  apiUrl: "http://127.0.0.1:8000",
});

function persistProgress() { saveJSON(STORAGE_KEYS.progress, progress); }
function persistSettings() { saveJSON(STORAGE_KEYS.settings, settings); }

/* ============================================================
   التنقل بين الأقسام (Views)
   ============================================================ */
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

function switchView(name) {
  views.forEach((v) => v.classList.toggle("is-active", v.id === `view-${name}`));
  navItems.forEach((n) => n.classList.toggle("is-active", n.dataset.view === name));
  if (name === "topics") renderTopicsGrid();
  if (name === "exercises") renderExercises();
  if (name === "progress") renderProgressView();
  if (name === "chat") document.getElementById("chat-input")?.focus();
}

navItems.forEach((btn) => btn.addEventListener("click", () => switchView(btn.dataset.view)));
document.getElementById("btn-start-learning").addEventListener("click", () => switchView("topics"));
document.getElementById("hero-chat-btn").addEventListener("click", () => switchView("chat"));

/* ============================================================
   Toast بسيط للتنبيهات
   ============================================================ */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
}

/* ============================================================
   Hero: أنيميشن كتابة كود ترحيبي
   ============================================================ */
const HERO_SNIPPET = `def greet(name):
    """يرحّب PyMentor بك في كل درس"""
    print(f"أهلاً {name}, لنبدأ رحلة بايثون!")

greet("بك")`;

function typeHeroCode() {
  const el = document.getElementById("hero-typing");
  let i = 0;
  el.textContent = "";
  function tick() {
    if (i <= HERO_SNIPPET.length) {
      el.textContent = HERO_SNIPPET.slice(0, i);
      i += 2;
      setTimeout(tick, 18);
    } else {
      setTimeout(typeHeroCode, 3200);
    }
  }
  tick();
}

/* ============================================================
   Dashboard rendering
   ============================================================ */
function renderDashboard() {
  const topicsCount = Object.keys(progress.topicsLearned).length;
  document.getElementById("stat-topics").innerHTML = `${topicsCount}<small>/10</small>`;
  document.getElementById("stat-topics-bar").style.width = `${(topicsCount / TOPICS.length) * 100}%`;
  document.getElementById("stat-questions").textContent = progress.questionsAsked;
  document.getElementById("stat-quiz").textContent = progress.bestQuizScore !== null ? `${progress.bestQuizScore}%` : "—";
  document.getElementById("stat-exercises").textContent = Object.keys(progress.exercisesSolved).length;
  document.getElementById("sb-streak").textContent = progress.streak;

  const hour = new Date().getHours();
  const greetEl = document.getElementById("greeting");
  if (hour < 12) greetEl.textContent = "صباح الخير، جاهز لدرس جديد؟ ☀️";
  else if (hour < 18) greetEl.textContent = "أهلًا بك مجددًا 👋";
  else greetEl.textContent = "مساء الخير، وقت ممتاز لمراجعة بايثون 🌙";

  const strip = document.getElementById("dashboard-topics");
  strip.innerHTML = "";
  const nextTopics = TOPICS.filter((t) => !progress.topicsLearned[t.id]).slice(0, 4);
  const list = nextTopics.length ? nextTopics : TOPICS.slice(0, 4);
  list.forEach((t) => strip.appendChild(buildTopicCard(t)));
}

function buildTopicCard(topic) {
  const done = !!progress.topicsLearned[topic.id];
  const card = document.createElement("div");
  card.className = "topic-card" + (done ? " done" : "");
  card.innerHTML = `
    <div class="topic-icon">${topic.icon}</div>
    <h4>${topic.title}</h4>
    <p>${topic.desc}</p>
    <div class="topic-progress-row">
      <div class="stat-bar"><span style="width:${done ? 100 : 0}%"></span></div>
      <span class="pct">${done ? "100%" : "0%"}</span>
    </div>
    <button class="btn ${done ? "btn-ghost" : "btn-primary"}">${done ? "مراجعة الموضوع" : "ابدأ التعلم"}</button>
  `;
  card.querySelector("button").addEventListener("click", () => {
    progress.topicsLearned[topic.id] = true;
    persistProgress();
    switchView("chat");
    sendPresetMessage(`اشرح لي موضوع "${topic.title}" في بايثون بأسلوب مبسّط مع مثال عملي.`);
    renderDashboard();
  });
  return card;
}

function renderTopicsGrid() {
  const grid = document.getElementById("topics-grid");
  grid.innerHTML = "";
  TOPICS.forEach((t) => grid.appendChild(buildTopicCard(t)));
}

/* ============================================================
   Exercises rendering
   ============================================================ */
function renderExercises() {
  const list = document.getElementById("exercise-list");
  list.innerHTML = "";
  EXERCISES.forEach((ex) => {
    const solved = !!progress.exercisesSolved[ex.id];
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <div class="exercise-head">
        <h4>${ex.prompt}</h4>
        <span class="exercise-diff ${ex.diff}">${ex.diffLabel}${solved ? " · تم الحل" : ""}</span>
      </div>
      <div class="code-block">
        <div class="code-block-head"><span>example.py</span></div>
        <pre><code>${escapeHTML(ex.code)}</code></pre>
      </div>
      <div class="exercise-options"></div>
      <div class="exercise-feedback-slot"></div>
    `;
    const optWrap = card.querySelector(".exercise-options");
    const feedbackSlot = card.querySelector(".exercise-feedback-slot");
    ex.options.forEach((opt, idx) => {
      const b = document.createElement("button");
      b.className = "exercise-option";
      b.textContent = opt;
      b.addEventListener("click", () => {
        const isCorrect = idx === ex.correct;
        optWrap.querySelectorAll(".exercise-option").forEach((n, i2) => {
          n.disabled = true;
          if (i2 === ex.correct) n.classList.add("correct");
          if (i2 === idx && !isCorrect) n.classList.add("incorrect");
        });
        feedbackSlot.innerHTML = `<div class="exercise-feedback ${isCorrect ? "correct" : "incorrect"}">
          ${isCorrect ? "✓ إجابة صحيحة." : "✗ إجابة غير صحيحة."} ${escapeHTML(ex.explain)}
        </div>`;
        if (isCorrect) {
          progress.exercisesSolved[ex.id] = true;
          persistProgress();
        }
      });
      optWrap.appendChild(b);
    });
    list.appendChild(card);
  });
}

/* ============================================================
   Quiz logic
   ============================================================ */
let quizState = { index: 0, correctCount: 0, answered: false };

document.getElementById("btn-start-quiz").addEventListener("click", startQuiz);
document.getElementById("btn-retry-quiz").addEventListener("click", startQuiz);
document.getElementById("btn-next-question").addEventListener("click", nextQuestion);

function startQuiz() {
  quizState = { index: 0, correctCount: 0, answered: false };
  document.getElementById("quiz-intro").hidden = true;
  document.getElementById("quiz-result").hidden = true;
  document.getElementById("quiz-active").hidden = false;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = QUIZ_QUESTIONS[quizState.index];
  document.getElementById("quiz-qnum").textContent = `السؤال ${quizState.index + 1} من ${QUIZ_QUESTIONS.length}`;
  document.getElementById("quiz-progress-fill").style.width = `${(quizState.index / QUIZ_QUESTIONS.length) * 100}%`;
  document.getElementById("quiz-question").textContent = q.q;
  document.getElementById("quiz-explain").hidden = true;
  document.getElementById("btn-next-question").hidden = true;
  quizState.answered = false;

  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const b = document.createElement("button");
    b.className = "quiz-option";
    b.textContent = opt;
    b.addEventListener("click", () => answerQuiz(idx));
    optionsEl.appendChild(b);
  });
}

function answerQuiz(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = QUIZ_QUESTIONS[quizState.index];
  const isCorrect = idx === q.correct;
  if (isCorrect) quizState.correctCount++;

  document.querySelectorAll(".quiz-option").forEach((btn, i2) => {
    btn.disabled = true;
    if (i2 === q.correct) btn.classList.add("correct");
    if (i2 === idx && !isCorrect) btn.classList.add("incorrect");
  });

  const explainEl = document.getElementById("quiz-explain");
  explainEl.hidden = false;
  explainEl.textContent = (isCorrect ? "✓ صحيح — " : "✗ غير صحيح — ") + q.explain;
  document.getElementById("btn-next-question").hidden = false;
  document.getElementById("btn-next-question").textContent =
    quizState.index === QUIZ_QUESTIONS.length - 1 ? "عرض النتيجة →" : "السؤال التالي →";
}

function nextQuestion() {
  quizState.index++;
  if (quizState.index >= QUIZ_QUESTIONS.length) {
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
}

function finishQuiz() {
  document.getElementById("quiz-active").hidden = true;
  document.getElementById("quiz-result").hidden = false;
  const pct = Math.round((quizState.correctCount / QUIZ_QUESTIONS.length) * 100);
  document.getElementById("result-score").textContent = `${pct}%`;
  document.getElementById("result-title").textContent =
    pct >= 80 ? "أداء ممتاز! 🎉" : pct >= 50 ? "أداء جيد، استمر بالتعلم 💪" : "لا بأس، التكرار سرّ الإتقان 🌱";
  document.getElementById("result-message").textContent =
    `أجبت بشكل صحيح على ${quizState.correctCount} من ${QUIZ_QUESTIONS.length} أسئلة. راجع المواضيع التي واجهت فيها صعوبة من قسم "تعلّم بايثون".`;

  if (progress.bestQuizScore === null || pct > progress.bestQuizScore) {
    progress.bestQuizScore = pct;
    persistProgress();
  }
}

/* ============================================================
   Progress view
   ============================================================ */
function renderProgressView() {
  const topicsCount = Object.keys(progress.topicsLearned).length;
  document.getElementById("pg-topics").innerHTML = `${topicsCount}<small>/10</small>`;
  document.getElementById("pg-topics-bar").style.width = `${(topicsCount / TOPICS.length) * 100}%`;
  document.getElementById("pg-questions").textContent = progress.questionsAsked;
  document.getElementById("pg-quiz").textContent = progress.bestQuizScore !== null ? `${progress.bestQuizScore}%` : "—";
  document.getElementById("pg-exercises").textContent = Object.keys(progress.exercisesSolved).length;
  document.getElementById("pg-streak").textContent = progress.streak;

  const list = document.getElementById("topic-status-list");
  list.innerHTML = "";
  TOPICS.forEach((t) => {
    const done = !!progress.topicsLearned[t.id];
    const row = document.createElement("div");
    row.className = "topic-status-row";
    row.innerHTML = `
      <span class="name">${t.title}</span>
      <div class="stat-bar"><span style="width:${done ? 100 : 0}%"></span></div>
      <span class="badge ${done ? "done" : "todo"}">${done ? "مكتمل" : "لم يبدأ"}</span>
    `;
    list.appendChild(row);
  });
}

/* ============================================================
   إدارة المحادثات (History) — localStorage
   ============================================================ */
function loadChats() { return loadJSON(STORAGE_KEYS.chats, []); }
function saveChats(chats) { saveJSON(STORAGE_KEYS.chats, chats); }

function createNewChat() {
  const chats = loadChats();
  const newChat = {
    id: "chat_" + Date.now(),
    title: "محادثة جديدة",
    createdAt: Date.now(),
    messages: [],
  };
  chats.unshift(newChat);
  saveChats(chats);
  localStorage.setItem(STORAGE_KEYS.activeChat, newChat.id);
  renderHistoryList();
  renderChatMessages();
  return newChat;
}

function getActiveChat() {
  const chats = loadChats();
  let activeId = localStorage.getItem(STORAGE_KEYS.activeChat);
  let chat = chats.find((c) => c.id === activeId);
  if (!chat) {
    if (chats.length) {
      chat = chats[0];
      localStorage.setItem(STORAGE_KEYS.activeChat, chat.id);
    } else {
      chat = createNewChat();
    }
  }
  return chat;
}

function updateChat(chat) {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx !== -1) chats[idx] = chat;
  saveChats(chats);
}

function deleteChat(id) {
  let chats = loadChats().filter((c) => c.id !== id);
  saveChats(chats);
  if (localStorage.getItem(STORAGE_KEYS.activeChat) === id) {
    localStorage.removeItem(STORAGE_KEYS.activeChat);
  }
  renderHistoryList();
  renderChatMessages();
}

function isSameDay(ts1, ts2) {
  const d1 = new Date(ts1), d2 = new Date(ts2);
  return d1.toDateString() === d2.toDateString();
}

function renderHistoryList() {
  const container = document.getElementById("history-list");
  const chats = loadChats();
  const query = document.getElementById("history-search").value.trim().toLowerCase();
  const filtered = query
    ? chats.filter((c) => c.title.toLowerCase().includes(query))
    : chats;

  container.innerHTML = "";
  if (!filtered.length) {
    container.innerHTML = `<div class="history-empty">لا توجد محادثات بعد</div>`;
    return;
  }

  const today = Date.now();
  const yesterday = today - 86400000;
  const groups = { today: [], yesterday: [], older: [] };
  filtered.forEach((c) => {
    if (isSameDay(c.createdAt, today)) groups.today.push(c);
    else if (isSameDay(c.createdAt, yesterday)) groups.yesterday.push(c);
    else groups.older.push(c);
  });

  const activeId = localStorage.getItem(STORAGE_KEYS.activeChat);
  const renderGroup = (label, items) => {
    if (!items.length) return;
    const labelEl = document.createElement("div");
    labelEl.className = "history-group-label";
    labelEl.textContent = label;
    container.appendChild(labelEl);
    items.forEach((c) => {
      const item = document.createElement("div");
      item.className = "history-item" + (c.id === activeId ? " is-active" : "");
      item.innerHTML = `<span class="h-title">${escapeHTML(c.title)}</span><button class="h-del" title="حذف">✕</button>`;
      item.querySelector(".h-title").addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEYS.activeChat, c.id);
        renderHistoryList();
        renderChatMessages();
      });
      item.querySelector(".h-del").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteChat(c.id);
      });
      container.appendChild(item);
    });
  };
  renderGroup("اليوم", groups.today);
  renderGroup("الأمس", groups.yesterday);
  renderGroup("أقدم", groups.older);
}

document.getElementById("btn-new-chat").addEventListener("click", () => {
  createNewChat();
  switchView("chat");
});
document.getElementById("history-search").addEventListener("input", renderHistoryList);

/* ============================================================
   عرض الرسائل + تنسيق Markdown/Code بسيط
   ============================================================ */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// تحويل بسيط لنص الرد: يفصل كتل الكود ```...``` عن باقي النص،
// ويحوّل الأسطر الفارغة لفقرات والشرطات لقوائم.
function formatBotContent(raw) {
  const parts = raw.split(/```(\w*)\n?([\s\S]*?)```/g);
  let html = "";
  for (let i = 0; i < parts.length; i += 3) {
    const textChunk = parts[i];
    const lang = parts[i + 1];
    const code = parts[i + 2];

    if (textChunk && textChunk.trim()) {
      html += textChunk
        .trim()
        .split(/\n{2,}/)
        .map((block) => {
          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          const isList = lines.every((l) => /^[-*]\s+/.test(l)) && lines.length > 1;
          if (isList) {
            return "<ul>" + lines.map((l) => `<li>${escapeHTML(l.replace(/^[-*]\s+/, ""))}</li>`).join("") + "</ul>";
          }
          return `<p>${escapeHTML(block.trim()).replace(/\n/g, "<br>")}</p>`;
        })
        .join("");
    }
    if (code !== undefined && code.trim()) {
      const codeId = "code_" + Math.random().toString(36).slice(2, 9);
      html += `
        <div class="code-block">
          <div class="code-block-head">
            <span>${escapeHTML(lang || "python")}</span>
            <button class="copy-btn" data-target="${codeId}">نسخ</button>
          </div>
          <pre><code id="${codeId}">${escapeHTML(code.trim())}</code></pre>
        </div>`;
    }
  }
  return html || `<p>${escapeHTML(raw)}</p>`;
}

function appendMessage(role, content) {
  const container = document.getElementById("chat-messages");
  document.getElementById("chat-empty")?.remove();

  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = role === "bot" ? formatBotContent(content) : `<p>${escapeHTML(content)}</p>`;
  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  bubble.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const codeEl = document.getElementById(btn.dataset.target);
      navigator.clipboard.writeText(codeEl.textContent).then(() => {
        btn.textContent = "تم النسخ ✓";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "نسخ";
          btn.classList.remove("copied");
        }, 1600);
      });
    });
  });
}

function renderChatMessages() {
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";
  const chat = getActiveChat();

  if (!chat.messages.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.id = "chat-empty";
    empty.innerHTML = `
      <h3>بماذا تريد أن نبدأ؟</h3>
      <p class="muted">جرّب أحد الاقتراحات، أو اكتب سؤالك مباشرة.</p>
      <div class="suggestions" id="suggestions"></div>`;
    container.appendChild(empty);
    const sugWrap = document.getElementById("suggestions");
    SUGGESTED_QUESTIONS.forEach((q) => {
      const chip = document.createElement("button");
      chip.className = "suggestion-chip";
      chip.textContent = q;
      chip.addEventListener("click", () => sendPresetMessage(q));
      sugWrap.appendChild(chip);
    });
    return;
  }

  chat.messages.forEach((m) => appendMessage(m.role, m.content));
}

/* ============================================================
   إرسال الرسائل إلى FastAPI
   ============================================================ */
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("btn-send");
const typingIndicator = document.getElementById("typing-indicator");

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + "px";
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  chatInput.style.height = "auto";
  sendUserMessage(text);
});

function sendPresetMessage(text) {
  switchView("chat");
  sendUserMessage(text);
}

async function sendUserMessage(text) {
  const chat = getActiveChat();

  if (chat.messages.length === 0) {
    chat.title = text.slice(0, 40);
  }
  chat.messages.push({ role: "user", content: text });
  updateChat(chat);
  renderHistoryList();
  appendMessage("user", text);

  progress.questionsAsked++;
  persistProgress();
  renderDashboard();

  sendBtn.disabled = true;
  typingIndicator.hidden = false;
  document.getElementById("chat-messages").scrollTop = 999999;

  try {
    const historyForApi = chat.messages.slice(0, -1).slice(-10); // كل الرسائل السابقة قبل هذه، بحد أقصى 10
    const apiUrl = settings.apiUrl.replace(/\/$/, "");
    const res = await fetch(`${apiUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: historyForApi.map((m) => ({
  role: m.role === "bot" ? "assistant" : m.role,
  content: m.content
})),
        level: settings.level,
        hint_mode: settings.hints,
      }),
    });

    if (!res.ok) throw new Error("bad_response");
    const data = await res.json();
    const reply = data.reply || "عذرًا، لم أتمكن من توليد إجابة الآن.";

    chat.messages.push({ role: "bot", content: reply });
    updateChat(chat);
    appendMessage("bot", reply);
  } catch (err) {
    const fallback =
      "تعذّر الاتصال بخادم PyMentor (FastAPI). تأكد من تشغيل الـ backend، ومن صحة عنوان API في صفحة الإعدادات. " +
      "(للتجربة المحلية: تأكد أن الأمر `uvicorn main:app --reload` يعمل، وأن GEMINI_API_KEY مضبوط في ملف .env)";
    chat.messages.push({ role: "bot", content: fallback });
    updateChat(chat);
    appendMessage("bot", fallback);
  } finally {
    typingIndicator.hidden = true;
    sendBtn.disabled = false;
    renderHistoryList();
  }
}

/* ============================================================
   الإعدادات
   ============================================================ */
function initSettingsForm() {
  document.getElementById("setting-level").value = settings.level;
  document.getElementById("setting-hints").value = settings.hints;
  document.getElementById("setting-api-url").value = settings.apiUrl;

  document.getElementById("setting-level").addEventListener("change", (e) => {
    settings.level = e.target.value;
    persistSettings();
    showToast("تم حفظ مستوى الشرح");
  });
  document.getElementById("setting-hints").addEventListener("change", (e) => {
    settings.hints = e.target.value;
    persistSettings();
    showToast("تم حفظ نمط التلميحات");
  });
  document.getElementById("setting-api-url").addEventListener("change", (e) => {
    settings.apiUrl = e.target.value.trim() || "http://127.0.0.1:8000";
    persistSettings();
    showToast("تم تحديث عنوان الخادم");
  });
  document.getElementById("btn-clear-data").addEventListener("click", () => {
    if (!confirm("سيتم حذف جميع المحادثات وبيانات التقدّم من هذا المتصفح. متابعة؟")) return;
    localStorage.removeItem(STORAGE_KEYS.chats);
    localStorage.removeItem(STORAGE_KEYS.activeChat);
    localStorage.removeItem(STORAGE_KEYS.progress);
    progress = { ...defaultProgress, topicsLearned: {}, exercisesSolved: {} };
    persistProgress();
    renderHistoryList();
    renderChatMessages();
    renderDashboard();
    showToast("تم مسح البيانات المحلية");
  });
}

/* ============================================================
   التهيئة الأولية
   ============================================================ */
function init() {
  renderDashboard();
  renderHistoryList();
  renderChatMessages();
  initSettingsForm();
  typeHeroCode();

  if (!loadChats().length) createNewChat();
}

document.addEventListener("DOMContentLoaded", init);
