/**
 * SmartRide - Application Logic & Recommendation Engine
 * Terhubung Langsung dengan Google Sheets Cloud Database (Multi-Device Live Sync)
 */

// URL Google Sheets Apps Script Webhook
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxxQa981RaYCQ6ky9WUV7bc8VhJcRtJxLrsRlTCpV7UAQxQY_UwdvzmC4s8m2jKexCD/exec";

// LocalStorage Keys
const STORAGE_KEY_RESPONDENTS = "smartride_respondents_data";
const STORAGE_KEY_ADMIN_AUTH = "smartride_admin_logged_in";
const STORAGE_KEY_LAST_SUBMITTED = "smartride_last_submitted_id";

// App State
const state = {
    currentView: "kuesioner", // "kuesioner" | "admin"
    currentStep: 1, // 1: Profil, 2: Likert, 3: Hasil & Rekomendasi
    respondents: [],
    formData: {
        name: "",
        age: "",
        status: "",
        favoriteApp: "Gojek", // Gojek, Grab, Maxim
        answers: {}
    },
    tableFilters: {
        search: "",
        status: "all",
        sort: "newest"
    },
    isAdminLoggedIn: false,
    currentRecommendation: null,
    lastSubmittedId: null
};

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initData();
    renderLikertQuestions();
    initEventListeners();
    updateStepperUI();
    checkAdminSession();

    // Dengarkan event storage agar tab lain langsung tersinkronisasi jika data berubah
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY_RESPONDENTS) {
            initData();
            if (state.currentView === "admin") {
                renderAdminDashboard();
            }
        }
    });
});

/* ============================================================
   1. Data Initialization & Storage
   ============================================================ */
function initData() {
    state.lastSubmittedId = localStorage.getItem(STORAGE_KEY_LAST_SUBMITTED) || null;
    const savedData = localStorage.getItem(STORAGE_KEY_RESPONDENTS);
    
    if (savedData) {
        try {
            state.respondents = JSON.parse(savedData);
            if (!Array.isArray(state.respondents) || state.respondents.length === 0) {
                state.respondents = [...DEFAULT_RESPONDENTS];
                saveRespondents();
            } else {
                // Pastikan integritas properti
                state.respondents.forEach(r => {
                    if (r.favoriteApp === "inDrive") r.favoriteApp = "Gojek";
                    if (!r.recommendedApp) r.recommendedApp = "Gojek";
                });
            }
        } catch (e) {
            console.error("Gagal membaca LocalStorage, memuat default.", e);
            state.respondents = [...DEFAULT_RESPONDENTS];
            saveRespondents();
        }
    } else {
        state.respondents = [...DEFAULT_RESPONDENTS];
        saveRespondents();
    }
}

function saveRespondents() {
    try {
        localStorage.setItem(STORAGE_KEY_RESPONDENTS, JSON.stringify(state.respondents));
    } catch (e) {
        console.error("Gagal menyimpan ke LocalStorage:", e);
    }
}

function checkAdminSession() {
    state.isAdminLoggedIn = localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === "true";
    updateAdminNavUI();
}

/* ============================================================
   2. Render Likert Scale Questions (Mobile Touch Optimized)
   ============================================================ */
