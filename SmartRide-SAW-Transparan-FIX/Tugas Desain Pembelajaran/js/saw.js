/**
 * SmartRide SAW Engine + Victory Audio FX
 */

// Efek Suara Nada Kemenangan (Fanfare Chimes)
const VictoryAudio = {
  play() {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    if (!actx) return;

    // Nada melodi: C5, E5, G5, C6 (Kemenangan Cerah)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      const startTime = actx.currentTime + index * 0.14;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  },
};

const DEFAULT_RESPONDENTS = [
  {
    id: "R01",
    nama: "Andi P.",
    aplikasi: "Gojek",
    indikator: {
      i01_pemesanan: 5,
      i02_gps: 5,
      i03_pembayaran: 5,
      i04_alamat: 4,
      i05_batal: 4,
      i06_temu_driver: 5,
      i07_komunikasi: 4,
      i08_tracking: 5,
      i09_respons_app: 5,
      i10_notifikasi: 4,
      i11_desain: 5,
      i12_detail_harga: 4,
      i13_ringan_app: 4,
      i14_cs: 4,
      i15_tarif: 3,
      i16_promo: 5,
      i17_waktu_tunggu: 4,
      i18_eta: 4,
      i19_armada_sibuk: 5,
      i20_area_pinggiran: 4,
      i21_keamanan_data: 5,
      i22_keselamatan_fisik: 5,
    },
  },
  {
    id: "R02",
    nama: "Budi Santoso",
    aplikasi: "Maxim",
    indikator: {
      i01_pemesanan: 4,
      i02_gps: 3,
      i03_pembayaran: 3,
      i04_alamat: 4,
      i05_batal: 4,
      i06_temu_driver: 3,
      i07_komunikasi: 4,
      i08_tracking: 3,
      i09_respons_app: 4,
      i10_notifikasi: 3,
      i11_desain: 3,
      i12_detail_harga: 5,
      i13_ringan_app: 5,
      i14_cs: 3,
      i15_tarif: 5,
      i16_promo: 3,
      i17_waktu_tunggu: 3,
      i18_eta: 4,
      i19_armada_sibuk: 3,
      i20_area_pinggiran: 4,
      i21_keamanan_data: 4,
      i22_keselamatan_fisik: 3,
    },
  },
  {
    id: "R03",
    nama: "Citra Dewi",
    aplikasi: "Grab",
    indikator: {
      i01_pemesanan: 5,
      i02_gps: 5,
      i03_pembayaran: 5,
      i04_alamat: 5,
      i05_batal: 4,
      i06_temu_driver: 5,
      i07_komunikasi: 5,
      i08_tracking: 5,
      i09_respons_app: 4,
      i10_notifikasi: 5,
      i11_desain: 4,
      i12_detail_harga: 4,
      i13_ringan_app: 4,
      i14_cs: 5,
      i15_tarif: 3,
      i16_promo: 4,
      i17_waktu_tunggu: 5,
      i18_eta: 5,
      i19_armada_sibuk: 5,
      i20_area_pinggiran: 5,
      i21_keamanan_data: 5,
      i22_keselamatan_fisik: 5,
    },
  },
  {
    id: "R04",
    nama: "Dina R.",
    aplikasi: "Maxim, Gojek",
    indikator: {
      i01_pemesanan: 4,
      i02_gps: 4,
      i03_pembayaran: 4,
      i04_alamat: 4,
      i05_batal: 3,
      i06_temu_driver: 4,
      i07_komunikasi: 4,
      i08_tracking: 4,
      i09_respons_app: 4,
      i10_notifikasi: 4,
      i11_desain: 4,
      i12_detail_harga: 5,
      i13_ringan_app: 4,
      i14_cs: 3,
      i15_tarif: 5,
      i16_promo: 4,
      i17_waktu_tunggu: 4,
      i18_eta: 4,
      i19_armada_sibuk: 4,
      i20_area_pinggiran: 4,
      i21_keamanan_data: 4,
      i22_keselamatan_fisik: 4,
    },
  },
];

async function loadRespondentData() {
  try {
    const res = await fetch("css/responden.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("Data responden.json tidak dapat dimuat. Menggunakan data cadangan internal.", err);
  }
  return DEFAULT_RESPONDENTS;
}

function parseAppNames(rawStr) {
  if (!rawStr) return [];
  const valid = ["gojek", "grab", "maxim"];
  return rawStr
    .toLowerCase()
    .split(/[,/&]+/)
    .map((s) => s.trim())
    .filter((t) => valid.includes(t));
}

function mapIndicatorsToCriteria(ind) {
  return {
    c1: ind.i15_tarif || 3,
    c2: ((ind.i21_keamanan_data || 4) + (ind.i10_notifikasi || 4)) / 2,
    c3:
      ((ind.i06_temu_driver || 4) +
        (ind.i17_waktu_tunggu || 4) +
        (ind.i18_eta || 4)) /
      3,
    c4:
      ((ind.i01_pemesanan || 4) +
        (ind.i02_gps || 4) +
        (ind.i04_alamat || 4) +
        (ind.i05_batal || 4)) /
      4,
    c5: ind.i16_promo || 3,
    c6:
      ((ind.i09_respons_app || 4) +
        (ind.i11_desain || 4) +
        (ind.i13_ringan_app || 4)) /
      3,
    c7: ind.i03_pembayaran || 4,
    c8: ind.i22_keselamatan_fisik || 4,
    c9: ((ind.i07_komunikasi || 4) + (ind.i14_cs || 4)) / 2,
    c10: ((ind.i19_armada_sibuk || 4) + (ind.i20_area_pinggiran || 4)) / 2,
  };
}

function calculateServicePerformance(rawRespondents) {
  const groups = { gojek: [], grab: [], maxim: [] };

  rawRespondents.forEach((resp) => {
    const apps = parseAppNames(resp.aplikasi);
    apps.forEach((app) =>
      groups[app].push(mapIndicatorsToCriteria(resp.indikator)),
    );
  });

  const matrix = {};
  const criteriaList = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
  ];

  ["gojek", "grab", "maxim"].forEach((app) => {
    matrix[app] = {};
    const count = groups[app].length;
    criteriaList.forEach((c) => {
      if (count > 0) {
        const sum = groups[app].reduce((acc, row) => acc + row[c], 0);
        matrix[app][c] = parseFloat((sum / count).toFixed(3));
      } else {
        matrix[app][c] = 3.0;
      }
    });
  });
  return matrix;
}

function normalizeMatrix(perfMatrix) {
  const norm = { gojek: {}, grab: {}, maxim: {} };
  const criteriaList = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
  ];

  criteriaList.forEach((c) => {
    const vals = [perfMatrix.gojek[c], perfMatrix.grab[c], perfMatrix.maxim[c]];
    const maxVal = Math.max(...vals);
    ["gojek", "grab", "maxim"].forEach((app) => {
      norm[app][c] = parseFloat((perfMatrix[app][c] / maxVal).toFixed(4));
    });
  });
  return norm;
}

