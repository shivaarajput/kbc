window.KBC = window.KBC || {};

window.KBC.Audio = (() => {
    const AUDIO_URLS_KEY = "kbc_custom_audio_urls_v3";

    const DEFAULT_KBC_AUDIO_URLS = {
        intro: "audio/kbc-intro.mp3",
        question: "audio/kbc-question.mp3",
        bgm: "audio/kbc-suspense.mp3",
        lock: "audio/kbc-lock.mp3",
        correct: "audio/kbc-right.mp3",
        wrong: "audio/kbc-wrong.mp3"
    };

    let ctx = null;
    let sfxEnabled = true;
    let musicEnabled = true;
    let currentScene = "title"; // "title" | "lobby" | "gameplay" | "results"
    let musicInterval = null;
    let introAudioEl = null;
    let bgmAudioEl = null;
    let activeSfxAudioEl = null;
    let stepIndex = 0;

    let customUrls = { ...DEFAULT_KBC_AUDIO_URLS };

    try {
        const saved = JSON.parse(localStorage.getItem(AUDIO_URLS_KEY) || "null");
        if (saved && typeof saved === "object") {
            customUrls = {
                intro: typeof saved.intro === "string" ? saved.intro : DEFAULT_KBC_AUDIO_URLS.intro,
                question: typeof saved.question === "string" ? saved.question : DEFAULT_KBC_AUDIO_URLS.question,
                bgm: typeof saved.bgm === "string" ? saved.bgm : DEFAULT_KBC_AUDIO_URLS.bgm,
                lock: typeof saved.lock === "string" ? saved.lock : DEFAULT_KBC_AUDIO_URLS.lock,
                correct: typeof saved.correct === "string" ? saved.correct : DEFAULT_KBC_AUDIO_URLS.correct,
                wrong: typeof saved.wrong === "string" ? saved.wrong : DEFAULT_KBC_AUDIO_URLS.wrong
            };
        }
    } catch (_) { }

    function ensureContext() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            if (!ctx) {
                ctx = new AudioCtx();
            }
            if (ctx.state === "suspended") {
                ctx.resume().catch(() => { });
            }
            return ctx;
        } catch (_) {
            return null;
        }
    }

    function stopIntro() {
        if (introAudioEl) {
            try {
                introAudioEl.onended = null;
                introAudioEl.onerror = null;
                introAudioEl.pause();
                introAudioEl.currentTime = 0;
            } catch (_) { }
            introAudioEl = null;
        }
    }

    function stopActiveSfx() {
        if (activeSfxAudioEl) {
            try {
                activeSfxAudioEl.onended = null;
                activeSfxAudioEl.onerror = null;
                activeSfxAudioEl.pause();
                activeSfxAudioEl.currentTime = 0;
            } catch (_) { }
            activeSfxAudioEl = null;
        }
    }

    function playSynthTone(freq, duration = 0.16, type = "sine", peak = 0.12, delay = 0) {
        if (!sfxEnabled) return;
        const audioCtx = ensureContext();
        if (!audioCtx) return;

        try {
            const now = audioCtx.currentTime + delay;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration + 0.03);
        } catch (_) { }
    }

    function startTitleIntro() {
        if (!musicEnabled || (currentScene !== "title" && currentScene !== "lobby")) return;
        if (introAudioEl && !introAudioEl.paused) return;

        stopMusic();
        const url = customUrls.intro;
        if (url && url.trim()) {
            try {
                const audio = new Audio(url.trim());
                audio.loop = true;
                audio.volume = 0.55;
                introAudioEl = audio;
                const p = audio.play();
                if (p && typeof p.catch === "function") {
                    p.catch(() => {
                        if (introAudioEl === audio) introAudioEl = null;
                    });
                }
            } catch (_) {
                introAudioEl = null;
            }
        }
    }

    function playExclusiveSfx(url, synthFallbackFn, onComplete) {
        stopActiveSfx();
        let finished = false;
        const done = () => {
            if (finished) return;
            finished = true;
            if (typeof onComplete === "function") onComplete();
        };

        if (!sfxEnabled) {
            done();
            return;
        }

        if (url && url.trim()) {
            try {
                const audio = new Audio(url.trim());
                audio.volume = 0.92;
                activeSfxAudioEl = audio;

                const cleanup = () => {
                    if (activeSfxAudioEl === audio) activeSfxAudioEl = null;
                };

                audio.onended = () => {
                    cleanup();
                    done();
                };
                audio.onerror = () => {
                    cleanup();
                    if (typeof synthFallbackFn === "function") synthFallbackFn();
                    done();
                };

                const promise = audio.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(() => {
                        cleanup();
                        if (typeof synthFallbackFn === "function") synthFallbackFn();
                        done();
                    });
                }
                return;
            } catch (_) { }
        }

        if (typeof synthFallbackFn === "function") {
            synthFallbackFn();
        }
        done();
    }

    function startMusic() {
        if (!musicEnabled || currentScene !== "gameplay") return;
        stopIntro();
        stopMusic();

        if (customUrls.bgm && customUrls.bgm.trim()) {
            try {
                bgmAudioEl = new Audio(customUrls.bgm.trim());
                bgmAudioEl.loop = true;
                bgmAudioEl.volume = 0.34;
                const p = bgmAudioEl.play();
                if (p && typeof p.catch === "function") {
                    p.catch(() => { });
                }
                return;
            } catch (_) { }
        }

        const audioCtx = ensureContext();
        if (!audioCtx || !musicEnabled || currentScene !== "gameplay") return;

        const bassPattern = [110, 110, 123.47, 110, 130.81, 110, 146.83, 130.81];
        musicInterval = setInterval(() => {
            if (!musicEnabled || currentScene !== "gameplay") return;
            try {
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const filter = audioCtx.createBiquadFilter();

                osc.type = "triangle";
                osc.frequency.setValueAtTime(bassPattern[stepIndex % bassPattern.length], now);

                filter.type = "lowpass";
                filter.frequency.setValueAtTime(380, now);
                filter.frequency.exponentialRampToValueAtTime(210, now + 0.45);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.055, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now);
                osc.stop(now + 0.55);
                stepIndex += 1;
            } catch (_) { }
        }, 620);
    }

    function stopMusic() {
        if (bgmAudioEl) {
            try {
                bgmAudioEl.pause();
                bgmAudioEl.currentTime = 0;
            } catch (_) { }
            bgmAudioEl = null;
        }
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    function stopAll() {
        stopIntro();
        stopMusic();
        stopActiveSfx();
    }

    function setScene(sceneName) {
        currentScene = sceneName;
        if (sceneName === "title" || sceneName === "lobby") {
            stopMusic();
            stopActiveSfx();
            startTitleIntro();
        } else if (sceneName === "gameplay") {
            stopIntro();
        } else {
            stopAll();
        }
    }

    function toggleSfx() {
        sfxEnabled = !sfxEnabled;
        if (sfxEnabled) {
            ensureContext();
            click();
        } else {
            stopActiveSfx();
        }
        return sfxEnabled;
    }

    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (musicEnabled) {
            ensureContext();
            if (currentScene === "title" || currentScene === "lobby") {
                startTitleIntro();
            } else if (currentScene === "gameplay") {
                startMusic();
            }
        } else {
            stopIntro();
            stopMusic();
        }
        return musicEnabled;
    }

    function click() {
        playSynthTone(640, 0.05, "triangle", 0.08, 0);
    }

    function questionReveal(onDone) {
        stopIntro();
        stopMusic();
        playExclusiveSfx(
            customUrls.question,
            () => {
                playSynthTone(293.66, 0.16, "triangle", 0.1, 0);
                playSynthTone(440.0, 0.24, "triangle", 0.12, 0.1);
            },
            onDone
        );
    }

    function lockAnswer() {
        stopIntro();
        stopMusic();
        playExclusiveSfx(customUrls.lock, () => {
            playSynthTone(220, 0.18, "triangle", 0.14, 0);
            playSynthTone(330, 0.28, "triangle", 0.15, 0.09);
        });
    }

    function correct() {
        stopIntro();
        stopMusic();
        playExclusiveSfx(customUrls.correct, () => {
            playSynthTone(392.0, 0.14, "triangle", 0.14, 0);
            playSynthTone(493.88, 0.14, "triangle", 0.14, 0.09);
            playSynthTone(587.33, 0.16, "triangle", 0.15, 0.18);
            playSynthTone(783.99, 0.42, "triangle", 0.17, 0.27);
        });
    }

    function wrong() {
        stopIntro();
        stopMusic();
        playExclusiveSfx(customUrls.wrong, () => {
            playSynthTone(220, 0.18, "sawtooth", 0.11, 0);
            playSynthTone(164.81, 0.22, "sawtooth", 0.11, 0.12);
            playSynthTone(130.81, 0.4, "sawtooth", 0.1, 0.24);
        });
    }

    function timeout() {
        stopIntro();
        stopMusic();
        playExclusiveSfx(customUrls.wrong, () => {
            playSynthTone(207.65, 0.2, "sawtooth", 0.11, 0);
            playSynthTone(146.83, 0.42, "sawtooth", 0.1, 0.16);
        });
    }

    function lifeline() {
        playExclusiveSfx("", () => {
            playSynthTone(587.33, 0.14, "sine", 0.12, 0);
            playSynthTone(739.99, 0.14, "sine", 0.12, 0.08);
            playSynthTone(880.0, 0.28, "triangle", 0.14, 0.16);
        });
    }

    function grandWin() {
        stopIntro();
        stopMusic();
        playExclusiveSfx("audio/7-crore-kbc.mp3", () => {
            const notes = [293.66, 369.99, 440.0, 587.33, 440.0, 587.33, 739.99, 880.0];
            notes.forEach((n, idx) => {
                playSynthTone(n, idx >= notes.length - 2 ? 0.55 : 0.14, "triangle", 0.15, idx * 0.11);
            });
        });
    }

    function getCustomUrls() {
        return { ...customUrls };
    }

    function saveCustomUrls(nextUrls) {
        customUrls = {
            intro: String(nextUrls.intro || "").trim(),
            question: String(nextUrls.question || "").trim(),
            bgm: String(nextUrls.bgm || "").trim(),
            lock: String(nextUrls.lock || "").trim(),
            correct: String(nextUrls.correct || "").trim(),
            wrong: String(nextUrls.wrong || "").trim()
        };
        try {
            localStorage.setItem(AUDIO_URLS_KEY, JSON.stringify(customUrls));
        } catch (_) { }
        if (currentScene === "title" || currentScene === "lobby") {
            stopIntro();
            startTitleIntro();
        }
    }

    function resetToDefaultUrls() {
        saveCustomUrls(DEFAULT_KBC_AUDIO_URLS);
    }

    return {
        ensureContext,
        setScene,
        startTitleIntro,
        stopIntro,
        startMusic,
        stopMusic,
        stopAll,
        toggleSfx,
        toggleMusic,
        click,
        questionReveal,
        lockAnswer,
        correct,
        wrong,
        timeout,
        lifeline,
        grandWin,
        getCustomUrls,
        saveCustomUrls,
        resetToDefaultUrls,
        isSfxEnabled: () => sfxEnabled,
        isMusicEnabled: () => musicEnabled
    };
})();