function renderLikertQuestions() {
    const container = document.getElementById("likert-questions-container");
    if (!container) return;

    container.innerHTML = QUESTION_LIST.map((q, index) => {
        return `
        <div class="smart-card p-4 sm:p-7 question-card" id="card-${q.id}">
            <!-- Header Pertanyaan -->
            <div class="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div class="flex items-center gap-2">
                    <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        ${q.code}
                    </span>
                    <div>
                        <span class="text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>${q.icon}</span> ${q.category}
                        </span>
                    </div>
                </div>
                <span class="text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    ${index + 1} / ${QUESTION_LIST.length}
                </span>
            </div>

            <!-- Teks Pertanyaan -->
            <h3 class="text-sm sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                ${q.text}
            </h3>

            <!-- Panduan Indikator Skala -->
            <div class="flex justify-between items-center text-[10px] sm:text-xs text-slate-500 mb-2.5 pt-0.5">
                <span class="text-rose-600 font-semibold truncate max-w-[48%]">1: ${q.labelMin}</span>
                <span class="text-emerald-700 font-bold truncate max-w-[48%] text-right">5: ${q.labelMax}</span>
            </div>

            <!-- 5-Pill Interactive Matrix (Touch Friendly) -->
            <div class="likert-grid mb-2">
                ${LIKERT_OPTIONS.map(opt => `
                    <div 
                        class="likert-pill" 
                        data-qid="${q.id}" 
                        data-value="${opt.value}"
                        onclick="selectLikertRating('${q.id}', ${opt.value})"
                        id="pill-${q.id}-${opt.value}"
                    >
                        <span class="text-xl sm:text-2xl mb-0.5">${opt.emoji}</span>
                        <div class="pill-number mb-0.5">${opt.value}</div>
                        <span class="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight block truncate w-full px-0.5">${opt.shortLabel}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Dynamic Feedback Pill -->
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div class="selected-feedback text-slate-400 font-medium text-[11px] sm:text-xs" id="feedback-${q.id}">
                    Belum dinilai
                </div>
                <div class="error-msg hidden text-rose-600 font-bold text-[11px] sm:text-xs flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    <span>Wajib dinilai (1 - 5)</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function selectLikertRating(questionId, value) {
    state.formData.answers[questionId] = Number(value);

    // Update UI pills
    document.querySelectorAll(`[data-qid="${questionId}"]`).forEach(el => {
        el.classList.remove("is-selected");
    });

    const selectedPill = document.getElementById(`pill-${questionId}-${value}`);
    if (selectedPill) {
        selectedPill.classList.add("is-selected");
    }

    // Update dynamic feedback
    const opt = LIKERT_OPTIONS.find(o => o.value === Number(value));
    const feedbackEl = document.getElementById(`feedback-${questionId}`);
    if (feedbackEl && opt) {
        feedbackEl.innerHTML = `<span class="text-emerald-700 font-bold flex items-center gap-1.5">
            <span class="text-sm sm:text-base">${opt.emoji}</span> Nilai: <strong>${opt.value} - ${opt.fullLabel}</strong>
        </span>`;
    }

    // Clear error
    const card = document.getElementById(`card-${questionId}`);
    if (card) {
        card.classList.remove("card-error");
        const errMsg = card.querySelector(".error-msg");
        if (errMsg) errMsg.classList.add("hidden");
    }

    updateAnswerCountDock();
}

/* ============================================================
   3. Event Handlers & Stepper Navigation
   ============================================================ */
function initEventListeners() {
    // Tombol Next Step 1
    const btnNext1 = document.getElementById("btn-next-step");
    if (btnNext1) {
        btnNext1.addEventListener("click", handleNextToStep2);
    }

    // Tombol Back Step 2
    const btnBack2 = document.getElementById("btn-back-step");
    if (btnBack2) {
        btnBack2.addEventListener("click", () => goToStep(1));
    }

    // Tombol Submit Step 2
    const btnSubmit = document.getElementById("btn-submit-form");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", handleSubmitForm);
    }

    // Tombol Isi Baru di Layar Hasil
    const btnNew = document.getElementById("btn-new-response");
    if (btnNew) {
        btnNew.addEventListener("click", resetFormToStart);
    }

    // Choice Cards Jenjang
    document.querySelectorAll(".choice-card-status").forEach(card => {
        card.addEventListener("click", () => {
            selectStatusChoice(card.dataset.value);
        });
    });

    // Brand Choice Cards (Gojek, Grab, Maxim)
    document.querySelectorAll(".brand-choice-card").forEach(card => {
        card.addEventListener("click", () => {
            selectAppChoice(card.dataset.value);
        });
    });

    // Admin Filters
    const searchInput = document.getElementById("admin-search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            state.tableFilters.search = e.target.value.toLowerCase();
            renderAdminTable();
        });
    }

    const filterStatus = document.getElementById("admin-filter-status");
    if (filterStatus) {
        filterStatus.addEventListener("change", (e) => {
            state.tableFilters.status = e.target.value;
            renderAdminTable();
        });
    }

    const sortSelect = document.getElementById("admin-sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            state.tableFilters.sort = e.target.value;
            renderAdminTable();
        });
    }
}

function selectStatusChoice(value) {
    state.formData.status = value;
    document.querySelectorAll(".choice-card-status").forEach(c => {
        c.classList.toggle("is-selected", c.dataset.value === value);
    });
    const cardStatus = document.getElementById("card-status");
    if (cardStatus) {
        cardStatus.classList.remove("card-error");
        const err = cardStatus.querySelector(".error-msg");
        if (err) err.classList.add("hidden");
    }
}

function selectAppChoice(value) {
    state.formData.favoriteApp = value;
    document.querySelectorAll(".brand-choice-card").forEach(c => {
        c.classList.toggle("is-selected", c.dataset.value === value);
    });
}

function handleNextToStep2() {
    const nameInput = document.getElementById("input-nama");
    const ageInput = document.getElementById("input-umur");

    let isValid = true;

    document.querySelectorAll("#step-1-content .smart-card").forEach(c => c.classList.remove("card-error"));
    document.querySelectorAll("#step-1-content .error-msg").forEach(e => e.classList.add("hidden"));

    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (!nameVal) {
        isValid = false;
        showCardError("card-nama", "Nama lengkap wajib diisi.");
    }

    const ageVal = ageInput ? parseInt(ageInput.value, 10) : 0;
    if (!ageVal || ageVal < 10 || ageVal > 95) {
        isValid = false;
        showCardError("card-umur", "Masukkan umur yang valid (10 - 95 tahun).");
    }

    if (!state.formData.status) {
        isValid = false;
        showCardError("card-status", "Silakan pilih salah satu status aktivitas Anda.");
    }

    if (!isValid) {
        const firstErr = document.querySelector("#step-1-content .card-error");
        if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    state.formData.name = nameVal;
    state.formData.age = ageVal;

    goToStep(2);
}

function showCardError(cardId, message) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.add("card-error");
        const errEl = card.querySelector(".error-msg");
        if (errEl) {
            if (message) errEl.querySelector("span").textContent = message;
            errEl.classList.remove("hidden");
        }
    }
}

