// js/shared-music.js

// Deklarasi variabel global untuk audio dan status pemutaran
let audio;
let musicIcon;
let musicIconContainer;
let circularAudioVisualizerCanvas;
let circularAudioVisualizerCtx; // Pastikan ini dideklarasikan secara global
let linearAudioVisualizerCanvas;
let linearAudioVisualizerCtx; // Pastikan ini dideklarasikan secara global

let audioContext;
let analyser;
let dataArrayFrequency;
let dataArrayWaveform;
let isPlaying = false;
let animationFrameId;

// Fungsi untuk inisialisasi Web Audio API
function initializeAudioVisualizer() {
    console.log("initializeAudioVisualizer dipanggil.");
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();

        analyser.fftSize = 2048;
        dataArrayFrequency = new Uint8Array(analyser.frequencyBinCount);
        dataArrayWaveform = new Uint8Array(analyser.fftSize);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        console.log("AudioContext dan Analyser berhasil diinisialisasi.");
        resizeVisualizerCanvases(); // Panggil resize setelah inisialisasi
    }

    console.log("AudioContext state saat inisialisasi:", audioContext.state);
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("AudioContext dilanjutkan.");
            // Setelah resume, jika musik seharusnya diputar, pastikan visualizer aktif
            if (isPlaying) {
                drawVisualizers();
            }
        }).catch(error => {
            console.error("Gagal melanjutkan AudioContext:", error);
        });
    }
}

// Fungsi untuk menganalisis audio dan memperbarui ikon
function visualizeAudio() {
    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArrayFrequency);

        let sum = 0;
        for (let i = 0; i < dataArrayFrequency.length; i++) {
            sum += dataArrayFrequency[i];
        }
        let average = sum / dataArrayFrequency.length;

        const scaleFactor = 1 + (average / 255) * 0.1;
        musicIcon.style.transform = `scale(${scaleFactor})`;
    } else {
        musicIcon.style.transform = `scale(1)`;
    }
}

// Fungsi untuk menggambar gelombang melingkar/cincin
function drawCircularWave() {
    if (analyser && isPlaying && circularAudioVisualizerCtx) { // Pastikan konteks ada
        circularAudioVisualizerCtx.clearRect(0, 0, circularAudioVisualizerCanvas.width, circularAudioVisualizerCanvas.height);

        const centerX = circularAudioVisualizerCanvas.width / 2;
        const centerY = circularAudioVisualizerCanvas.height / 2;
        const radius = musicIconContainer.offsetWidth / 2;

        let totalAmplitude = 0;
        for(let i = 0; i < dataArrayFrequency.length; i++) {
            totalAmplitude += dataArrayFrequency[i];
        }
        const averageAmplitude = totalAmplitude / dataArrayFrequency.length;
        const intensity = averageAmplitude / 255;

        const maxLineWidth = 6;
        const minLineWidth = 2;
        const currentLineWidth = minLineWidth + (intensity * (maxLineWidth - minLineWidth));

        const maxBlur = 20;
        const minBlur = 5;
        const currentBlur = minBlur + (intensity * (maxBlur - minBlur));

        const maxOpacity = 1.0;
        const minOpacity = 0.6;
        const currentOpacity = minOpacity + (intensity * (maxOpacity - minOpacity));


        circularAudioVisualizerCtx.lineWidth = currentLineWidth;
        circularAudioVisualizerCtx.strokeStyle = `rgba(0, 198, 255, ${currentOpacity})`;
        circularAudioVisualizerCtx.shadowBlur = currentBlur;
        circularAudioVisualizerCtx.shadowColor = `rgba(0, 198, 255, ${currentOpacity * 1.2})`;

        circularAudioVisualizerCtx.beginPath();
        circularAudioVisualizerCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        circularAudioVisualizerCtx.stroke();

        if (intensity > 0.3) {
            const innerRingRadius = radius * (0.8);
            circularAudioVisualizerCtx.lineWidth = currentLineWidth * 0.5;
            circularAudioVisualizerCtx.strokeStyle = `rgba(0, 198, 255, ${currentOpacity * 0.7})`;
            circularAudioVisualizerCtx.shadowBlur = currentBlur * 0.7;
            circularAudioVisualizerCtx.beginPath();
            circularAudioVisualizerCtx.arc(centerX, centerY, innerRingRadius, 0, Math.PI * 2);
            circularAudioVisualizerCtx.stroke();
        }

    } else {
        if (circularAudioVisualizerCtx) {
            circularAudioVisualizerCtx.clearRect(0, 0, circularAudioVisualizerCanvas.width, circularAudioVisualizerCanvas.height);
        }
    }
}

