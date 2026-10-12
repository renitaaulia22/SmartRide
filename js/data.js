/**
 * SmartRide - Data & SPK Recommendation Engine Configuration
 * Proyek Sistem Pendukung Keputusan (SPK) Pemilihan Transportasi Online
 * Alternatif: Gojek, Grab, Maxim (15 Kriteria Komprehensif)
 */

// 15 Kriteria Evaluasi Transportasi Online (Skala Likert 1 - 5)
const QUESTION_LIST = [
    {
        id: "q1",
        code: "K1",
        category: "Tarif & Keterjangkauan",
        icon: "💰",
        text: "Tarif perjalanan yang ditawarkan transparan, terjangkau, dan ramah di kantong sesuai jarak tempuh.",
        labelMin: "Sangat Mahal",
        labelMax: "Sangat Terjangkau"
    },
    {
        id: "q2",
        code: "K2",
        category: "Kecepatan Penjemputan",
        icon: "⚡",
        text: "Driver cepat merespons pesanan dan tiba di titik jemput tepat waktu dalam durasi singkat (<5-8 menit).",
        labelMin: "Sangat Lambat",
        labelMax: "Sangat Cepat"
    },
    {
        id: "q3",
        code: "K3",
        category: "Keamanan & Tombol Darurat",
        icon: "🛡️",
        text: "Fitur keamanan (tombol SOS darurat, bagikan perjalanan/live tracking, verifikasi plat nomor & wajah) berfungsi optimal.",
        labelMin: "Kurang Aman",
        labelMax: "Sangat Aman"
    },
    {
        id: "q4",
        code: "K4",
        category: "Kenyamanan & Kebersihan Armada",
        icon: "✨",
        text: "Kondisi fisik armada (kebersihan kendaraan, kursi empuk, serta ketersediaan helm wangi & jas hujan) dalam kondisi prima.",
        labelMin: "Kurang Nyaman",
        labelMax: "Sangat Bersih & Prima"
    },
    {
        id: "q5",
        code: "K5",
        category: "Promo & Potongan Harga",
        icon: "🎁",
        text: "Ketersediaan voucher diskon tarif, cashback dompet digital, dan bonus langganan sering Anda manfaatkan.",
        labelMin: "Jarang Promo",
        labelMax: "Promo Melimpah"
    },
    {
        id: "q6",
        code: "K6",
        category: "Kemudahan & Kecepatan Aplikasi",
        icon: "📱",
        text: "Antarmuka aplikasi ringan, navigasi intuitif, jarang mengalami lag/crash, dan respon sistem cepat.",
        labelMin: "Sering Lag",
        labelMax: "Sangat Mulus & Cepat"
    },
    {
        id: "q7",
        code: "K7",
        category: "Sikap & Keramahan Driver",
        icon: "🤝",
        text: "Driver bersikap ramah, komunikatif, menjaga etika berkendara yang aman, dan tidak ugal-ugalan di jalan.",
        labelMin: "Ugal-ugalan",
        labelMax: "Sangat Sopan & Tertib"
    },
    {
        id: "q8",
        code: "K8",
        category: "Keakuratan Peta & Rute Navigasi",
        icon: "📍",
        text: "Titik jemput dan rute navigasi pada peta aplikasi presisi sehingga driver tidak salah lokasi atau tersesat.",
        labelMin: "Sering Nyasar",
        labelMax: "Sangat Presisi"
    },
    {
        id: "q9",
        code: "K9",
        category: "Ketersediaan di Jam Sibuk & Cuaca Buruk",
        icon: "🌧️",
        text: "Ketersediaan driver tetap melimpah dan pesanan mudah didapatkan pada jam sibuk (rush hour) maupun saat hujan lebat.",
        labelMin: "Sangat Sulit Dapat",
        labelMax: "Selalu Siap & Mudah"
    },
    {
        id: "q10",
        code: "K10",
        category: "Fleksibilitas Metode Pembayaran",
        icon: "💳",
        text: "Tersedia beragam opsi pembayaran non-tunai yang praktis (e-wallet, QRIS, kartu debit/kredit) selain uang tunai.",
        labelMin: "Opsi Terbatas",
        labelMax: "Sangat Fleksibel & Lengkap"
    },
    {
        id: "q11",
        code: "K11",
        category: "Transparansi Biaya & Kebijakan Batal",
        icon: "⚖️",
        text: "Tidak ada biaya lonjakan tarif (surge pricing) berlebihan tanpa kejelasan, serta aturan pembatalan pesanan adil.",
        labelMin: "Lonjakan Berlebihan",
        labelMax: "Sangat Adil & Transparan"
    },
    {
        id: "q12",
        code: "K12",
        category: "Responsivitas Layanan Pelanggan (CS)",
        icon: "🎧",
        text: "Pusat bantuan/CS cepat dan tanggap dalam menangani keluhan, barang tertinggal, maupun pengembalian saldo (refund).",
        labelMin: "Sangat Lambat",
        labelMax: "Sangat Cepat & Solutif"
    },
    {
        id: "q13",
        code: "K13",
        category: "Perlindungan Asuransi Perjalanan",
        icon: "🏥",
        text: "Perjalanan secara otomatis terproteksi oleh polis asuransi kecelakaan diri/jiwa resmi tanpa premi yang memberatkan.",
        labelMin: "Kurang Jelas",
        labelMax: "Proteksi Terjamin"
    },
    {
        id: "q14",
        code: "K14",
        category: "Fitur Booking Terjadwal & Multi-Stop",
        icon: "🗓️",
        text: "Kemudahan memesan perjalanan terjadwal untuk waktu mendatang atau memesan rute dengan beberapa titik singgah.",
        labelMin: "Tidak Mendukung",
        labelMax: "Sangat Mudah Digunakan"
    },
    {
        id: "q15",
        code: "K15",
        category: "Ketepatan Estimasi Waktu Tiba (ETA)",
        icon: "⏱️",
        text: "Perkiraan waktu kedatangan driver dan estimasi durasi tempuh akurat sesuai dengan kondisi lalu lintas riil.",
        labelMin: "Sering Meleset",
        labelMax: "Sangat Akurat"
    }
];