function goToStep(stepNumber) {
    state.currentStep = stepNumber;

    const step1 = document.getElementById("step-1-content");
    const step2 = document.getElementById("step-2-content");
    const step3 = document.getElementById("step-3-content");

    if (step1) step1.classList.toggle("hidden", stepNumber !== 1);
    if (step2) step2.classList.toggle("hidden", stepNumber !== 2);
    if (step3) step3.classList.toggle("hidden", stepNumber !== 3);

    updateStepperUI();
    updateAnswerCountDock();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStepperUI() {
    const step1El = document.getElementById("stepper-item-1");
    const step2El = document.getElementById("stepper-item-2");
    const step3El = document.getElementById("stepper-item-3");

    if (step1El) {
        step1El.classList.toggle("is-active", state.currentStep === 1);
        step1El.classList.toggle("is-done", state.currentStep > 1);
    }
    if (step2El) {
        step2El.classList.toggle("is-active", state.currentStep === 2);
        step2El.classList.toggle("is-done", state.currentStep > 2);
    }
    if (step3El) {
        step3El.classList.toggle("is-active", state.currentStep === 3);
        step3El.classList.toggle("is-done", state.currentStep === 3);
    }

    const progressBar = document.getElementById("stepper-progress-fill");
    if (progressBar) {
        if (state.currentStep === 1) progressBar.style.width = "33%";
        else if (state.currentStep === 2) progressBar.style.width = "66%";
        else progressBar.style.width = "100%";
    }
}

function updateAnswerCountDock() {
    const dockText = document.getElementById("dock-answered-text");
    const dockProgress = document.getElementById("dock-progress-bar");
    if (!dockText) return;

    const answered = Object.keys(state.formData.answers).length;
    const total = QUESTION_LIST.length;
    const pct = Math.round((answered / total) * 100);

    dockText.innerHTML = `<strong>${answered}</strong> dari ${total} dinilai (${pct}%)`;
    if (dockProgress) {
        dockProgress.style.width = `${pct}%`;
    }
}

/* ============================================================
   4. Submit, SPK Engine, & Cloud Sync to Google Sheets
   ============================================================ */
function handleSubmitForm() {
    let allAnswered = true;
    let firstUnanswered = null;

    QUESTION_LIST.forEach(q => {
        const card = document.getElementById(`card-${q.id}`);
        if (!state.formData.answers[q.id]) {
            allAnswered = false;
            if (card) {
                card.classList.add("card-error");
                const errMsg = card.querySelector(".error-msg");
                if (errMsg) errMsg.classList.remove("hidden");
                if (!firstUnanswered) firstUnanswered = card;
            }
        }
    });

    if (!allAnswered) {
        if (firstUnanswered) {
            firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
    }

    // 1. Eksekusi Engine Rekomendasi SPK
    const spkResult = calculateSPKRecommendation(state.formData.answers, state.formData.status);
    state.currentRecommendation = spkResult;

    // 2. Kalkulasi Skor & Buat Responden Baru
    const avgScore = calculateAverage(state.formData.answers);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const randomSerial = String(Math.floor(100 + Math.random() * 900));
    const newId = `SR-${dateCode}-${randomSerial}`;

    const newRespondent = {
        id: newId,
        submittedAt: now.toISOString(),
        name: state.formData.name,
        age: Number(state.formData.age),
        status: state.formData.status,
        favoriteApp: state.formData.favoriteApp,
        answers: { ...state.formData.answers },
        averageScore: avgScore,
        recommendedApp: spkResult.topRecommendation.name,
        recommendationScore: spkResult.topRecommendation.matchPercentage,
        isUserSubmission: true // Penanda khusus data yang baru saja dikirim oleh user
    };

    // Pastikan data termutakhir dimuat dari localStorage sebelum menambah
    initData();

    // Tambahkan data baru di posisi paling atas (index 0)
    state.respondents.unshift(newRespondent);
    state.lastSubmittedId = newRespondent.id;
    localStorage.setItem(STORAGE_KEY_LAST_SUBMITTED, newRespondent.id);

    // Simpan permanen ke LocalStorage perangkat saat ini
    saveRespondents();

    // 3. KIRIM LANGSUNG KE GOOGLE SHEETS (Cloud Sync)
    sendToGoogleSheets(newRespondent);

    // 4. Render Hasil Rekomendasi ke Layar Step 3
    renderRecommendationResult(spkResult, newRespondent);

    goToStep(3);
    triggerConfetti();
}

/**
 * Kirim Data Responden ke Google Sheets Apps Script Webhook
 */
function sendToGoogleSheets(respondent) {
    if (!GOOGLE_SHEETS_URL) return;

    try {
        fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(respondent)
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Berhasil tersinkronisasi ke Google Sheets:", data);
            const cloudBadge = document.getElementById("confirm-cloud-badge");
            if (cloudBadge) cloudBadge.classList.remove("hidden");
        })
        .catch(err => {
            console.warn("⚠️ Pengiriman ke Google Sheets diproses asinkron:", err);
        });
    } catch (e) {
        console.warn("Error pengiriman ke Google Sheets:", e);
    }
}

