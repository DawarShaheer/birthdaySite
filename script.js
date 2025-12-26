document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const startBtn = document.getElementById('start-btn');
    const heroSection = document.getElementById('hero');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const playPauseBtn = document.getElementById('play-pause-btn');

    // --- Config ---
    const birthdayDate = new Date();
    // Set to current year if Dec 27 hasn't passed, else next year
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(`December 27, ${currentYear} 00:00:00`);

    // If today is past Dec 27, set for next year? 
    // Or just let it show 0 if it's the day of. 
    // Logic: If now > Dec 28, set to next year. If now is Dec 27, show Happy Birthday!

    // --- 1. Entrance ---
    startBtn.addEventListener('click', () => {
        // Request Mic immediately on user interaction
        initMicrophone();

        heroSection.style.opacity = '0';
        setTimeout(() => {
            heroSection.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.classList.add('fade-in');

            // Start the experience
            startTypingMessage();
            // Try playing music
            if (bgMusic.querySelector('source').src) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.innerText = "⏸ Pause Music";
                }).catch(e => console.log("Audio play failed (likely empty src):", e));
            }
        }, 1000);
    });

    // --- 2. Typing Effect ---
    const message = "Jiya, you make the world brighter just by being in it. ✨\nToday is all about celebrating YOU! 💖\nMay your year be filled with laughter, love, and magic. 🌸";
    const speed = 50;
    let i = 0;

    function startTypingMessage() {
        const typeTarget = document.getElementById('typing-text');
        typeTarget.innerHTML = "";

        function typeWriter() {
            if (i < message.length) {
                // Handle line breaks
                if (message.charAt(i) === '\n') {
                    typeTarget.innerHTML += '<br>';
                } else {
                    typeTarget.innerHTML += message.charAt(i);
                }
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        typeWriter();
    }

    // --- 3. Interactive Surprise ---

    // Gift Box
    const giftBox = document.getElementById('gift-box');
    giftBox.addEventListener('click', () => {
        giftBox.classList.toggle('open');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    });

    // Cake Candles & Microphone
    const candles = document.querySelectorAll('.candle');
    const cakeTitle = document.querySelector('.cake-container h3');
    let candlesExtinguished = 0;

    // Toggle (Click to extinguish if Mic fails/user prefers)
    candles.forEach(candle => {
        candle.addEventListener('click', () => {
            if (candle.classList.contains('lit')) {
                extinguishCandle(candle);
            }
        });
    });

    function extinguishCandle(candle) {
        candle.classList.remove('lit');
        candlesExtinguished++;

        // Check if all out
        if (candlesExtinguished === candles.length) {
            cakeTitle.innerText = "Yay! Happy Birthday! 🎂";
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.7 },
                colors: ['#ffe4c4', '#ffc0cb', '#ffd700']
            });
        }
    }

    // Microphone Logic
    function initMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log("Microphone API not supported");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const microphone = audioContext.createMediaStreamSource(stream);
                const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                scriptProcessor.onaudioprocess = function () {
                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    let values = 0;
                    const length = array.length;
                    for (let i = 0; i < length; i++) {
                        values += array[i];
                    }
                    const average = values / length;

                    // Threshold for "blowing"
                    // Adjust this value if too sensitive or not sensitive enough
                    if (average > 40) {
                        // Blow out candles one by one or all? Let's do all for effect
                        candles.forEach(candle => {
                            if (candle.classList.contains('lit')) {
                                extinguishCandle(candle);
                            }
                        });
                    }
                };
            })
            .catch(function (err) {
                console.log("Microphone access denied or error: " + err);
            });
    }

    // --- 4. Cards Mobile FLip ---
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });

    // --- 5. Countdown Timer ---
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (diff < 0) {
            // It's birthday or past
            document.getElementById('countdown-section').innerHTML = "<h2>It's Party Time! 🥳</h2>";
        } else {
            document.getElementById('days').innerText = d;
            document.getElementById('hours').innerText = h;
            document.getElementById('minutes').innerText = m;
        }
    }

    // Run immediately and every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);



    // --- 7. Music Toggle ---
    let isPlaying = false;
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            playPauseBtn.innerText = "🎵 Play Music";
        } else {
            bgMusic.play().catch(e => alert("Please add an audio file source in the HTML code!"));
            playPauseBtn.innerText = "⏸ Pause Music";
        }
        isPlaying = !isPlaying;
    });

    // --- 8. Background Decorations (Hearts) ---
    // Create random floating hearts
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = '💖';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 3 + 2 + 's'; // 2-5s
        heart.style.position = 'fixed';
        heart.style.bottom = '-50px';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        heart.style.opacity = Math.random();
        heart.style.zIndex = '-1';

        // Keyframe set in CSS or inline? Let's add inline keyframe logic or simple transition
        // Easier to just reuse 'float' or make a new one in CSS.
        // Let's add styling for .floating-heart in JS for simplicity or assume CSS handles it
        // Actually, let's inject a style for it.
        heart.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-100vh)', opacity: 0 }
        ], {
            duration: 5000 + Math.random() * 5000,
            iterations: 1,
            easing: 'linear'
        }).onfinish = () => heart.remove();

        document.body.appendChild(heart);
    }

    // Spawn a heart every 500ms
    setInterval(createHeart, 800);

});