// Opsi Skala Likert Modern
const LIKERT_OPTIONS = [
    { value: 1, emoji: "😡", shortLabel: "Sangat Buruk", fullLabel: "Sangat Tidak Setuju" },
    { value: 2, emoji: "🙁", shortLabel: "Kurang", fullLabel: "Tidak Setuju" },
    { value: 3, emoji: "😐", shortLabel: "Cukup", fullLabel: "Netral" },
    { value: 4, emoji: "🙂", shortLabel: "Baik", fullLabel: "Setuju" },
    { value: 5, emoji: "🤩", shortLabel: "Sangat Baik", fullLabel: "Sangat Setuju" }
];

// Profil Bobot Karakteristik Alternatif SPK (15 Kriteria)
const ALTERNATIVES_CONFIG = {
    Gojek: {
        name: "Gojek",
        tagline: "Super-App Cepat, Ekosistem GoPay & Driver Terbanyak",
        badgeColor: "bg-emerald-500 text-white",
        brandColor: "#00AA13",
        brandBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
        logo: "🟢",
        description: "Pilihan terbaik jika Anda mengutamakan kecepatan penjemputan, banyaknya driver di jam sibuk, kepraktisan ekosistem GoPay/GoPay Later, dan estimasi waktu tiba yang presisi.",
        weights: {
            q1: 0.80, q2: 0.96, q3: 0.88, q4: 0.84, q5: 0.82,
            q6: 0.96, q7: 0.88, q8: 0.90, q9: 0.94, q10: 0.95,
            q11: 0.82, q12: 0.88, q13: 0.90, q14: 0.90, q15: 0.94
        }
    },
    Grab: {
        name: "Grab",
        tagline: "Standar Keamanan Korporat, Armada Nyaman & Fitur Lengkap",
        badgeColor: "bg-teal-600 text-white",
        brandColor: "#00B14F",
        brandBg: "bg-teal-50 text-teal-800 border-teal-300",
        logo: "🟢",
        description: "Pilihan paling tepat jika prioritas utama Anda adalah keamanan berkendara nomor satu, proteksi asuransi terpercaya, kebersihan armada terstandarisasi, dan sopan santun pengemudi.",
        weights: {
            q1: 0.76, q2: 0.88, q3: 0.97, q4: 0.95, q5: 0.80,
            q6: 0.90, q7: 0.93, q8: 0.92, q9: 0.88, q10: 0.92,
            q11: 0.85, q12: 0.92, q13: 0.96, q14: 0.94, q15: 0.91
        }
    },
    Maxim: {
        name: "Maxim",
        tagline: "Juara Tarif Paling Hemat, Rute Jauh & Ramah Anggaran",
        badgeColor: "bg-amber-500 text-slate-900",
        brandColor: "#FFC800",
        brandBg: "bg-amber-50 text-amber-900 border-amber-300",
        logo: "🟡",
        description: "Pilihan nomor satu jika Anda adalah pengguna bijak anggaran yang mengutamakan tarif termurah, hemat pengeluaran rutin jarak jauh, serta fleksibilitas pemesanan tanpa biaya lonjakan drastis.",
        weights: {
            q1: 0.98, q2: 0.74, q3: 0.72, q4: 0.70, q5: 0.90,
            q6: 0.76, q7: 0.76, q8: 0.73, q9: 0.72, q10: 0.76,
            q11: 0.88, q12: 0.72, q13: 0.74, q14: 0.82, q15: 0.75
        }
    }
};