/**
 * Tarik Data Responden Terbaru dari Google Sheets ke Dashboard Admin
 */
async function syncGoogleSheetsData(showNotification = false) {
    if (!GOOGLE_SHEETS_URL) return;

    const btnText = document.getElementById("sync-btn-text");
    const spinner = document.getElementById("sync-spinner");
    if (spinner) spinner.classList.add("animate-spin");
    if (btnText) btnText.textContent = "Menghubungkan...";

    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const cloudData = await response.json();

        if (Array.isArray(cloudData) && cloudData.length > 0) {
            let addedCount = 0;
            // Gabungkan data dari Google Sheets yang belum ada di local respondents
            cloudData.forEach(cloudRow => {
                if (!cloudRow || !cloudRow.id) return;
                cloudRow.age = Number(cloudRow.age) || 0;
                cloudRow.averageScore = Number(cloudRow.averageScore) || 0;
                if (typeof cloudRow.answers === 'string') {
                    try { cloudRow.answers = JSON.parse(cloudRow.answers); } catch (e) { cloudRow.answers = {}; }
                } else if (!cloudRow.answers) {
                    cloudRow.answers = {};
                }

                const exists = state.respondents.some(r => r.id === cloudRow.id);
                if (!exists) {
                    state.respondents.unshift(cloudRow);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                saveRespondents();
            }

            calculateAndRenderMetrics();
            renderCriteriaAnalytics();
            renderAdminTable();

            if (showNotification) {
                alert(`✅ Sinkronisasi Berhasil!\n${cloudData.length} data responden dari Google Sheets terhubung (${addedCount} data baru ditambahkan ke dashboard).`);
            }
        } else {
            if (showNotification) {
                alert("✅ Google Sheets terhubung! Belum ada data baru di spreadsheet.");
            }
        }
    } catch (error) {
        console.warn("Gagal mengambil data dari Google Sheets:", error);
        if (showNotification) {
            alert("Gagal menghubungi Google Sheets. Periksa koneksi internet Anda.");
        }
    } finally {
        if (spinner) spinner.classList.remove("animate-spin");
        if (btnText) btnText.textContent = "Sinkronkan Cloud";
    }
}

/**
 * Render Tampilan Rekomendasi Modern ke Layar Konfirmasi
 */
function renderRecommendationResult(spkResult, respondent) {
    const winner = spkResult.topRecommendation;

    const winName = document.getElementById("recom-winner-name");
    const winMatch = document.getElementById("recom-winner-match");
    const winTagline = document.getElementById("recom-winner-tagline");
    const winDesc = document.getElementById("recom-winner-desc");
    const winLogo = document.getElementById("recom-winner-logo");

    if (winName) winName.textContent = winner.name;
    if (winMatch) winMatch.textContent = `${winner.matchPercentage}% Cocok`;
    if (winTagline) winTagline.textContent = winner.tagline;
    if (winDesc) winDesc.textContent = winner.description;
    if (winLogo) {
        if (winner.name === "Gojek") winLogo.innerHTML = `<span class="text-3xl">🟢</span>`;
        else if (winner.name === "Grab") winLogo.innerHTML = `<span class="text-3xl">🟢</span>`;
        else winLogo.innerHTML = `<span class="text-3xl">🟡</span>`;
    }

    // Perbandingan 3 Alternatif (Gojek, Grab, Maxim)
    const listContainer = document.getElementById("recom-comparison-list");
    if (listContainer) {
        listContainer.innerHTML = spkResult.allRankings.map((alt, idx) => {
            const rankLabel = idx === 0 ? "🥇 Rekomendasi Utama" : idx === 1 ? "🥈 Alternatif Baik" : "🥉 Alternatif Hemat";
            let barColor = "from-emerald-500 to-teal-600";
            let brandBadge = "bg-emerald-100 text-emerald-800";

            if (alt.name === "Gojek") {
                barColor = "from-emerald-600 to-green-500";
                brandBadge = "bg-green-100 text-green-800";
            } else if (alt.name === "Grab") {
                barColor = "from-teal-600 to-emerald-500";
                brandBadge = "bg-teal-100 text-teal-800";
            } else if (alt.name === "Maxim") {
                barColor = "from-amber-500 to-yellow-400";
                brandBadge = "bg-amber-100 text-amber-900";
            }

            return `
            <div class="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <div class="flex items-center justify-between text-xs mb-1.5">
                    <div class="flex items-center gap-2">
                        <span class="font-extrabold text-slate-800">${alt.name}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${brandBadge}">${rankLabel}</span>
                    </div>
                    <span class="font-extrabold text-sm text-slate-900">${alt.matchPercentage}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-gradient-to-r ${barColor} h-2.5 rounded-full transition-all duration-700" style="width: ${alt.matchPercentage}%"></div>
                </div>
            </div>
            `;
        }).join('');
    }

    // Data Tiket Responden
    const resId = document.getElementById("confirm-id");
    const resName = document.getElementById("confirm-name");
    const resProfile = document.getElementById("confirm-profile");
    const resScore = document.getElementById("confirm-score");

    if (resId) resId.textContent = respondent.id;
    if (resName) resName.textContent = respondent.name;
    if (resProfile) resProfile.textContent = `${respondent.status} (${respondent.age} th) • Saat ini pakai ${respondent.favoriteApp}`;
    if (resScore) resScore.textContent = `★ ${respondent.averageScore.toFixed(2)} / 5.0`;
}

function resetFormToStart() {
    const form = document.getElementById("smartride-form");
    if (form) form.reset();

    state.formData = {
        name: "",
        age: "",
        status: "",
        favoriteApp: "Gojek",
        answers: {}
    };

    document.querySelectorAll(".choice-card-status").forEach(c => c.classList.remove("is-selected"));
    document.querySelectorAll(".brand-choice-card").forEach(c => {
        c.classList.toggle("is-selected", c.dataset.value === "Gojek");
    });

    document.querySelectorAll(".likert-pill").forEach(p => p.classList.remove("is-selected"));
    document.querySelectorAll(".selected-feedback").forEach(f => f.textContent = "Belum dinilai");
    document.querySelectorAll(".card-error").forEach(c => c.classList.remove("card-error"));
    document.querySelectorAll(".error-msg").forEach(e => e.classList.add("hidden"));

    goToStep(1);
}

/* ============================================================
   5. Confetti Animation (Pure Canvas)
   ============================================================ */
function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#00aa13", "#00b14f", "#ffc800", "#059669", "#10b981", "#3b82f6", "#f59e0b"];

    for (let i = 0; i < 80; i++) {
        pieces.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 18,
            size: Math.random() * 7 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 10
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.45;
            p.rotation += p.vRot;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        frame++;
        if (frame < 120) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

/* ============================================================
   6. View Navigation (Kuesioner vs Admin)
   ============================================================ */
function switchView(viewName) {
    if (viewName === "admin" && !state.isAdminLoggedIn) {
        openAdminLoginModal();
        return;
    }

    state.currentView = viewName;
    const questionnaireView = document.getElementById("view-questionnaire");
    const adminView = document.getElementById("view-admin");

    if (questionnaireView) questionnaireView.classList.toggle("hidden", viewName !== "kuesioner");
    if (adminView) adminView.classList.toggle("hidden", viewName !== "admin");

    const navBtnForm = document.getElementById("nav-btn-form");
    const navBtnAdmin = document.getElementById("nav-btn-admin");

    if (navBtnForm && navBtnAdmin) {
        if (viewName === "kuesioner") {
            navBtnForm.className = "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5";
            navBtnAdmin.className = "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1.5";
        } else {
            navBtnForm.className = "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1.5";
            navBtnAdmin.className = "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5";
        }
    }

    if (viewName === "admin") {
        renderAdminDashboard();
    }
}

function updateAdminNavUI() {
    const adminBadge = document.getElementById("admin-logged-badge");
    if (adminBadge) {
        adminBadge.classList.toggle("hidden", !state.isAdminLoggedIn);
    }
}

/* ============================================================
   7. Admin Authentication (Privasi Dirahasiakan)
   ============================================================ */
function openAdminLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
        modal.classList.remove("hidden");
        const userInp = document.getElementById("admin-username");
        if (userInp) {
            userInp.value = "";
            userInp.focus();
        }
        const passInp = document.getElementById("admin-password");
        if (passInp) passInp.value = "";
        const errEl = document.getElementById("admin-login-error");
        if (errEl) errEl.classList.add("hidden");
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) modal.classList.add("hidden");
}