// Fungsi untuk menggambar gelombang bergaris
function drawLinearWave() {
    if (analyser && isPlaying && linearAudioVisualizerCtx) { // Pastikan konteks ada
        linearAudioVisualizerCtx.clearRect(0, 0, linearAudioVisualizerCanvas.width, linearAudioVisualizerCanvas.height);

        analyser.getByteTimeDomainData(dataArrayWaveform);

        let totalAmplitude = 0;
        for(let i = 0; i < dataArrayFrequency.length; i++) {
            totalAmplitude += dataArrayFrequency[i];
        }
        const averageAmplitude = totalAmplitude / dataArrayFrequency.length;
        const intensity = averageAmplitude / 255;

        const linearWaveHeight = 50;
        const linearWaveCenterY = linearAudioVisualizerCanvas.height / 2;
        const linearWaveMaxAmp = linearWaveHeight * intensity;

        linearAudioVisualizerCtx.lineWidth = 4 + (intensity * 3);
        linearAudioVisualizerCtx.strokeStyle = `rgba(0, 255, 255, ${0.9 + (intensity * 0.1)})`;
        linearAudioVisualizerCtx.shadowBlur = 15 + (intensity * 10);
        linearAudioVisualizerCtx.shadowColor = `rgba(0, 255, 255, 1)`;

        linearAudioVisualizerCtx.beginPath();
        const sliceWidth = linearAudioVisualizerCanvas.width * 1.0 / dataArrayWaveform.length;
        let x = 0;

        for (let i = 0; i < dataArrayWaveform.length; i++) {
            let v = dataArrayWaveform[i] / 128.0;
            let y = linearWaveCenterY + (v - 1) * linearWaveMaxAmp / 2;

            if (i === 0) {
                linearAudioVisualizerCtx.moveTo(x, y);
            } else {
                linearAudioVisualizerCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        linearAudioVisualizerCtx.stroke();
    } else {
        if (linearAudioVisualizerCtx) {
            linearAudioVisualizerCtx.clearRect(0, 0, linearAudioVisualizerCanvas.width, linearAudioVisualizerCanvas.height);
        }
    }
}

// Main animation loop
function drawVisualizers() {
    // console.log("drawVisualizers dipanggil. isPlaying:", isPlaying, "analyser:", analyser); // Debugging
    // Periksa apakah analyser dan konteks kanvas sudah siap
    if (!analyser || !circularAudioVisualizerCtx || !linearAudioVisualizerCtx) {
        console.warn("Visualizer not ready: Analyser or canvas contexts missing. Attempting re-initialization if playing.");
        // Coba inisialisasi ulang jika sedang diputar dan AudioContext belum berjalan
        if (isPlaying && audio && (!audioContext || audioContext.state !== 'running')) {
            initializeAudioVisualizer();
        }
        // Jika ada frame animasi yang tertunda, batalkan untuk menghindari error
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return; // Keluar dari fungsi jika belum siap
    }

    if (isPlaying) {
        visualizeAudio();
        drawCircularWave();
        drawLinearWave();
        animationFrameId = requestAnimationFrame(drawVisualizers);
    } else {
        // Jika tidak diputar, tetap perbarui ikon dan bersihkan visualizer
        visualizeAudio(); // Tetap perbarui ikon scale
        drawCircularWave(); // Bersihkan visualizer melingkar
        linearAudioVisualizerCtx.clearRect(0, 0, linearAudioVisualizerCanvas.width, linearAudioVisualizerCanvas.height); // Bersihkan visualizer garis
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
}

// Fungsi untuk mengatur ukuran kedua kanvas visualizer agar responsif
function resizeVisualizerCanvases() {
    console.log("resizeVisualizerCanvases dipanggil.");
    if (musicIconContainer && circularAudioVisualizerCanvas && linearAudioVisualizerCanvas) {
        const iconContainerSize = musicIconContainer.offsetWidth;
        circularAudioVisualizerCanvas.width = iconContainerSize;
        circularAudioVisualizerCanvas.height = iconContainerSize;
        console.log("Circular canvas resized to:", iconContainerSize);

        linearAudioVisualizerCanvas.width = window.innerWidth;
        console.log("Linear canvas resized to:", window.innerWidth);

        // Hanya gambar ulang jika sedang diputar atau jika analyser sudah ada
        if (isPlaying || analyser) {
            drawVisualizers();
        }
    } else {
        console.warn("Elemen visualizer belum sepenuhnya siap saat resize dipanggil.");
    }
}

// Fungsi untuk menyimpan status musik dan mengalihkan halaman
window.saveMusicStateAndRedirect = function(url) {
    if (audio) {
        sessionStorage.setItem('musicCurrentTime', audio.currentTime);
        sessionStorage.setItem('musicIsPlaying', !audio.paused);
        console.log('Navigating away. Saving music state:', audio.currentTime, !audio.paused);
    }
    window.location.href = url;
};

// Fungsi global untuk tombol kembali (digunakan di halaman pembayaran)
window.goBack = function() { // Exposed globally
    if (audio) {
        sessionStorage.setItem('musicCurrentTime', audio.currentTime);
        sessionStorage.setItem('musicIsPlaying', !audio.paused);
        console.log('Pressing back. Saving music state:', audio.currentTime, !audio.paused);
    }
    history.back(); // Hanya melakukan history.back()
};


// Inisialisasi elemen audio dan visualizer setelah DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log("shared-music.js: DOMContentLoaded terpicu.");

    audio = document.getElementById('background-music');
    musicIcon = document.getElementById('music-icon');
    musicIconContainer = document.getElementById('music-icon-container');
    circularAudioVisualizerCanvas = document.getElementById('circular-audio-visualizer');
    linearAudioVisualizerCanvas = document.getElementById('linear-audio-visualizer');

    // Pastikan semua elemen yang dibutuhkan ada
    if (!audio || !musicIcon || !musicIconContainer || !circularAudioVisualizerCanvas || !linearAudioVisualizerCanvas) {
        console.error("shared-music.js: Salah satu elemen audio/visualizer tidak ditemukan. Pastikan ID HTML sudah benar.");
        return; // Hentikan eksekusi jika elemen tidak lengkap
    }

    // Inisialisasi konteks 2D setelah memastikan kanvas ada
    circularAudioVisualizerCtx = circularAudioVisualizerCanvas.getContext('2d');
    linearAudioVisualizerCtx = linearAudioVisualizerCanvas.getContext('2d');

    if (!circularAudioVisualizerCtx || !linearAudioVisualizerCtx) {
        console.error("shared-music.js: Gagal mendapatkan konteks 2D untuk kanvas visualizer.");
        return;
    }
    console.log("shared-music.js: Konteks kanvas 2D berhasil didapatkan.");


    // Event listener untuk tombol musik (play/pause)
    musicIconContainer.addEventListener('click', function() {
        console.log("shared-music.js: Music icon clicked.");
        if (audio.paused) {
            initializeAudioVisualizer(); // Panggil inisialisasi/resume AudioContext
            audio.muted = false;
            audio.play().then(() => {
                isPlaying = true;
                drawVisualizers();
                console.log("shared-music.js: Musik diputar.");
            }).catch(error => {
                console.error("shared-music.js: Gagal memutar musik:", error);
            });
        } else {
            audio.pause();
            isPlaying = false;
            musicIcon.style.transform = `scale(1)`;
            console.log("shared-music.js: Musik dijeda.");
            drawVisualizers(); // Panggil untuk membersihkan visualizer
        }
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        musicIcon.style.transform = `scale(1)`;
        sessionStorage.setItem('musicIsPlaying', 'false');
        console.log("shared-music.js: Musik berakhir.");
        drawVisualizers(); // Panggil untuk membersihkan visualizer
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        musicIcon.style.transform = `scale(1)`;
        sessionStorage.setItem('musicIsPlaying', 'false');
        console.log("shared-music.js: Musik dijeda (event).");
        drawVisualizers(); // Panggil untuk membersihkan visualizer
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        sessionStorage.setItem('musicIsPlaying', 'true');
        console.log("shared-music.js: Musik diputar (event 'play'). isPlaying kini:", isPlaying);
        initializeAudioVisualizer(); // Panggil inisialisasi/resume AudioContext
        drawVisualizers(); // Panggil untuk memulai visualizer
    });

    // Panggil saat window di-resize
    window.addEventListener('resize', resizeVisualizerCanvases);

    // LOGIKA PENTING UNTUK MELANJUTKAN MUSIK:
    // Menyimpan status musik saat meninggalkan halaman
    window.addEventListener('beforeunload', () => {
        if (audio) {
            sessionStorage.setItem('musicCurrentTime', audio.currentTime);
            sessionStorage.setItem('musicIsPlaying', !audio.paused);
            console.log('shared-music.js: Page unloading. Saving music state:', audio.currentTime, !audio.paused);
        }
    });

    // Melanjutkan musik saat halaman dimuat
    window.addEventListener('load', () => {
        console.log("shared-music.js: Window load terpicu.");
        resizeVisualizerCanvases(); // Pastikan ukuran kanvas visualizer diatur saat load

        const storedTime = sessionStorage.getItem('musicCurrentTime');
        const wasPlaying = sessionStorage.getItem('musicIsPlaying') === 'true';
        console.log('shared-music.js: Page loaded. Stored music time:', storedTime, 'Was playing:', wasPlaying);

        if (storedTime && !isNaN(parseFloat(storedTime))) { // Pastikan storedTime adalah angka
            audio.currentTime = parseFloat(storedTime);
            audio.muted = false; // Penting: Unmute jika melanjutkan dari sesi sebelumnya
            initializeAudioVisualizer(); // Inisialisasi AudioContext sebelum play
            if (wasPlaying) {
                audio.play().then(() => {
                    isPlaying = true;
                    drawVisualizers();
                    console.log('shared-music.js: Music resumed from stored time. isPlaying:', isPlaying);
                }).catch(error => {
                    console.warn("shared-music.js: Autoplay dengan storedTime gagal atau diblokir:", error);
                    isPlaying = false;
                    drawVisualizers(); // Jika autoplay gagal, pastikan visualizer berhenti
                });
            } else {
                isPlaying = false; // Jika sebelumnya di-pause, biarkan di-pause
                console.log('shared-music.js: Music was paused, keeping paused. isPlaying:', isPlaying);
                initializeAudioVisualizer(); // Masih perlu inisialisasi untuk visualizer
                drawVisualizers(); // Pastikan visualizer berhenti jika musik dijeda
            }
        } else {
            // Jika tidak ada data sesi atau data rusak, coba autoplay muted terlebih dahulu
            console.log("shared-music.js: No valid stored music state, attempting muted autoplay.");
            audio.play().then(() => {
                isPlaying = true;
                initializeAudioVisualizer();
                drawVisualizers();
                console.log('shared-music.js: Autoplay started muted, then unmuted on success. isPlaying:', isPlaying);
            }).catch(error => {
                console.warn("shared-music.js: Autoplay muted gagal atau diblokir. Musik akan diputar saat interaksi pengguna.", error);
                isPlaying = false;
                drawVisualizers(); // Jika autoplay gagal, pastikan visualizer berhenti
            });
        }
    });
});