/**
 * Algoritma SPK: Menghitung Skor Kesesuaian 15 Kriteria
 */
function calculateSPKRecommendation(answers, status) {
    const scores = {};

    Object.keys(ALTERNATIVES_CONFIG).forEach(altKey => {
        const alt = ALTERNATIVES_CONFIG[altKey];
        let totalScore = 0;
        let maxWeightSum = 0;

        QUESTION_LIST.forEach(q => {
            const userRating = Number(answers[q.id]) || 3;
            const altAffinity = alt.weights[q.id] || 0.8;

            totalScore += (userRating / 5) * altAffinity * 100;
            maxWeightSum += 1.0 * altAffinity * 100;
        });

        // Penyesuaian profil demografi
        if (status === "Sekolah" && altKey === "Maxim") totalScore *= 1.06;
        if (status === "Kerja" && altKey === "Grab") totalScore *= 1.05;
        if (status === "Kuliah" && altKey === "Gojek") totalScore *= 1.04;

        const rawMatch = (totalScore / maxWeightSum) * 100;
        const normalizedMatch = Math.min(98, Math.max(62, Math.round(rawMatch * 0.95 + 8)));

        scores[altKey] = {
            key: altKey,
            name: alt.name,
            tagline: alt.tagline,
            description: alt.description,
            brandBg: alt.brandBg,
            brandColor: alt.brandColor,
            matchPercentage: normalizedMatch
        };
    });

    const ranked = Object.values(scores).sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    return {
        topRecommendation: ranked[0],
        runnerUp: ranked[1],
        thirdPlace: ranked[2],
        allRankings: ranked
    };
}

// Helper untuk menghasilkan tanggal lampau dinamis (agar data demo selalu lebih lama dari kiriman user)
function getRelativePastDate(daysAgo, hoursAgo = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hoursAgo);
    return d.toISOString();
}