function handleAdminLogin(event) {
    if (event) event.preventDefault();
    const userInp = document.getElementById("admin-username");
    const passInp = document.getElementById("admin-password");
    const errEl = document.getElementById("admin-login-error");

    const username = userInp ? userInp.value.trim() : "";
    const password = passInp ? passInp.value.trim() : "";

    // Kredensial Khusus Kelompok / Admin (Dirahasiakan, tidak dibocorkan di UI)
    if ((username === "admin" && password === "smartride123") || (username === "admin" && password === "admin")) {
        state.isAdminLoggedIn = true;
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, "true");
        updateAdminNavUI();
        closeAdminLoginModal();
        switchView("admin");
    } else {
        if (errEl) {
            errEl.textContent = "Username atau Password salah. Akses dibatasi untuk tim administrator.";
            errEl.classList.remove("hidden");
        }
    }
}

function handleAdminLogout() {
    state.isAdminLoggedIn = false;
    localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    updateAdminNavUI();
    switchView("kuesioner");
}

/* ============================================================
   8. Admin Dashboard Analytics & Cloud Auto-Sync
   ============================================================ */
function renderAdminDashboard() {
    // 1. Muat data instan dari LocalStorage agar dashboard langsung muncul tanpa jeda
    initData();
    calculateAndRenderMetrics();
    renderCriteriaAnalytics();
    renderAdminTable();

    // 2. Tarik data terbaru dari Google Sheets secara background
    syncGoogleSheetsData(false);
}

