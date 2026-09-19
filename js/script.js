/**
 * SmartRide Interactive Audio & Questionnaire Engine
 */

// --- ENGINE SUARA TINGKAT LANJUT (Web Audio API Tanpa File Eksternal) ---
const SoundFX = {
  ctx: null,
  getAudio() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  },

  // Suara Click Pop Melodis (Saat memilih rating)
  playPop(pitchModifier = 1) {
    const actx = this.getAudio();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = "sine";
    const freq = 520 * pitchModifier;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 1.6,
      actx.currentTime + 0.08,
    );

    gain.gain.setValueAtTime(0.2, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start();
    osc.stop(actx.currentTime + 0.08);
  },

  // Suara Swipe/Whoosh (Saat beralih pertanyaan)
  playWhoosh() {
    const actx = this.getAudio();
    if (!actx) return;
    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(620, actx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start();
    osc.stop(actx.currentTime + 0.12);
  },
};

// 20 PERTANYAAN LENGKAP C1 - C10
const questions = [
  {
    id: "q1",
    criteria: "c1",
    category: "C1 • Tarif & Anggaran",
    title: "Keterjangkauan Tarif Per-KM",
    desc: "Seberapa penting tarif dasar per kilometer yang murah dan hemat untuk perjalanan Anda?",
    icon: "💸",
  },
  {
    id: "q2",
    criteria: "c1",
    category: "C1 • Tarif & Anggaran",
    title: "Stabilitas Harga Tanpa Lonjakan",
    desc: "Seberapa penting tarif yang stabil tanpa lonjakan drastis saat jam sibuk atau cuaca hujan?",
    icon: "📉",
  },
  {
    id: "q3",
    criteria: "c2",
    category: "C2 • Keamanan & Privasi",
    title: "Fitur Tombol Darurat (SOS)",
    desc: "Seberapa penting ketersediaan fitur tombol darurat yang terhubung langsung ke pihak berwenang?",
    icon: "🚨",
  },
  {
    id: "q4",
    criteria: "c2",
    category: "C2 • Keamanan & Privasi",
    title: "Keamanan Data Pribadi",
    desc: "Seberapa penting perlindungan nomor ponsel dan kerahasiaan riwayat rute perjalanan Anda?",
    icon: "🛡️",
  },
  {
    id: "q5",
    criteria: "c3",
    category: "C3 • Efisiensi Waktu",
    title: "Kecepatan Alokasi Driver",
    desc: "Seberapa penting sistem langsung menemukan mitra driver tanpa waktu tunggu lama?",
    icon: "⚡",
  },
  {
    id: "q6",
    criteria: "c3",
    category: "C3 • Efisiensi Waktu",
    title: "Akurasi Estimasi Waktu (ETA)",
    desc: "Seberapa penting ketepatan waktu penjemputan driver sesuai estimasi yang tertera di peta?",
    icon: "⏱️",
  },
  {
    id: "q7",
    criteria: "c4",
    category: "C4 • Kemudahan Pemesanan",
    title: "Kepraktisan Alur Pesan",
    desc: "Seberapa penting proses pemesanan kendaraan yang ringkas hanya dalam 2-3 ketukan?",
    icon: "📲",
  },
  {
    id: "q8",
    criteria: "c4",
    category: "C4 • Kemudahan Pemesanan",
    title: "Akurasi Titik GPS & Peta",
    desc: "Seberapa penting keakuratan penentuan titik jemput dan kemudahan mencari riwayat alamat?",
    icon: "📍",
  },
  {
    id: "q9",
    criteria: "c5",
    category: "C5 • Promo & Voucher",
    title: "Ketersediaan Voucher Nyata",
    desc: "Seberapa penting ketersediaan diskon berkala yang benar-benar memotong total tarif bayar?",
    icon: "🏷️",
  },
  {
    id: "q10",
    criteria: "c5",
    category: "C5 • Promo & Voucher",
    title: "Program Reward & Loyalitas",
    desc: "Seberapa penting perolehan poin perjalanan yang dapat ditukarkan dengan keuntungan khusus?",
    icon: "🎁",
  },
  {
    id: "q11",
    criteria: "c6",
    category: "C6 • Kualitas Antarmuka",
    title: "Desain Antarmuka Rapi & Bersih",
    desc: "Seberapa penting visual aplikasi yang modern, nyaman dibaca, dan bebas iklan mengganggu?",
    icon: "🎨",
  },
  {
    id: "q12",
    criteria: "c6",
    category: "C6 • Kualitas Antarmuka",
    title: "Keringanan Ukuran Aplikasi",
    desc: "Seberapa penting aplikasi berjalan responsif, tidak memakan banyak memori, dan hemat baterai?",
    icon: "📁",
  },
  {
    id: "q13",
    criteria: "c7",
    category: "C7 • Metode Pembayaran",
    title: "Integrasi E-Wallet Lengkap",
    desc: "Seberapa penting kemudahan transaksi nontunai instan melalui dompet digital terkemuka?",
    icon: "💳",
  },
  {
    id: "q14",
    criteria: "c7",
    category: "C7 • Metode Pembayaran",
    title: "Penerimaan Pembayaran Tunai",
    desc: "Seberapa penting keleluasaan membayar secara kas jika saldo digital sedang tidak tersedia?",
    icon: "💵",
  },
  {
    id: "q15",
    criteria: "c8",
    category: "C8 • Kenyamanan Armada",
    title: "Kelaikan & Kebersihan Armada",
    desc: "Seberapa penting kondisi fisik armada yang terawat, bersih, dan tidak bising selama perjalanan?",
    icon: "🛵",
  },
  {
    id: "q16",
    criteria: "c8",
    category: "C8 • Kenyamanan Armada",
    title: "Kelayakan Alat Keselamatan",
    desc: "Seberapa penting kelengkapan berkendara pengemudi seperti helm standar yang bersih dan wangi?",
    icon: "🪖",
  },
  {
    id: "q17",
    criteria: "c9",
    category: "C9 • Layanan Bantuan",
    title: "Kecepatan Respon Keluhan",
    desc: "Seberapa penting keluhan ditangani secara sigap oleh tim customer care yang responsif?",
    icon: "🎧",
  },
  {
    id: "q18",
    criteria: "c9",
    category: "C9 • Layanan Bantuan",
    title: "Bantuan Penemuan Barang Hilang",
    desc: "Seberapa penting prosedur pelacakan dan pengembalian barang tertinggal yang jelas dan aman?",
    icon: "💼",
  },
  {
    id: "q19",
    criteria: "c10",
    category: "C10 • Ketersediaan Armada",
    title: "Ketersediaan Armada Jam Sibuk",
    desc: "Seberapa penting kemudahan mendapatkan tumpangan pada saat peak hour atau larut malam?",
    icon: "🌙",
  },
  {
    id: "q20",
    criteria: "c10",
    category: "C10 • Ketersediaan Armada",
    title: "Jangkauan Area Pemukiman",
    desc: "Seberapa penting ketersediaan armada di wilayah pemukiman yang jauh dari jalan protokol?",
    icon: "🗺️",
  },
];