// Data Dummy Responden (Tanggal dinamis: 1-5 hari lalu agar kiriman baru user SELALU paling atas)
const DEFAULT_RESPONDENTS = [
    {
        id: "SR-DEMO-001",
        submittedAt: getRelativePastDate(1, 2),
        name: "Muhammad Rizky Pratama",
        age: 21,
        status: "Kuliah",
        favoriteApp: "Gojek",
        answers: { q1: 4, q2: 5, q3: 4, q4: 4, q5: 5, q6: 5, q7: 4, q8: 5, q9: 5, q10: 5, q11: 4, q12: 4, q13: 4, q14: 4, q15: 5 },
        averageScore: 4.47,
        recommendedApp: "Gojek"
    },
    {
        id: "SR-DEMO-002",
        submittedAt: getRelativePastDate(1, 5),
        name: "Siti Rahmawati",
        age: 17,
        status: "Sekolah",
        favoriteApp: "Maxim",
        answers: { q1: 5, q2: 3, q3: 3, q4: 3, q5: 5, q6: 4, q7: 4, q8: 3, q9: 3, q10: 4, q11: 5, q12: 3, q13: 3, q14: 4, q15: 3 },
        averageScore: 3.67,
        recommendedApp: "Maxim"
    },
    {
        id: "SR-DEMO-003",
        submittedAt: getRelativePastDate(2, 1),
        name: "Dimas Arya Wijaya",
        age: 28,
        status: "Kerja",
        favoriteApp: "Grab",
        answers: { q1: 4, q2: 4, q3: 5, q4: 5, q5: 3, q6: 5, q7: 5, q8: 5, q9: 4, q10: 5, q11: 4, q12: 5, q13: 5, q14: 5, q15: 5 },
        averageScore: 4.60,
        recommendedApp: "Grab"
    },
    {
        id: "SR-DEMO-004",
        submittedAt: getRelativePastDate(2, 4),
        name: "Annisa Larasati",
        age: 23,
        status: "Kuliah",
        favoriteApp: "Gojek",
        answers: { q1: 3, q2: 5, q3: 4, q4: 4, q5: 4, q6: 5, q7: 4, q8: 4, q9: 5, q10: 5, q11: 4, q12: 4, q13: 4, q14: 4, q15: 4 },
        averageScore: 4.20,
        recommendedApp: "Gojek"
    },
    {
        id: "SR-DEMO-005",
        submittedAt: getRelativePastDate(3, 2),
        name: "Budi Santoso",
        age: 34,
        status: "Kerja",
        favoriteApp: "Maxim",
        answers: { q1: 5, q2: 3, q3: 4, q4: 3, q5: 4, q6: 4, q7: 4, q8: 4, q9: 3, q10: 4, q11: 5, q12: 3, q13: 4, q14: 4, q15: 3 },
        averageScore: 3.80,
        recommendedApp: "Maxim"
    },
    {
        id: "SR-DEMO-006",
        submittedAt: getRelativePastDate(3, 6),
        name: "Zahra Aulia Putri",
        age: 16,
        status: "Sekolah",
        favoriteApp: "Maxim",
        answers: { q1: 5, q2: 4, q3: 3, q4: 3, q5: 5, q6: 4, q7: 4, q8: 3, q9: 3, q10: 4, q11: 5, q12: 4, q13: 3, q14: 4, q15: 4 },
        averageScore: 3.87,
        recommendedApp: "Maxim"
    },
    {
        id: "SR-DEMO-007",
        submittedAt: getRelativePastDate(4, 2),
        name: "Fajar Nugroho",
        age: 22,
        status: "Kuliah",
        favoriteApp: "Grab",
        answers: { q1: 4, q2: 5, q3: 5, q4: 4, q5: 4, q6: 5, q7: 5, q8: 4, q9: 4, q10: 5, q11: 4, q12: 5, q13: 5, q14: 5, q15: 4 },
        averageScore: 4.53,
        recommendedApp: "Grab"
    },
    {
        id: "SR-DEMO-008",
        submittedAt: getRelativePastDate(4, 5),
        name: "Ratna Kusuma Dewi",
        age: 29,
        status: "Kerja",
        favoriteApp: "Grab",
        answers: { q1: 4, q2: 4, q3: 5, q4: 5, q5: 4, q6: 5, q7: 5, q8: 5, q9: 4, q10: 5, q11: 4, q12: 5, q13: 5, q14: 5, q15: 5 },
        averageScore: 4.67,
        recommendedApp: "Grab"
    },
    {
        id: "SR-DEMO-009",
        submittedAt: getRelativePastDate(5, 1),
        name: "Ilham Ramadhan",
        age: 18,
        status: "Sekolah",
        favoriteApp: "Maxim",
        answers: { q1: 5, q2: 4, q3: 3, q4: 4, q5: 5, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 5, q12: 4, q13: 4, q14: 4, q15: 4 },
        averageScore: 4.13,
        recommendedApp: "Maxim"
    },
    {
        id: "SR-DEMO-010",
        submittedAt: getRelativePastDate(5, 7),
        name: "Eko Prasetyo",
        age: 41,
        status: "Lainnya",
        favoriteApp: "Gojek",
        answers: { q1: 3, q2: 5, q3: 4, q4: 4, q5: 3, q6: 5, q7: 4, q8: 4, q9: 5, q10: 5, q11: 4, q12: 4, q13: 4, q14: 4, q15: 4 },
        averageScore: 4.13,
        recommendedApp: "Gojek"
    }
];

function calculateAverage(answers) {
    const values = Object.values(answers).map(Number);
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Number((sum / values.length).toFixed(2));
}