function calculateAndRenderMetrics() {
    const total = state.respondents.length;
    const totalEl = document.getElementById("metric-total-respondents");
    if (totalEl) totalEl.textContent = total;

    const overallAvg = total > 0 
        ? (state.respondents.reduce((sum, r) => sum + Number(r.averageScore || 0), 0) / total).toFixed(2)
        : "0.00";
    const avgEl = document.getElementById("metric-overall-score");
    if (avgEl) avgEl.textContent = `${overallAvg}`;

    const countSekolah = state.respondents.filter(r => r.status === "Sekolah").length;
    const countKuliah = state.respondents.filter(r => r.status === "Kuliah").length;
    const countKerja = state.respondents.filter(r => r.status === "Kerja").length;
    const countLainnya = state.respondents.filter(r => r.status === "Lainnya").length;

    setMetricCount("metric-sekolah-count", countSekolah, total);
    setMetricCount("metric-kuliah-count", countKuliah, total);
    setMetricCount("metric-kerja-count", countKerja, total);
    setMetricCount("metric-lainnya-count", countLainnya, total);

    // Rekomendasi Terbanyak
    const countGojek = state.respondents.filter(r => r.recommendedApp === "Gojek").length;
    const countGrab = state.respondents.filter(r => r.recommendedApp === "Grab").length;
    const countMaxim = state.respondents.filter(r => r.recommendedApp === "Maxim").length;

    const recBreakdownEl = document.getElementById("metric-recommendation-breakdown");
    if (recBreakdownEl && total > 0) {
        recBreakdownEl.innerHTML = `
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Gojek: ${countGojek} (${Math.round(countGojek/total*100)}%)</span>
                <span class="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold">Grab: ${countGrab} (${Math.round(countGrab/total*100)}%)</span>
                <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">Maxim: ${countMaxim} (${Math.round(countMaxim/total*100)}%)</span>
            </div>
        `;
    }
}

function setMetricCount(elementId, count, total) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    el.innerHTML = `<span class="text-xl sm:text-2xl font-bold text-slate-900">${count}</span> <span class="text-xs text-slate-400 font-medium">(${pct}%)</span>`;
}

function renderCriteriaAnalytics() {
    const container = document.getElementById("criteria-analytics-list");
    if (!container) return;

    if (state.respondents.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs">Belum ada data evaluasi yang terekam.</div>`;
        return;
    }

    const total = state.respondents.length;

    const criteriaStats = QUESTION_LIST.map(q => {
        const sumScore = state.respondents.reduce((acc, r) => acc + (r.answers[q.id] || 0), 0);
        const avgScore = Number((sumScore / total).toFixed(2));
        const percentage = Math.round((avgScore / 5) * 100);
        return { ...q, avgScore, percentage };
    });

    container.innerHTML = criteriaStats.map(stat => {
        let tagClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
        let barClass = "from-emerald-500 to-teal-600";
        if (stat.avgScore < 3.5) {
            tagClass = "bg-amber-50 text-amber-800 border-amber-200";
            barClass = "from-amber-400 to-orange-500";
        }

        return `
        <div class="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div class="flex items-center justify-between text-xs mb-1.5">
                <div class="flex items-center gap-1.5 truncate max-w-[70%]">
                    <span class="text-sm shrink-0">${stat.icon}</span>
                    <span class="font-bold text-slate-800 truncate">[${stat.code}] ${stat.category}</span>
                </div>
                <span class="font-bold px-2 py-0.5 rounded-full border text-[11px] shrink-0 ${tagClass}">
                    ★ ${stat.avgScore.toFixed(2)} (${stat.percentage}%)
                </span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="bg-gradient-to-r ${barClass} h-2 rounded-full transition-all duration-500" style="width: ${stat.percentage}%"></div>
            </div>
        </div>
        `;
    }).join('');
}

/* ============================================================
   9. Admin Table & Mobile Card View Management
   ============================================================ */