let currentIndex = 0;
let userAnswers = {};
questions.forEach((q) => {
  userAnswers[q.id] = 3;
});

function renderQuestion() {
  const q = questions[currentIndex];

  const currentIdxEl = document.getElementById("current-q-index");
  const totalQEl = document.getElementById("total-q");
  const progressBarEl = document.getElementById("progress-bar");
  const progressPercentEl = document.getElementById("progress-percent");

  if (currentIdxEl) currentIdxEl.textContent = currentIndex + 1;
  if (totalQEl) totalQEl.textContent = questions.length;

  const pct = Math.round(((currentIndex + 1) / questions.length) * 100);
  if (progressBarEl) progressBarEl.style.width = pct + "%";
  if (progressPercentEl) progressPercentEl.textContent = pct + "% Selesai";

  const iconEl = document.getElementById("q-icon");
  const catEl = document.getElementById("q-category");
  const titleEl = document.getElementById("q-title");
  const descEl = document.getElementById("q-desc");

  if (iconEl) iconEl.textContent = q.icon;
  if (catEl) catEl.textContent = q.category;
  if (titleEl) titleEl.textContent = q.title;
  if (descEl) descEl.textContent = q.desc;

  const optionsGroup = document.getElementById("options-group");
  if (optionsGroup) {
    const labels = [
      "Sangat Tidak Penting",
      "Tidak Penting",
      "Cukup Penting",
      "Penting",
      "Sangat Penting",
    ];
    const currentVal = userAnswers[q.id];
    let buttonsHTML = "";

    for (let i = 1; i <= 5; i++) {
      const isActive = currentVal === i ? "active" : "";
      buttonsHTML += `
        <button type="button" class="rating-btn ${isActive}" onclick="selectRating(${i})">
          <strong class="val">${i}</strong>
          <small class="label">${labels[i - 1]}</small>
        </button>
      `;
    }
    optionsGroup.innerHTML = buttonsHTML;
  }

  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");

  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) {
    nextBtn.innerHTML =
      currentIndex === questions.length - 1
        ? "Selesai & Lihat Rekomendasi 🏆"
        : "Lanjut →";
  }
}

function selectRating(val) {
  // Bunyikan audio pop sesuai bobot nilai (semakin tinggi semakin nyaring)
  SoundFX.playPop(0.8 + val * 0.15);

  const currentQ = questions[currentIndex];
  userAnswers[currentQ.id] = val;

  const btns = document.querySelectorAll("#options-group .rating-btn");
  btns.forEach((btn, idx) => {
    btn.classList.toggle("active", idx + 1 === val);
  });

  // Animasi halus & otomatis lanjut
  setTimeout(() => {
    if (currentIndex < questions.length - 1) {
      SoundFX.playWhoosh();
      currentIndex++;
      renderQuestion();
    }
  }, 260);
}

function nextQuestion() {
  SoundFX.playWhoosh();
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    // Selesai: kalkulasi 10 kriteria
    const preferences = {};
    for (let i = 1; i <= 10; i++) {
      const cKey = `c${i}`;
      const relevant = questions
        .filter((q) => q.criteria === cKey)
        .map((q) => userAnswers[q.id]);
      const avg = relevant.reduce((sum, v) => sum + v, 0) / relevant.length;
      preferences[cKey] = parseFloat(avg.toFixed(3));
    }
    localStorage.setItem(
      "smartride_user_preferences",
      JSON.stringify(preferences),
    );
    window.location.href = "hasil.html";
  }
}

function prevQuestion() {
  SoundFX.playWhoosh();
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

window.selectRating = selectRating;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;

window.addEventListener("DOMContentLoaded", renderQuestion);