function calculateUserWeights(userPref) {
  const criteriaList = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
  ];
  // Rating 1-5 dari pengguna dijadikan bobot personal.
  // Dipangkatkan 2 agar perbedaan prioritas terasa nyata:
  // rating 5 jauh lebih dominan daripada rating 1.
  // Setelah itu bobot dinormalisasi sehingga total bobot = 1.
  const preferenceScores = {};
  let totalScore = 0;

  criteriaList.forEach((c) => {
    const rating = Number(userPref[c]) || 3;
    const safeRating = Math.min(5, Math.max(1, rating));
    preferenceScores[c] = safeRating ** 2;
    totalScore += preferenceScores[c];
  });

  const weights = {};
  criteriaList.forEach((c) => {
    weights[c] = preferenceScores[c] / totalScore;
  });
  return weights;
}

function calculateSAW(normalized, weights) {
  const criteriaList = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
  ];
  const finalScores = [];

  ["gojek", "grab", "maxim"].forEach((app) => {
    let score = 0;
    criteriaList.forEach((c) => {
      score += normalized[app][c] * weights[c];
    });

    const displayName =
      app === "gojek" ? "Gojek" : app === "grab" ? "Grab" : "Maxim";
    finalScores.push({
      key: app,
      name: displayName,
      score: parseFloat(score.toFixed(4)),
      matchPercent: parseFloat((score * 100).toFixed(2)),
    });
  });

  finalScores.sort((a, b) => b.score - a.score);
  return finalScores;
}