function renderAdminTable() {
    const tbody = document.getElementById("table-respondents-body");
    const mobileCardsContainer = document.getElementById("mobile-respondents-cards");
    const countInfo = document.getElementById("table-filtered-count");
    if (!tbody) return;

    let filtered = [...state.respondents];

    // Filter Search
    if (state.tableFilters.search) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(state.tableFilters.search) ||
            r.id.toLowerCase().includes(state.tableFilters.search)
        );
    }

    // Filter Status
    if (state.tableFilters.status !== "all") {
        filtered = filtered.filter(r => r.status === state.tableFilters.status);
    }

    // Sorting (Newest mendahulukan data asli kiriman user atau timestamp terbaru)
    filtered.sort((a, b) => {
        if (state.tableFilters.sort === "newest") {
            if (a.id === state.lastSubmittedId) return -1;
            if (b.id === state.lastSubmittedId) return 1;
            return new Date(b.submittedAt) - new Date(a.submittedAt);
        }
        if (state.tableFilters.sort === "oldest") return new Date(a.submittedAt) - new Date(b.submittedAt);
        if (state.tableFilters.sort === "highest") return (Number(b.averageScore) || 0) - (Number(a.averageScore) || 0);
        if (state.tableFilters.sort === "lowest") return (Number(a.averageScore) || 0) - (Number(b.averageScore) || 0);
        return 0;
    });

    if (countInfo) {
        countInfo.textContent = `Menampilkan ${filtered.length} dari ${state.respondents.length} total responden (Terkoneksi Google Sheets)`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-10 text-slate-400 text-sm">
                    Tidak ada responden yang sesuai filter.
                </td>
            </tr>
        `;
        if (mobileCardsContainer) {
            mobileCardsContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-xs">
                    Tidak ada responden yang sesuai filter.
                </div>
            `;
        }
        return;
    }

    // 1. RENDER DESKTOP TABLE VIEW
    tbody.innerHTML = filtered.map((r, index) => {
        const dateObj = new Date(r.submittedAt);
        const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        const initials = r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

        let statusClass = "bg-slate-100 text-slate-800";
        if (r.status === "Sekolah") statusClass = "bg-blue-50 text-blue-700 border-blue-200";
        if (r.status === "Kuliah") statusClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
        if (r.status === "Kerja") statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

        let recBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
        if (r.recommendedApp === "Grab") recBadge = "bg-teal-100 text-teal-800 border-teal-300";
        if (r.recommendedApp === "Maxim") recBadge = "bg-amber-100 text-amber-900 border-amber-300";

        const isNewHighlight = (r.id === state.lastSubmittedId || r.isUserSubmission);

        return `
        <tr class="hover:bg-slate-50/70 transition-colors border-b border-slate-100 ${isNewHighlight ? 'bg-emerald-50/40' : ''}">
            <td class="py-3 px-4 text-xs text-slate-400 text-center font-mono">
                ${index + 1}
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        ${initials}
                    </div>
                    <div>
                        <div class="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>${escapeHTML(r.name)}</span>
                            ${isNewHighlight ? '<span class="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black text-[9px]">BARU</span>' : ''}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono">${r.id}</div>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4 text-xs text-slate-600 text-center">${r.age} th</td>
            <td class="py-3 px-4 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}">
                    ${r.status}
                </span>
                <span class="text-[11px] text-slate-400 block mt-0.5 font-medium">Pakai: ${r.favoriteApp || '-'}</span>
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${recBadge}">
                    ★ ${r.recommendedApp || 'Gojek'}
                </span>
            </td>
            <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                ${formattedDate}
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                    <button 
                        type="button" 
                        class="px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-2xs"
                        onclick="showRespondentDetailModal('${r.id}')"
                    >
                        Detail
                    </button>
                    <button 
                        type="button" 
                        class="p-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 transition"
                        onclick="deleteRespondent('${r.id}')"
                        title="Hapus"
                    >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    // 2. RENDER MOBILE CARD VIEW (Khusus Layar HP)
    if (mobileCardsContainer) {
        mobileCardsContainer.innerHTML = filtered.map((r) => {
            const dateObj = new Date(r.submittedAt);
            const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
            const initials = r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

            let statusClass = "bg-slate-100 text-slate-800";
            if (r.status === "Sekolah") statusClass = "bg-blue-50 text-blue-700 border-blue-200";
            if (r.status === "Kuliah") statusClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
            if (r.status === "Kerja") statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

            let recBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
            if (r.recommendedApp === "Grab") recBadge = "bg-teal-100 text-teal-800 border-teal-300";
            if (r.recommendedApp === "Maxim") recBadge = "bg-amber-100 text-amber-900 border-amber-300";

            const isNewHighlight = (r.id === state.lastSubmittedId || r.isUserSubmission);

            return `
            <div class="respondent-mobile-card ${isNewHighlight ? 'border-emerald-300 bg-emerald-50/20' : ''}">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            ${initials}
                        </div>
                        <div>
                            <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>${escapeHTML(r.name)}</span>
                                ${isNewHighlight ? '<span class="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-extrabold text-[9px]">BARU</span>' : ''}
                            </div>
                            <span class="text-[10px] text-slate-400 font-mono">${r.id} • ${formattedDate}</span>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        ★ ${(Number(r.averageScore) || 0).toFixed(2)}
                    </span>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-1.5 text-xs pt-2 border-t border-slate-100">
                    <div class="flex items-center gap-1.5">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass}">
                            ${r.status} (${r.age} th)
                        </span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${recBadge}">
                            SPK: ${r.recommendedApp || 'Gojek'}
                        </span>
                    </div>

                    <div class="flex items-center gap-1">
                        <button 
                            type="button" 
                            class="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 text-white font-bold transition shadow-2xs"
                            onclick="showRespondentDetailModal('${r.id}')"
                        >
                            Detail
                        </button>
                        <button 
                            type="button" 
                            class="p-1 text-xs rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                            onclick="deleteRespondent('${r.id}')"
                        >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
}

/* ============================================================
   10. Modal Detail, CSV Export & Backup Tools
   ============================================================ */
