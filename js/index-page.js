// js/index-page.js

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('background-music'); // Ambil elemen audio lagi di sini

    // Transisi selamat datang
    const goToPaymentButton = document.getElementById('go-to-payment');
    if (goToPaymentButton) {
        goToPaymentButton.addEventListener('click', function () {
            document.getElementById('welcome-message').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            // Unmute musik saat tombol PAYMENT diklik (interaksi pertama pengguna)
            if (audio && audio.muted) {
                audio.muted = false;
            }
            // Pastikan musik diputar dan visualizer aktif jika belum
            if (audio && audio.paused) {
                // initializeAudioVisualizer() dipanggil di shared-music.js saat load
                audio.play().then(() => {
                    // isPlaying = true; // isPlaying dikelola di shared-music.js
                    // drawVisualizers(); // drawVisualizers dikelola di shared-music.js
                    console.log('Music started from welcome screen.');
                }).catch(error => {
                    console.error("Gagal memutar musik dari layar selamat datang:", error);
                });
            }
        });
    }


    // Logika tombol kembali khusus untuk index.html
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Logika untuk kembali ke welcome message jika di index.html
            const mainContent = document.getElementById('main-content');
            const welcomeMessage = document.getElementById('welcome-message');
            if (mainContent && welcomeMessage) {
                if (mainContent.style.display === 'block') {
                    mainContent.style.display = 'none';
                    welcomeMessage.style.display = 'flex';
                } else {
                    // Jika tidak di main-content, biarkan fungsi goBack() di shared-music.js menangani history.back()
                    goBack(); // Panggil fungsi goBack dari shared-music.js
                }
            } else {
                goBack(); // Panggil fungsi goBack dari shared-music.js jika elemen tidak ditemukan
            }
        });
    }

    // Collapsible sections
    document.querySelectorAll(".collapsible").forEach(btn => {
        btn.addEventListener("click", function () {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
        });
    });

    // Fungsi untuk menyalin teks ke clipboard
    window.copyToClipboard = function(buttonElement) { // Jadikan global agar bisa diakses dari HTML inline
        const accountNumber = buttonElement.dataset.accountNumber;
        const bankName = buttonElement.dataset.bankName;
        const tempInput = document.createElement('textarea');
        tempInput.value = accountNumber;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        const copyMessage = document.getElementById('copy-message');
        copyMessage.textContent = `Nomor rekening ${bankName} berhasil disalin!`;
        copyMessage.classList.add('show');
        setTimeout(() => {
            copyMessage.classList.remove('show');
        }, 2000);
    };

    // Partikel warna-warni
    const canvas = document.getElementById("particles");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
            });
        }
        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }


    // Efek salju
    const snowCanvas = document.getElementById("snow");
    if (snowCanvas) {
        const snowCtx = snowCanvas.getContext("2d");
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
        const snowflakes = [];
        for (let i = 0; i < 100; i++) {
            snowflakes.push({
                x: Math.random() * snowCanvas.width,
                y: Math.random() * snowCanvas.height,
                radius: Math.random() * 3 + 3,
                speedY: Math.random() * 1 + 2,
                speedX: Math.random() * 0.5 - 0.50
            });
        }
        function drawSnow() {
            snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
            snowCtx.fillStyle = "rgba(255, 255, 255, 0.8)";
            snowflakes.forEach(flake => {
                snowCtx.beginPath();
                snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                snowCtx.fill();
                flake.y += flake.speedY;
                if (flake.y > snowCanvas.height) {
                    flake.y = -flake.radius;
                    flake.x = Math.random() * snowCanvas.width;
                }
            });
            requestAnimationFrame(drawSnow);
        }
        drawSnow();
    }
});