function generateDynamicReasons(winnerKey, normalizedMatrix, weights) {
  const labels = {
    c1: "Keterjangkauan tarif & biaya perjalanan yang paling hemat",
    c2: "Keamanan perjalanan serta perlindungan data yang andal",
    c3: "Kecepatan penjemputan & efisiensi waktu alokasi driver",
    c4: "Kemudahan navigasi dan proses pemesanan praktis",
    c5: "Ketersediaan promo potongan harga dan keuntungan loyalitas",
    c6: "Kelancaran antarmuka aplikasi yang ringan dan responsif",
    c7: "Fleksibilitas metode pembayaran tunai maupun nontunai",
    c8: "Kenyamanan armada kendaraan dan standar keselamatan",
    c9: "Dukungan customer service dan penanganan kendala yang tanggap",
    c10: "Kesiapan armada di jam sibuk maupun area pinggiran kota",
  };

  const contributions = Object.keys(labels).map((c) => ({
    crit: c,
    impact: weights[c] * normalizedMatrix[winnerKey][c],
  }));
  contributions.sort((a, b) => b.impact - a.impact);

  return [
    `Unggul signifikan pada aspek ${labels[contributions[0].crit].toLowerCase()}.`,
    `Didukung performa tinggi pada ${labels[contributions[1].crit].toLowerCase()} sesuai preferensi kuesioner Anda.`,
  ];
}

function getCriterionLabels() {
  return {
    c1: "Tarif & Anggaran",
    c2: "Keamanan & Privasi",
    c3: "Efisiensi Waktu",
    c4: "Kemudahan Pemesanan",
    c5: "Promo & Voucher",
    c6: "Kualitas UI/UX",
    c7: "Metode Pembayaran",
    c8: "Kenyamanan Armada",
    c9: "Layanan Bantuan",
    c10: "Ketersediaan Armada",
  };
}

function calculateContributions(normalizedMatrix, weights) {
  const criteria = Object.keys(weights);
  const apps = ["gojek", "grab", "maxim"];
  const contribution = {};

  apps.forEach((app) => {
    contribution[app] = {};
    criteria.forEach((c) => {
      contribution[app][c] = normalizedMatrix[app][c] * weights[c];
    });
  });

  return contribution;
}