function showRespondentDetailModal(respondentId) {
    const respondent = state.respondents.find(r => r.id === respondentId);
    if (!respondent) return;

    const modal = document.getElementById("detail-modal");
    if (!modal) return;

    const nameEl = document.getElementById("detail-name");
    const idEl = document.getElementById("detail-id");
    const timeEl = document.getElementById("detail-time");
    const statusEl = document.getElementById("detail-status");
    const ageEl = document.getElementById("detail-age");
    const favAppEl = document.getElementById("detail-favapp");
    const recAppEl = document.getElementById("detail-recapp");
    const avgScoreEl = document.getElementById("detail-avgscore");
    const answersContainer = document.getElementById("detail-answers-list");

    if (nameEl) nameEl.textContent = respondent.name;
    if (idEl) idEl.textContent = respondent.id;
    if (timeEl) timeEl.textContent = new Date(respondent.submittedAt).toLocaleString("id-ID");
    if (statusEl) statusEl.textContent = respondent.status;
    if (ageEl) ageEl.textContent = `${respondent.age} Tahun`;
    if (favAppEl) favAppEl.textContent = respondent.favoriteApp || "Gojek";
    if (recAppEl) recAppEl.textContent = respondent.recommendedApp || "Gojek";
    if (avgScoreEl) avgScoreEl.textContent = `${(Number(respondent.averageScore) || 0).toFixed(2)} / 5.00`;

    if (answersContainer) {
        answersContainer.innerHTML = QUESTION_LIST.map((q) => {
            const val = respondent.answers[q.id] || 0;
            const opt = LIKERT_OPTIONS.find(l => l.value === val);
            return `
            <div class="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                <div class="truncate max-w-[70%]">
                    <div class="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span>${q.icon}</span> [${q.code}] ${q.category}
                    </div>
                    <p class="text-slate-500 text-[11px] mt-0.5 truncate">${q.text}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-slate-600 font-semibold text-[11px] sm:text-xs">${opt?.emoji || ''}</span>
                    <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                        ${val}
                    </span>
                </div>
            </div>
            `;
        }).join('');
    }

    modal.classList.remove("hidden");
}

function closeRespondentDetailModal() {
    const modal = document.getElementById("detail-modal");
    if (modal) modal.classList.add("hidden");
}

function deleteRespondent(id) {
    if (!confirm(`Hapus data responden ${id}?`)) return;
    state.respondents = state.respondents.filter(r => r.id !== id);
    saveRespondents();
    renderAdminDashboard();
}

function exportRespondentsToCSV() {
    if (state.respondents.length === 0) {
        alert("Belum ada data untuk diekspor.");
        return;
    }

    const headers = [
        "No",
        "ID Responden",
        "Waktu Pengisian",
        "Nama Responden",
        "Umur",
        "Jenjang",
        "Layanan Favorit",
        "Rekomendasi SPK",
        ...QUESTION_LIST.map(q => `${q.code}_${q.category}`),
        "Skor Rata-rata"
    ];

    const rows = state.respondents.map((r, index) => {
        const answersCols = QUESTION_LIST.map(q => r.answers[q.id] || "");
        return [
            index + 1,
            `"${r.id}"`,
            `"${new Date(r.submittedAt).toLocaleString('id-ID')}"`,
            `"${r.name.replace(/"/g, '""')}"`,
            r.age,
            `"${r.status}"`,
            `"${r.favoriteApp || ''}"`,
            `"${r.recommendedApp || 'Gojek'}"`,
            ...answersCols,
            r.averageScore.toFixed(2)
        ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `smartride_spk_responden_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function addSampleRespondent() {
    const sampleNames = ["Kevin Ardiansyah", "Tasya Kamila", "Aditya Bagus", "Farhan Maulana", "Nabila Syakieb"];
    const statuses = ["Sekolah", "Kuliah", "Kerja", "Lainnya"];
    const apps = ["Gojek", "Grab", "Maxim"];

    const rName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const rStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const rApp = apps[Math.floor(Math.random() * apps.length)];
    const rAge = rStatus === "Sekolah" ? 17 : rStatus === "Kuliah" ? 21 : 28;

    const answers = {};
    QUESTION_LIST.forEach(q => {
        answers[q.id] = 3 + Math.floor(Math.random() * 3);
    });

    const spk = calculateSPKRecommendation(answers, rStatus);

    const newRes = {
        id: `SR-${Date.now().toString().slice(-6)}`,
        submittedAt: new Date().toISOString(),
        name: rName,
        age: rAge,
        status: rStatus,
        favoriteApp: rApp,
        answers: answers,
        averageScore: calculateAverage(answers),
        recommendedApp: spk.topRecommendation.name,
        recommendationScore: spk.topRecommendation.matchPercentage,
        isUserSubmission: true
    };

    initData();
    state.respondents.unshift(newRes);
    state.lastSubmittedId = newRes.id;
    localStorage.setItem(STORAGE_KEY_LAST_SUBMITTED, newRes.id);
    saveRespondents();
    sendToGoogleSheets(newRes);
    renderAdminDashboard();
}

function resetToDefaultData() {
    if (!confirm("Kembalikan data ke 10 sampel default awal?")) return;
    state.respondents = [...DEFAULT_RESPONDENTS];
    state.lastSubmittedId = null;
    localStorage.removeItem(STORAGE_KEY_LAST_SUBMITTED);
    saveRespondents();
    renderAdminDashboard();
}

function copyConfirmationId() {
    const idEl = document.getElementById("confirm-id");
    if (!idEl) return;
    navigator.clipboard.writeText(idEl.textContent).then(() => {
        alert("ID Tiket berhasil disalin ke clipboard!");
    });
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}