function getTopContributions(app, contribution, limit = 3) {
  return Object.keys(contribution[app])
    .map((c) => ({ crit: c, value: contribution[app][c] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

async function initResultPage() {
  const userPrefRaw = localStorage.getItem("smartride_user_preferences");
  if (!userPrefRaw) {
    window.location.href = "kuesioner.html";
    return;
  }
  const userPreferences = JSON.parse(userPrefRaw);
  const respondents = await loadRespondentData();

  const perfMatrix = calculateServicePerformance(respondents);
  const normalizedMatrix = normalizeMatrix(perfMatrix);
  const weights = calculateUserWeights(userPreferences);
  const results = calculateSAW(normalizedMatrix, weights);

  // Bunyikan nada kemenangan cerah
  VictoryAudio.play();

  // Render Winner Card
  const winner = results[0];
  document.getElementById("winner-name").textContent = winner.name;
  document.getElementById("winner-score").textContent = winner.score.toFixed(4);
  document.getElementById("winner-match").textContent =
    `${winner.matchPercent}% Match`;

  const reasons = generateDynamicReasons(winner.key, normalizedMatrix, weights);
  document.getElementById("winner-reasons").innerHTML = reasons
    .map((r) => `<div>✔ ${r}</div>`)
    .join("");

  // Render Ranking Card
  const rankGrid = document.getElementById("rankings-grid");
  rankGrid.innerHTML = results
    .map(
      (item, idx) => `
    <div class="glass-panel" style="padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-left: 6px solid ${idx === 0 ? "var(--primary-green)" : "var(--primary-yellow)"}; margin-bottom: 14px;">
      <div>
        <span style="font-weight: 800; color: var(--dark-green); font-size: 1.15rem;">#${idx + 1} ${item.name}</span>
        <div style="font-size: 0.85rem; color: var(--muted-text); margin-top: 2px;">Kompatibilitas Rekomendasi</div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 1.4rem; font-weight: 900; color: var(--dark-text);">${item.score.toFixed(4)}</span>
        <div style="font-size: 0.88rem; font-weight: 800; color: var(--primary-green);">${item.matchPercent}% Match</div>
      </div>
    </div>
  `,
    )
    .join("");

  // Render Bobot Kuesioner Pengguna
  const bobotContainer = document.getElementById("bobot-grid");
  if (bobotContainer) {
    const cLabels = {
      c1: "C1 Tarif",
      c2: "C2 Aman",
      c3: "C3 Waktu",
      c4: "C4 Mudah",
      c5: "C5 Promo",
      c6: "C6 UI/UX",
      c7: "C7 Bayar",
      c8: "C8 Nyaman",
      c9: "C9 CS",
      c10: "C10 Armada",
    };
    bobotContainer.innerHTML = Object.keys(weights)
      .map(
        (c) => `
      <div style="background: var(--light-yellow); border: 1px solid var(--primary-yellow); padding: 10px 12px; border-radius: 12px; text-align: center;">
        <strong style="color: var(--dark-green); font-size: 0.8rem; display: block; margin-bottom: 2px;">${cLabels[c]}</strong>
        <div style="font-weight: 800; font-size: 1.05rem; color: var(--dark-text);">${(weights[c] * 100).toFixed(1)}%</div>
      </div>
    `,
      )
      .join("");
  }

  // Daftar kriteria dan alternatif dipakai oleh seluruh tabel audit di bawah
  const criteria = [
    "c1", "c2", "c3", "c4", "c5",
    "c6", "c7", "c8", "c9", "c10"
  ];
  const apps = ["gojek", "grab", "maxim"];

  // Render kontribusi setiap kriteria terhadap skor akhir SAW
  const contributionContainer = document.getElementById("contribution-grid");
  const contributionTable = document.getElementById("contribution-table-body");
  const labels = getCriterionLabels();
  const contributions = calculateContributions(normalizedMatrix, weights);

  if (contributionContainer) {
    contributionContainer.innerHTML = results.map((item, idx) => {
      const top = getTopContributions(item.key, contributions, 3);
      return `
        <div class="glass-panel" style="padding:20px; border-left:6px solid ${idx === 0 ? "var(--primary-green)" : "var(--primary-yellow)"};">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px;">
            <strong style="font-size:1.05rem; color:var(--dark-green);">${item.name}</strong>
            <span style="font-weight:900; color:var(--dark-text);">${item.score.toFixed(4)}</span>
          </div>
          ${top.map((x, i) => `
            <div style="margin-top:10px;">
              <div style="display:flex; justify-content:space-between; gap:10px; font-size:.86rem; margin-bottom:4px;">
                <span>${i + 1}. ${labels[x.crit]}</span>
                <strong>${(x.value * 100).toFixed(2)}%</strong>
              </div>
              <div style="height:8px; background:var(--light-yellow); border-radius:99px; overflow:hidden;">
                <div style="height:100%; width:${Math.min(100, x.value * 100 * 2)}%; background:var(--primary-green); border-radius:99px;"></div>
              </div>
            </div>
          `).join("")}
        </div>`;
    }).join("");
  }

  if (contributionTable) {
    contributionTable.innerHTML = results.map(item => `
      <tr>
        <td style="font-weight:800; text-align:left; color:var(--dark-green);">${item.name}</td>
        ${criteria.map(c => `<td>${(contributions[item.key][c] * 100).toFixed(2)}%</td>`).join("")}
        <td style="font-weight:900;">${item.score.toFixed(4)}</td>
      </tr>
    `).join("");
  }

  // Render Tabel Matriks Keputusan & Normalisasi
  const xBody = document.getElementById("matrix-perf-body");
  if (xBody) {
    xBody.innerHTML = apps
      .map(
        (app) => `
      <tr>
        <td style="font-weight:800; text-align:left; color: var(--dark-green);">${app.toUpperCase()}</td>
        ${criteria.map((c) => `<td>${perfMatrix[app][c].toFixed(2)}</td>`).join("")}
      </tr>
    `,
      )
      .join("");
  }

  const rBody = document.getElementById("saw-matrix-body");
  if (rBody) {
    rBody.innerHTML = apps
      .map(
        (app) => `
      <tr>
        <td style="font-weight:800; text-align:left; color: var(--dark-green);">${app.toUpperCase()}</td>
        ${criteria.map((c) => `<td>${normalizedMatrix[app][c].toFixed(3)}</td>`).join("")}
      </tr>
    `,
      )
      .join("");
  }
}
