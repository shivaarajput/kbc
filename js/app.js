window.KBC = window.KBC || {};

window.KBC.App = (() => {
    const {
        FLIP_BACKUP_QUESTIONS,
        formatINR,
        escapeHtml,
        validateAndNormalizeQuiz,
        parseCsvToQuiz,
        downloadSampleJson,
        downloadSampleCsv
    } = window.KBC.Data;
    const AudioEngine = window.KBC.Audio;
    const StateMgr = window.KBC.State;
    const State = StateMgr.state;

    const DOM = {};
    let flashTimer = null;
    let questionRevealSafetyTimer = null;

    function initDOM() {
        const ids = [
            "brandHomeBtn",
            "hudQuizSubtitle",
            "hudQuestionCounter",
            "hudQuestionCounterText",
            "quickSoundBtn",
            "quickSoundIcon",
            "quickSoundText",
            "quickMusicBtn",
            "quickMusicIcon",
            "quickMusicText",
            "quickSettingsBtn",
            // Screen 1: Title
            "screenTitle",
            "titleQuizName",
            "titleQuizStats",
            "titleLeaderboardBox",
            "titleLeaderboardList",
            "startNewGameBtn",
            "resumeGameBtn",
            "resumeGameText",
            "titleUploadBtn",
            "titleHelpBtn",
            "titleSettingsBtn",
            // Screen 2: Lobby / Contestant Entry
            "screenLobby",
            "lobbyQuizTitle",
            "lobbyQuestionCount",
            "lobbyTopPrize",
            "lobbyTimerValue",
            "lobbyTimerDecBtn",
            "lobbyTimerIncBtn",
            "playerNameInput",
            "lobbyEnterHotSeatBtn",
            "lobbyBackBtn",
            // Screen 3: Gameplay
            "screenGameplay",
            "arenaPlayerName",
            "arenaPrizePillBtn",
            "arenaPrizeAmount",
            "inline5050Btn",
            "inlineAudienceBtn",
            "inlineExpertBtn",
            "inlineFlipBtn",
            "timerRingCircle",
            "timerDigits",
            "activeLifelineClue",
            "activeLifelineClueText",
            "dismissLifelineClueBtn",
            "questionTag",
            "questionSafeBadge",
            "questionPromptText",
            "choicesGrid",
            "answerStatusBadge",
            "quitGameBtn",
            "lockAnswerBtn",
            "nextStepBtn",
            "nextStepBtnLabel",
            "desktopLadderCount",
            "desktopLadderList",
            "desktopBankedAmount",
            "desktopSafeAmount",
            // Screen 4: Results
            "screenResults",
            "resultsTitle",
            "resultsSubtitle",
            "resultsPlayerName",
            "resultsPrizeWon",
            "resultsScore",
            "resultsCorrect",
            "resultsAccuracy",
            "resultsBreakdownCount",
            "resultsBreakdownList",
            "playAgainBtn",
            "resultsTitleBtn",
            // Pages: Upload, Settings, Rules
            "screenUpload",
            "uploadBackBtn",
            "downloadSampleJsonBtn",
            "downloadSampleCsvBtn",
            "quizFileInput",
            "selectedFileName",
            "uploadErrorBox",
            "uploadPreviewBox",
            "previewQuizTitle",
            "previewQuizMeta",
            "previewQuestionsList",
            "cancelUploadBtn",
            "confirmImportBtn",
            "screenSettings",
            "settingsBackBtn",
            "settingsSoundBtn",
            "settingsSoundLabel",
            "settingsMusicBtn",
            "settingsMusicLabel",
            "settingsTimerDecBtn",
            "settingsTimerValue",
            "settingsTimerIncBtn",
            "settingsFullscreenBtn",
            "settingsFullscreenLabel",
            "screenRules",
            "rulesBackBtn",
            // In-Game Overlays
            "mobileLadderModal",
            "closeMobileLadderBtn",
            "mobileLadderList",
            "mobileBankedAmount",
            "mobileSafeAmount",
            "pollModal",
            "closePollModalBtn",
            "pollQuestionPreview",
            "pollChartContainer",
            "flashBanner",
            "flashIconWrap",
            "flashIcon",
            "flashTitle",
            "flashSub"
        ];
        ids.forEach((id) => {
            DOM[id] = document.getElementById(id);
        });
    }

    function on(el, event, handler) {
        if (el) el.addEventListener(event, handler);
    }

    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function showFlash(title, sub = "", tone = "gold", iconName = "sparkles") {
        if (!DOM.flashBanner) return;
        if (flashTimer) clearTimeout(flashTimer);

        const toneClasses = {
            gold: "bg-gradient-to-b from-amber-950/95 to-slate-950/95 border-amber-300 text-amber-200",
            success: "flash-callout-win bg-gradient-to-b from-emerald-950/95 to-slate-950/95 border-emerald-400 text-emerald-200",
            danger: "flash-callout-danger flash-callout-shake bg-gradient-to-b from-rose-950/95 to-slate-950/95 border-rose-400 text-rose-200",
            info: "bg-gradient-to-b from-blue-950/95 to-slate-950/95 border-blue-400 text-blue-100"
        };

        const iconWrapClasses = {
            gold: "bg-amber-400/20 border-amber-300 text-amber-300",
            success: "bg-emerald-400/20 border-emerald-300 text-emerald-300",
            danger: "bg-rose-400/20 border-rose-300 text-rose-300",
            info: "bg-blue-400/20 border-blue-300 text-blue-300"
        };

        DOM.flashBanner.className = `flash-callout px-7 py-5 sm:px-10 sm:py-6 rounded-3xl border-2 text-center shadow-2xl max-w-[90vw] min-w-[260px] sm:min-w-[340px] ${toneClasses[tone] || toneClasses.gold}`;
        if (DOM.flashIconWrap) {
            DOM.flashIconWrap.className = `w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2.5 rounded-full flex items-center justify-center border-2 ${iconWrapClasses[tone] || iconWrapClasses.gold}`;
        }
        if (DOM.flashIcon) {
            DOM.flashIcon.setAttribute("data-lucide", iconName);
        }
        DOM.flashTitle.textContent = title;
        DOM.flashSub.textContent = sub;
        DOM.flashSub.classList.toggle("hidden", !sub);

        DOM.flashBanner.classList.remove("hidden");
        void DOM.flashBanner.offsetWidth;
        refreshIcons();

        flashTimer = setTimeout(() => {
            DOM.flashBanner.classList.add("hidden");
        }, 1800);
    }

    function launchConfetti(count = 42) {
        const colors = ["#fde047", "#f59e0b", "#34d399", "#60a5fa", "#f472b6"];
        for (let i = 0; i < count; i++) {
            const piece = document.createElement("div");
            piece.className = "confetti-piece";
            const size = 6 + Math.random() * 6;
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.4}px`;
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.backgroundColor = colors[i % colors.length];
            piece.style.animationDuration = `${1.3 + Math.random() * 1.1}s`;
            piece.style.animationDelay = `${Math.random() * 0.25}s`;
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 2700);
        }
    }

    // -----------------------------------------------------------------------
    // TIMER
    // -----------------------------------------------------------------------
    const Timer = (() => {
        const CIRCUMFERENCE = 169.65;
        let intervalId = null;
        let totalDuration = 30;
        let remaining = 30;

        function render(sec) {
            if (!DOM.timerDigits || !DOM.timerRingCircle) return;
            DOM.timerDigits.textContent = String(Math.max(0, sec));
            const ratio = totalDuration > 0 ? Math.max(0, sec / totalDuration) : 0;
            const offset = CIRCUMFERENCE * (1 - ratio);
            DOM.timerRingCircle.style.strokeDashoffset = String(offset);

            if (sec <= 5) {
                DOM.timerRingCircle.setAttribute("stroke", "#fb7185");
                DOM.timerDigits.className = "absolute text-xs sm:text-sm font-black text-rose-300 tabular-nums";
            } else if (sec <= 10) {
                DOM.timerRingCircle.setAttribute("stroke", "#fb923c");
                DOM.timerDigits.className = "absolute text-xs sm:text-sm font-black text-amber-300 tabular-nums";
            } else {
                DOM.timerRingCircle.setAttribute("stroke", "#fde047");
                DOM.timerDigits.className = "absolute text-xs sm:text-sm font-black text-white tabular-nums";
            }
        }

        function stop() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        function start(seconds, onExpire) {
            stop();
            totalDuration = Math.max(5, Number(seconds) || 30);
            remaining = totalDuration;
            render(remaining);

            intervalId = setInterval(() => {
                remaining -= 1;
                render(remaining);
                if (remaining <= 0) {
                    stop();
                    if (typeof onExpire === "function") onExpire();
                }
            }, 1000);
        }

        function setStatic(seconds) {
            stop();
            totalDuration = Math.max(5, Number(seconds) || 30);
            remaining = totalDuration;
            render(remaining);
        }

        return { start, stop, setStatic };
    })();

    // -----------------------------------------------------------------------
    // LADDER & TIMER SYNC
    // -----------------------------------------------------------------------
    function renderPrizeLadders() {
        const html = StateMgr.buildLadderHTML();
        const safeAmount = StateMgr.getGuaranteedSafeAmount();
        const total = State.quiz.questions.length;

        if (DOM.desktopLadderList) DOM.desktopLadderList.innerHTML = html;
        if (DOM.mobileLadderList) DOM.mobileLadderList.innerHTML = html;
        if (DOM.desktopLadderCount) DOM.desktopLadderCount.textContent = `${total} Steps`;
        if (DOM.desktopBankedAmount) DOM.desktopBankedAmount.textContent = formatINR(State.bankedPrize);
        if (DOM.desktopSafeAmount) DOM.desktopSafeAmount.textContent = formatINR(safeAmount);
        if (DOM.mobileBankedAmount) DOM.mobileBankedAmount.textContent = formatINR(State.bankedPrize);
        if (DOM.mobileSafeAmount) DOM.mobileSafeAmount.textContent = formatINR(safeAmount);
        refreshIcons();
    }

    function syncTimerUI() {
        const val = `${State.quiz.timer}s`;
        if (DOM.settingsTimerValue) DOM.settingsTimerValue.textContent = val;
        if (DOM.lobbyTimerValue) DOM.lobbyTimerValue.textContent = val;
        if (DOM.titleQuizStats) {
            const qCount = State.quiz.questions.length;
            const topPrize = StateMgr.getMilestone(qCount - 1);
            DOM.titleQuizStats.textContent = `${qCount} Questions • ${val} Timer • Top Prize ${formatINR(topPrize)}`;
        }
    }

    function adjustTimer(delta) {
        const current = Number(State.quiz.timer) || 30;
        const next = Math.min(300, Math.max(5, current + delta));
        State.quiz.timer = next;
        StateMgr.saveTimerDuration(next);
        StateMgr.saveGameProgress();
        syncTimerUI();
        AudioEngine.click();
    }

    // -----------------------------------------------------------------------
    // SCREENS (4-STEP GAME FLOW: TITLE -> LOBBY -> HOT SEAT -> RESULTS)
    // -----------------------------------------------------------------------
    const Screens = {
        hideAll() {
            [
                DOM.screenTitle,
                DOM.screenLobby,
                DOM.screenGameplay,
                DOM.screenResults,
                DOM.screenUpload,
                DOM.screenSettings,
                DOM.screenRules
            ].forEach((el) => {
                if (el) el.classList.add("hidden");
            });
        },

        showTitle() {
            if (questionRevealSafetyTimer) {
                clearTimeout(questionRevealSafetyTimer);
                questionRevealSafetyTimer = null;
            }
            Timer.stop();
            State.isLockingAnswer = false;
            closeAllModals();
            this.hideAll();
            DOM.screenTitle.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");

            AudioEngine.setScene("title");

            const qCount = State.quiz.questions.length;
            DOM.hudQuizSubtitle.textContent = State.quiz.quizTitle;
            DOM.titleQuizName.textContent = State.quiz.quizTitle;
            syncTimerUI();

            const answeredCount = Object.values(State.questionRuntime).filter(
                (q) => q && q.status !== "unanswered"
            ).length;
            const canResume = State.hasActiveRun && answeredCount > 0;
            if (canResume) {
                DOM.resumeGameBtn.classList.remove("hidden");
                DOM.resumeGameBtn.classList.add("flex");
                DOM.resumeGameText.textContent = `Continue (${answeredCount}/${qCount})`;
            } else {
                DOM.resumeGameBtn.classList.add("hidden");
                DOM.resumeGameBtn.classList.remove("flex");
            }

            const leaders = StateMgr.getLeaderboard();
            if (DOM.titleLeaderboardBox && DOM.titleLeaderboardList) {
                if (leaders.length > 0) {
                    DOM.titleLeaderboardBox.classList.remove("hidden");
                    DOM.titleLeaderboardList.innerHTML = leaders
                        .map((entry, idx) => `
                            <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                                <span class="text-white font-semibold truncate">${idx + 1}. ${escapeHtml(entry.name)}</span>
                                <span class="text-amber-300 font-extrabold tabular-nums shrink-0">${formatINR(entry.prize)}</span>
                            </div>
                        `)
                        .join("");
                } else {
                    DOM.titleLeaderboardBox.classList.add("hidden");
                }
            }
            refreshIcons();
        },

        showLobby() {
            Timer.stop();
            closeAllModals();
            this.hideAll();
            DOM.screenLobby.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");

            AudioEngine.setScene("lobby");

            const qCount = State.quiz.questions.length;
            const topPrize = StateMgr.getMilestone(qCount - 1);
            if (DOM.lobbyQuizTitle) DOM.lobbyQuizTitle.textContent = State.quiz.quizTitle;
            if (DOM.lobbyQuestionCount) DOM.lobbyQuestionCount.textContent = String(qCount);
            if (DOM.lobbyTopPrize) DOM.lobbyTopPrize.textContent = formatINR(topPrize);
            if (DOM.playerNameInput) {
                DOM.playerNameInput.value = State.playerName === "Contestant" ? "" : State.playerName;
            }
            syncTimerUI();
            refreshIcons();
        },

        showGameplay() {
            closeAllModals();
            this.hideAll();
            DOM.screenGameplay.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("flex");

            if (DOM.arenaPlayerName) DOM.arenaPlayerName.textContent = State.playerName;
            AudioEngine.setScene("gameplay");
            Gameplay.renderCurrentQuestion();
            refreshIcons();
        },

        showResults(reason) {
            Timer.stop();
            State.isLockingAnswer = false;
            closeAllModals();
            this.hideAll();
            DOM.screenResults.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");

            AudioEngine.setScene("results");

            const total = State.quiz.questions.length;
            const correctCount = Object.values(State.questionRuntime).filter(
                (r) => r && r.status === "correct"
            ).length;
            const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

            if (DOM.resultsPlayerName) DOM.resultsPlayerName.textContent = State.playerName;
            DOM.resultsPrizeWon.textContent = formatINR(State.bankedPrize);
            DOM.resultsScore.textContent = String(State.score);
            DOM.resultsCorrect.textContent = `${correctCount}/${total}`;
            DOM.resultsAccuracy.textContent = `${accuracy}%`;

            StateMgr.recordLeaderboardEntry(State.playerName, State.bankedPrize, State.score, total);

            if (reason === "quit") {
                DOM.resultsTitle.textContent = "Walked Away";
                DOM.resultsSubtitle.textContent = `Secured ${formatINR(State.bankedPrize)}`;
            } else if (correctCount === total) {
                DOM.resultsTitle.textContent = "Crorepati Champion!";
                DOM.resultsSubtitle.textContent = State.quiz.quizTitle;
                launchConfetti(64);
            } else {
                DOM.resultsTitle.textContent = "Game Over";
                DOM.resultsSubtitle.textContent = State.quiz.quizTitle;
            }

            if (DOM.resultsBreakdownCount) {
                DOM.resultsBreakdownCount.textContent = `${total} Questions`;
            }
            if (DOM.resultsBreakdownList) {
                DOM.resultsBreakdownList.innerHTML = State.quiz.questions
                    .map((q, i) => {
                        const rt = State.questionRuntime[i];
                        const status = rt ? rt.status : "unanswered";
                        const prize = StateMgr.getMilestone(i);
                        let badge = `<span class="text-slate-400 text-[11px] font-bold">Skipped</span>`;
                        let rowCls = "border-slate-800 bg-slate-950/60";
                        if (status === "correct") {
                            badge = `<span class="text-emerald-300 text-[11px] font-extrabold">${formatINR(prize)}</span>`;
                            rowCls = "border-emerald-500/35 bg-emerald-950/35";
                        } else if (status === "wrong") {
                            badge = `<span class="text-rose-300 text-[11px] font-extrabold">Wrong (${q.correctAnswer})</span>`;
                            rowCls = "border-rose-500/35 bg-rose-950/35";
                        } else if (status === "timeout") {
                            badge = `<span class="text-amber-300 text-[11px] font-extrabold">Time's Up (${q.correctAnswer})</span>`;
                            rowCls = "border-amber-500/35 bg-amber-950/30";
                        }
                        return `
                            <div class="rounded-xl border ${rowCls} px-3 py-2 flex items-center justify-between gap-2 text-xs">
                                <span class="text-white font-semibold truncate">${i + 1}. ${escapeHtml(q.question)}</span>
                                <span class="shrink-0">${badge}</span>
                            </div>
                        `;
                    })
                    .join("");
            }
            refreshIcons();
        },

        showUpload() {
            Timer.stop();
            closeAllModals();
            this.hideAll();
            DOM.screenUpload.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");
            refreshIcons();
        },

        showSettings() {
            Timer.stop();
            closeAllModals();
            this.hideAll();
            DOM.screenSettings.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");
            syncAudioButtonsUI();
            syncTimerUI();
            refreshIcons();
        },

        showRules() {
            Timer.stop();
            closeAllModals();
            this.hideAll();
            DOM.screenRules.classList.remove("hidden");
            DOM.hudQuestionCounter.classList.add("hidden");
            DOM.hudQuestionCounter.classList.remove("flex");
            refreshIcons();
        }
    };

    // -----------------------------------------------------------------------
    // GAMEPLAY
    // -----------------------------------------------------------------------
    const Gameplay = {
        pendingSelection: null,

        getRuntime(idx) {
            if (!State.questionRuntime[idx]) {
                State.questionRuntime[idx] = {
                    status: "unanswered",
                    selected: null,
                    eliminated: [],
                    clue: ""
                };
            }
            return State.questionRuntime[idx];
        },

        startNewRun() {
            const rawName = DOM.playerNameInput ? DOM.playerNameInput.value.trim() : "";
            State.playerName = rawName || "Contestant";
            StateMgr.savePlayerName(State.playerName);
            StateMgr.resetRunState();
            Screens.showGameplay();
        },

        resumeRun() {
            if (!State.hasActiveRun) {
                this.startNewRun();
                return;
            }
            Screens.showGameplay();
        },

        syncLifelinesUI() {
            const setUsed = (btn, used) => {
                if (!btn) return;
                btn.disabled = used || State.isLockingAnswer;
                btn.classList.toggle("opacity-30", used);
            };
            setUsed(DOM.inline5050Btn, State.lifelines.fiftyFifty);
            setUsed(DOM.inlineAudienceBtn, State.lifelines.audiencePoll);
            setUsed(DOM.inlineExpertBtn, State.lifelines.askExpert);
            setUsed(DOM.inlineFlipBtn, State.lifelines.flipQuestion);
            setUsed(DOM.modal5050Btn, State.lifelines.fiftyFifty);
            setUsed(DOM.modalAudienceBtn, State.lifelines.audiencePoll);
            setUsed(DOM.modalExpertBtn, State.lifelines.askExpert);
        },

        renderCurrentQuestion() {
            const total = State.quiz.questions.length;
            const idx = Math.min(Math.max(0, State.currentIdx), total - 1);
            State.currentIdx = idx;

            const q = State.quiz.questions[idx];
            const rt = this.getRuntime(idx);
            const targetPrize = StateMgr.getMilestone(idx);
            const safeIndexes = StateMgr.getSafeHavenIndexes(total);
            const isSafeQ = safeIndexes.has(idx);

            DOM.hudQuizSubtitle.textContent = State.quiz.quizTitle;
            DOM.hudQuestionCounterText.textContent = `${idx + 1}/${total}`;
            DOM.arenaPrizeAmount.textContent = formatINR(targetPrize);
            DOM.questionTag.textContent = `Question ${idx + 1} of ${total}`;
            DOM.questionPromptText.textContent = q.question;

            if (isSafeQ) {
                DOM.questionSafeBadge.classList.remove("hidden");
                DOM.questionSafeBadge.classList.add("inline-flex");
            } else {
                DOM.questionSafeBadge.classList.add("hidden");
                DOM.questionSafeBadge.classList.remove("inline-flex");
            }

            if (rt.clue) {
                DOM.activeLifelineClueText.textContent = rt.clue;
                DOM.activeLifelineClue.classList.remove("hidden");
                DOM.activeLifelineClue.classList.add("flex");
            } else {
                DOM.activeLifelineClue.classList.add("hidden");
                DOM.activeLifelineClue.classList.remove("flex");
            }

            DOM.choicesGrid.innerHTML = ["A", "B", "C", "D"]
                .map((letter, optIdx) => {
                    const isEliminated = rt.eliminated.includes(letter);
                    let extraClass = rt.status === "unanswered" ? "kbc-choice-enter" : "";
                    if (rt.status !== "unanswered") {
                        if (letter === q.correctAnswer) {
                            extraClass = "kbc-choice-correct";
                        } else if (letter === rt.selected && rt.status === "wrong") {
                            extraClass = "kbc-choice-wrong";
                        }
                    }
                    if (isEliminated) {
                        extraClass += " kbc-choice-eliminated";
                    }

                    const delayStyle = rt.status === "unanswered" ? `style="animation-delay: ${optIdx * 70}ms"` : "";
                    const disabledAttr = rt.status !== "unanswered" || isEliminated ? "disabled" : "";
                    return `
                        <button type="button" data-option="${letter}" ${disabledAttr} ${delayStyle}
                            class="kbc-choice relative z-10 w-full min-h-[48px] sm:min-h-[56px] px-3.5 sm:px-4 py-2.5 rounded-2xl flex items-center gap-3 text-left cursor-pointer disabled:cursor-default ${extraClass}">
                            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/15 border border-amber-400/50 flex items-center justify-center font-display text-xs sm:text-sm font-black text-amber-300 shrink-0">
                                ${letter}
                            </span>
                            <span class="text-xs sm:text-sm md:text-base font-semibold text-white leading-snug break-words flex-1">
                                ${escapeHtml(q.options[letter])}
                            </span>
                        </button>
                    `;
                })
                .join("");

            DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    this.handleAnswerSelection(btn.getAttribute("data-option"));
                });
            });

            if (rt.status === "unanswered") {
                if (questionRevealSafetyTimer) {
                    clearTimeout(questionRevealSafetyTimer);
                    questionRevealSafetyTimer = null;
                }

                this.pendingSelection = null;
                Timer.setStatic(State.quiz.timer);
                DOM.answerStatusBadge.textContent = "Presenting question...";
                DOM.answerStatusBadge.className = "text-xs sm:text-sm font-bold text-amber-300 leading-snug break-words";
                DOM.lockAnswerBtn.classList.remove("hidden");
                DOM.lockAnswerBtn.classList.add("flex");
                DOM.lockAnswerBtn.disabled = true;
                DOM.nextStepBtn.classList.add("hidden");
                DOM.nextStepBtn.classList.remove("flex");
                DOM.nextStepBtn.disabled = true;
                DOM.quitGameBtn.disabled = true;
                DOM.nextStepBtnLabel.textContent = idx === total - 1 ? "Finish" : "Next";

                DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                    btn.classList.remove("kbc-choice-enter");
                    btn.classList.add("opacity-0", "pointer-events-none");
                });

                let revealed = false;
                const finishReveal = () => {
                    if (revealed) return;
                    revealed = true;
                    if (questionRevealSafetyTimer) {
                        clearTimeout(questionRevealSafetyTimer);
                        questionRevealSafetyTimer = null;
                    }
                    if (
                        DOM.screenGameplay.classList.contains("hidden") ||
                        State.currentIdx !== idx ||
                        rt.status !== "unanswered" ||
                        State.isLockingAnswer
                    ) {
                        return;
                    }

                    DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn, optIdx) => {
                        btn.classList.remove("opacity-0", "pointer-events-none");
                        btn.style.animationDelay = `${optIdx * 80}ms`;
                        btn.classList.add("kbc-choice-enter");
                    });

                    DOM.quitGameBtn.disabled = false;
                    DOM.answerStatusBadge.textContent = "Select an option to lock";
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-bold text-blue-200/85 leading-snug break-words";
                    AudioEngine.startMusic();
                    Timer.start(State.quiz.timer, () => this.handleTimeout());
                };

                AudioEngine.stopMusic();
                if (AudioEngine.isSfxEnabled()) {
                    questionRevealSafetyTimer = setTimeout(finishReveal, 6000);
                    AudioEngine.questionReveal(finishReveal);
                } else {
                    questionRevealSafetyTimer = setTimeout(finishReveal, 650);
                }
            } else {
                this.pendingSelection = null;
                Timer.setStatic(0);
                AudioEngine.stopMusic();
                DOM.lockAnswerBtn.classList.add("hidden");
                DOM.lockAnswerBtn.classList.remove("flex");
                DOM.lockAnswerBtn.disabled = true;
                DOM.nextStepBtn.classList.remove("hidden");
                DOM.nextStepBtn.classList.add("flex");
                DOM.nextStepBtn.disabled = false;
                DOM.quitGameBtn.disabled = true;
                DOM.nextStepBtnLabel.textContent = idx === total - 1 ? "Results" : "Next";

                if (rt.status === "correct") {
                    DOM.answerStatusBadge.textContent = `Correct! ${formatINR(targetPrize)}`;
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-emerald-300 leading-snug break-words";
                } else if (rt.status === "timeout") {
                    DOM.answerStatusBadge.textContent = `Time's Up! Answer: ${q.correctAnswer}`;
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-rose-300 leading-snug break-words";
                } else {
                    DOM.answerStatusBadge.textContent = `Wrong! Answer: ${q.correctAnswer}`;
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-rose-300 leading-snug break-words";
                }
            }

            this.syncLifelinesUI();
            renderPrizeLadders();
            refreshIcons();
        },

        handleAnswerSelection(letter) {
            const idx = State.currentIdx;
            const rt = this.getRuntime(idx);
            if (rt.status !== "unanswered" || State.isLockingAnswer || rt.eliminated.includes(letter)) {
                return;
            }
            if (questionRevealSafetyTimer) return; // Still presenting question

            this.pendingSelection = letter;
            AudioEngine.click();

            DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                btn.classList.toggle("kbc-choice-selected", btn.getAttribute("data-option") === letter);
            });

            DOM.lockAnswerBtn.disabled = false;
            DOM.answerStatusBadge.textContent = `Option ${letter} selected — Lock Kiya Jaye?`;
            DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-amber-300 leading-snug break-words";
        },

        confirmLockAnswer() {
            const letter = this.pendingSelection;
            const idx = State.currentIdx;
            const q = State.quiz.questions[idx];
            const rt = this.getRuntime(idx);
            if (!letter || rt.status !== "unanswered" || State.isLockingAnswer || rt.eliminated.includes(letter)) {
                return;
            }

            State.isLockingAnswer = true;
            this.pendingSelection = null;
            Timer.stop();
            AudioEngine.stopMusic();
            AudioEngine.lockAnswer();

            DOM.quitGameBtn.disabled = true;
            DOM.lockAnswerBtn.disabled = true;
            this.syncLifelinesUI();

            DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                btn.disabled = true;
                btn.classList.remove("kbc-choice-selected");
                if (btn.getAttribute("data-option") === letter) {
                    btn.classList.add("kbc-choice-locked");
                }
            });

            DOM.answerStatusBadge.textContent = `Locked ${letter}...`;
            DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-amber-300 leading-snug break-words";

            setTimeout(() => {
                const isCorrect = letter === q.correctAnswer;
                rt.selected = letter;
                State.isLockingAnswer = false;

                DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                    const opt = btn.getAttribute("data-option");
                    btn.classList.remove("kbc-choice-locked");
                    if (opt === q.correctAnswer) {
                        btn.classList.add("kbc-choice-correct");
                    } else if (opt === letter && !isCorrect) {
                        btn.classList.add("kbc-choice-wrong");
                    }
                });

                if (isCorrect) {
                    rt.status = "correct";
                    const prize = StateMgr.getMilestone(idx);
                    const safeIndexes = StateMgr.getSafeHavenIndexes(State.quiz.questions.length);
                    const isPadaav = safeIndexes.has(idx);
                    State.score += 1;
                    State.bankedPrize = prize;
                    AudioEngine.correct();
                    launchConfetti(isPadaav ? 48 : 28);
                    showFlash(
                        isPadaav ? "Padaav Reached!" : "Sahi Jawaab!",
                        formatINR(prize),
                        "success",
                        "trophy"
                    );
                    DOM.answerStatusBadge.textContent = `Correct! ${formatINR(prize)}`;
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-emerald-300 leading-snug break-words";
                } else {
                    rt.status = "wrong";
                    const safeFallback = StateMgr.getGuaranteedSafeAmount();
                    State.bankedPrize = safeFallback;
                    AudioEngine.wrong();
                    showFlash("Galat Jawaab", `Correct Answer: ${q.correctAnswer}`, "danger", "x-circle");
                    DOM.answerStatusBadge.textContent = `Wrong! Safe Prize: ${formatINR(safeFallback)}`;
                    DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-rose-300 leading-snug break-words";
                }

                DOM.lockAnswerBtn.classList.add("hidden");
                DOM.lockAnswerBtn.classList.remove("flex");
                DOM.nextStepBtn.classList.remove("hidden");
                DOM.nextStepBtn.classList.add("flex");
                DOM.nextStepBtn.disabled = false;
                DOM.nextStepBtnLabel.textContent = idx === State.quiz.questions.length - 1 ? "Results" : "Next";
                this.syncLifelinesUI();
                renderPrizeLadders();
                StateMgr.saveGameProgress();
            }, 2200);
        },

        handleTimeout() {
            const idx = State.currentIdx;
            const q = State.quiz.questions[idx];
            const rt = this.getRuntime(idx);
            if (rt.status !== "unanswered" || State.isLockingAnswer) return;

            // If user already selected an option before timer ran out, auto-lock it!
            if (this.pendingSelection && !rt.eliminated.includes(this.pendingSelection)) {
                showFlash("Time's Up!", `Auto-locking ${this.pendingSelection}`, "gold", "lock");
                this.confirmLockAnswer();
                return;
            }

            rt.status = "timeout";
            const safeFallback = StateMgr.getGuaranteedSafeAmount();
            State.bankedPrize = safeFallback;
            AudioEngine.stopMusic();
            AudioEngine.timeout();

            DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                btn.disabled = true;
                if (btn.getAttribute("data-option") === q.correctAnswer) {
                    btn.classList.add("kbc-choice-correct");
                }
            });

            DOM.quitGameBtn.disabled = true;
            DOM.lockAnswerBtn.classList.add("hidden");
            DOM.lockAnswerBtn.classList.remove("flex");
            DOM.nextStepBtn.classList.remove("hidden");
            DOM.nextStepBtn.classList.add("flex");
            DOM.nextStepBtn.disabled = false;
            DOM.nextStepBtnLabel.textContent = idx === State.quiz.questions.length - 1 ? "Results" : "Next";
            DOM.answerStatusBadge.textContent = `Time's Up! Answer: ${q.correctAnswer}`;
            DOM.answerStatusBadge.className = "text-xs sm:text-sm font-extrabold text-rose-300 leading-snug break-words";

            showFlash("Time's Up!", `Correct Answer: ${q.correctAnswer}`, "danger", "alarm-clock");
            this.syncLifelinesUI();
            renderPrizeLadders();
            StateMgr.saveGameProgress();
        },

        goNextStep() {
            AudioEngine.click();
            const total = State.quiz.questions.length;
            const rt = this.getRuntime(State.currentIdx);

            if (rt.status === "wrong" || rt.status === "timeout") {
                State.isFinished = true;
                State.hasActiveRun = false;
                StateMgr.clearSavedGameProgress();
                Screens.showResults("ended");
                return;
            }

            if (State.currentIdx >= total - 1) {
                State.isFinished = true;
                State.hasActiveRun = false;
                StateMgr.clearSavedGameProgress();
                AudioEngine.grandWin();
                Screens.showResults("won");
                return;
            }

            State.currentIdx += 1;
            StateMgr.saveGameProgress();
            this.renderCurrentQuestion();
        },

        quitGame() {
            const rt = this.getRuntime(State.currentIdx);
            if (rt.status !== "unanswered" || State.isLockingAnswer) return;
            Timer.stop();
            AudioEngine.stopMusic();
            AudioEngine.click();
            State.isFinished = true;
            State.hasActiveRun = false;
            StateMgr.clearSavedGameProgress();
            Screens.showResults("quit");
        },

        use5050() {
            const rt = this.getRuntime(State.currentIdx);
            if (State.lifelines.fiftyFifty || rt.status !== "unanswered" || State.isLockingAnswer) return;

            const q = State.quiz.questions[State.currentIdx];
            const wrongKeys = ["A", "B", "C", "D"].filter((k) => k !== q.correctAnswer);
            for (let i = wrongKeys.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wrongKeys[i], wrongKeys[j]] = [wrongKeys[j], wrongKeys[i]];
            }

            rt.eliminated = wrongKeys.slice(0, 2);
            State.lifelines.fiftyFifty = true;
            AudioEngine.lifeline();
            closeAllModals();

            DOM.choicesGrid.querySelectorAll("[data-option]").forEach((btn) => {
                const opt = btn.getAttribute("data-option");
                if (rt.eliminated.includes(opt)) {
                    btn.disabled = true;
                    btn.classList.add("kbc-choice-eliminated");
                }
            });

            this.syncLifelinesUI();
            StateMgr.saveGameProgress();
            showFlash("50:50", "Two wrong options removed", "gold");
        },

        useAudiencePoll() {
            const rt = this.getRuntime(State.currentIdx);
            if (State.lifelines.audiencePoll || rt.status !== "unanswered" || State.isLockingAnswer) return;

            const q = State.quiz.questions[State.currentIdx];
            const activeKeys = ["A", "B", "C", "D"].filter((k) => !rt.eliminated.includes(k));
            const scores = { A: 0, B: 0, C: 0, D: 0 };

            let remainingPct = 100;
            const correctPct = Math.min(78, 52 + Math.floor(Math.random() * 20));
            scores[q.correctAnswer] = correctPct;
            remainingPct -= correctPct;

            const others = activeKeys.filter((k) => k !== q.correctAnswer);
            others.forEach((k, idx) => {
                if (idx === others.length - 1) {
                    scores[k] = remainingPct;
                } else {
                    const share = Math.floor(Math.random() * (remainingPct + 1));
                    scores[k] = share;
                    remainingPct -= share;
                }
            });

            State.lifelines.audiencePoll = true;
            AudioEngine.lifeline();
            this.syncLifelinesUI();
            StateMgr.saveGameProgress();

            DOM.pollQuestionPreview.textContent = q.question;
            const maxVal = Math.max(...Object.values(scores), 1);
            DOM.pollChartContainer.innerHTML = ["A", "B", "C", "D"]
                .map((k) => {
                    const pct = scores[k];
                    const heightPct = Math.max(8, Math.round((pct / maxVal) * 100));
                    const isTop = pct === maxVal;
                    return `
                        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
                            <span class="text-xs font-extrabold tabular-nums ${isTop ? "text-amber-300" : "text-blue-200"}">${pct}%</span>
                            <div class="w-full h-32 rounded-xl bg-slate-900/90 border border-blue-400/20 p-1 flex items-end">
                                <div class="w-full rounded-lg transition-all duration-500 ${isTop ? "bg-gradient-to-t from-amber-500 to-yellow-300" : "bg-gradient-to-t from-blue-600 to-sky-400"}"
                                    style="height: ${heightPct}%"></div>
                            </div>
                            <span class="font-display text-xs font-black text-amber-300">${k}</span>
                        </div>
                    `;
                })
                .join("");

            openModal(DOM.pollModal);
        },

        useAskExpert() {
            const rt = this.getRuntime(State.currentIdx);
            if (State.lifelines.askExpert || rt.status !== "unanswered" || State.isLockingAnswer) return;

            const q = State.quiz.questions[State.currentIdx];
            const clueText = `Expert suggests Option ${q.correctAnswer}: "${q.options[q.correctAnswer]}"`;

            rt.clue = clueText;
            State.lifelines.askExpert = true;
            AudioEngine.lifeline();
            closeAllModals();

            DOM.activeLifelineClueText.textContent = clueText;
            DOM.activeLifelineClue.classList.remove("hidden");
            DOM.activeLifelineClue.classList.add("flex");

            this.syncLifelinesUI();
            StateMgr.saveGameProgress();
        },

        useFlipQuestion() {
            const idx = State.currentIdx;
            const rt = this.getRuntime(idx);
            if (State.lifelines.flipQuestion || rt.status !== "unanswered" || State.isLockingAnswer || questionRevealSafetyTimer) {
                return;
            }

            const existingPrompts = new Set(State.quiz.questions.map((q) => q.question));
            const candidates = FLIP_BACKUP_QUESTIONS.filter((q) => !existingPrompts.has(q.question));
            const replacement = candidates.length > 0
                ? candidates[Math.floor(Math.random() * candidates.length)]
                : FLIP_BACKUP_QUESTIONS[0];

            if (!replacement) return;

            Timer.stop();
            AudioEngine.stopMusic();
            AudioEngine.lifeline();

            State.lifelines.flipQuestion = true;
            State.quiz.questions[idx] = {
                id: replacement.id,
                question: replacement.question,
                options: { ...replacement.options },
                correctAnswer: replacement.correctAnswer
            };
            State.questionRuntime[idx] = {
                status: "unanswered",
                selected: null,
                eliminated: [],
                clue: ""
            };
            this.pendingSelection = null;

            showFlash("Question Flipped!", "New question incoming", "gold", "refresh-cw");
            StateMgr.saveGameProgress();
            this.renderCurrentQuestion();
        }
    };

    // -----------------------------------------------------------------------
    // UPLOAD MANAGER
    // -----------------------------------------------------------------------
    const UploadManager = {
        open() {
            State.pendingUpload = null;
            if (DOM.quizFileInput) DOM.quizFileInput.value = "";
            if (DOM.selectedFileName) DOM.selectedFileName.textContent = "Supports Hindi, English & Unicode text • Validated before import";
            DOM.uploadErrorBox.classList.add("hidden");
            DOM.uploadPreviewBox.classList.add("hidden");
            DOM.confirmImportBtn.disabled = true;
            Screens.showUpload();
        },

        close() {
            State.pendingUpload = null;
            if (DOM.quizFileInput) DOM.quizFileInput.value = "";
            Screens.showTitle();
        },

        showError(msg) {
            State.pendingUpload = null;
            DOM.confirmImportBtn.disabled = true;
            DOM.uploadPreviewBox.classList.add("hidden");
            DOM.uploadErrorBox.textContent = msg;
            DOM.uploadErrorBox.classList.remove("hidden");
        },

        showPreview(quizObj) {
            State.pendingUpload = quizObj;
            DOM.uploadErrorBox.classList.add("hidden");
            DOM.uploadPreviewBox.classList.remove("hidden");
            DOM.confirmImportBtn.disabled = false;

            DOM.previewQuizTitle.textContent = quizObj.quizTitle;
            DOM.previewQuizMeta.textContent = `${quizObj.questions.length} Questions • ${quizObj.timer}s Timer`;
            DOM.previewQuestionsList.innerHTML = quizObj.questions
                .slice(0, 12)
                .map((q, i) => `
                    <div class="rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-2 text-xs">
                        <div class="font-bold text-white">${i + 1}. ${escapeHtml(q.question)}</div>
                        <div class="text-emerald-300/90 mt-0.5 font-semibold">Answer: ${q.correctAnswer} — ${escapeHtml(q.options[q.correctAnswer])}</div>
                    </div>
                `)
                .join("");
        },

        handleFile(file) {
            if (!file) return;
            const lowerName = file.name.toLowerCase();
            if (!lowerName.endsWith(".json") && !lowerName.endsWith(".csv")) {
                this.showError("Please select a .json or .csv file.");
                return;
            }
            DOM.selectedFileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const text = String(evt.target.result || "").replace(/^\uFEFF/, "").trim();
                    if (!text) throw new Error("The selected file is empty.");

                    let validated;
                    if (lowerName.endsWith(".json")) {
                        const parsed = JSON.parse(text);
                        const fallbackTitle = file.name.replace(/\.json$/i, "").replace(/[_-]+/g, " ").trim() || "Custom Quiz";
                        validated = validateAndNormalizeQuiz(parsed, fallbackTitle, State.quiz.timer);
                    } else {
                        validated = parseCsvToQuiz(text, file.name);
                        validated.timer = State.quiz.timer;
                    }
                    this.showPreview(validated);
                } catch (err) {
                    this.showError(err && err.message ? err.message : "Invalid quiz file.");
                }
            };
            reader.onerror = () => this.showError("Could not read file.");
            reader.readAsText(file, "UTF-8");
        },

        confirmImport() {
            if (!State.pendingUpload) return;
            StateMgr.clearSavedGameProgress();
            State.quiz = {
                quizTitle: State.pendingUpload.quizTitle,
                timer: StateMgr.getSavedTimerDuration() ?? State.pendingUpload.timer,
                questions: State.pendingUpload.questions.map((q) => ({ ...q, options: { ...q.options } }))
            };
            State.currentIdx = 0;
            State.score = 0;
            State.bankedPrize = 0;
            State.hasActiveRun = false;
            State.isFinished = false;
            State.questionRuntime = {};
            State.lifelines = { fiftyFifty: false, audiencePoll: false, askExpert: false };

            this.close();
            AudioEngine.correct();
            Screens.showTitle();
            showFlash("Quiz Loaded", `${State.quiz.questions.length} Questions`, "success");
        }
    };

    // -----------------------------------------------------------------------
    // MODALS & AUDIO UI
    // -----------------------------------------------------------------------
    function closeModalElement(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add("hidden");
        modalEl.classList.remove("flex");
    }

    function closeAllModals() {
        [
            DOM.mobileLadderModal,
            DOM.pollModal
        ].forEach(closeModalElement);
    }

    function openModal(modalEl) {
        if (!modalEl) return;
        closeAllModals();
        modalEl.classList.remove("hidden");
        modalEl.classList.add("flex");
        refreshIcons();
    }

    function syncAudioButtonsUI() {
        const sfxOn = AudioEngine.isSfxEnabled();
        const musicOn = AudioEngine.isMusicEnabled();

        const onBtnClass = "h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-emerald-400/60 bg-emerald-950/70 text-emerald-200 hover:bg-emerald-900/80 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition";
        const offBtnClass = "h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-rose-400/50 bg-rose-950/70 text-rose-300 hover:bg-rose-900/80 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition";

        if (DOM.quickSoundBtn) {
            DOM.quickSoundBtn.className = sfxOn ? onBtnClass : offBtnClass;
            DOM.quickSoundBtn.setAttribute("aria-pressed", String(sfxOn));
        }
        if (DOM.quickSoundIcon) {
            DOM.quickSoundIcon.setAttribute("data-lucide", sfxOn ? "volume-2" : "volume-x");
            DOM.quickSoundIcon.className = `w-4 h-4 shrink-0 ${sfxOn ? "text-emerald-300" : "text-rose-300"}`;
        }
        if (DOM.quickSoundText) {
            DOM.quickSoundText.textContent = sfxOn ? "SFX: ON" : "SFX: OFF";
        }

        if (DOM.quickMusicBtn) {
            DOM.quickMusicBtn.className = musicOn ? onBtnClass : offBtnClass;
            DOM.quickMusicBtn.setAttribute("aria-pressed", String(musicOn));
        }
        if (DOM.quickMusicIcon) {
            DOM.quickMusicIcon.setAttribute("data-lucide", musicOn ? "music" : "volume-off");
            DOM.quickMusicIcon.className = `w-4 h-4 shrink-0 ${musicOn ? "text-emerald-300" : "text-rose-300"}`;
        }
        if (DOM.quickMusicText) {
            DOM.quickMusicText.textContent = musicOn ? "Music: ON" : "Music: OFF";
        }

        if (DOM.settingsSoundLabel) {
            DOM.settingsSoundLabel.textContent = sfxOn ? "ON" : "OFF";
            DOM.settingsSoundLabel.className = `px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${sfxOn ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`;
        }
        if (DOM.settingsMusicLabel) {
            DOM.settingsMusicLabel.textContent = musicOn ? "ON" : "OFF";
            DOM.settingsMusicLabel.className = `px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${musicOn ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`;
        }
        refreshIcons();
    }

    function handleToggleSfx() {
        AudioEngine.toggleSfx();
        syncAudioButtonsUI();
    }

    function handleToggleMusic() {
        AudioEngine.toggleMusic();
        syncAudioButtonsUI();
    }

    // -----------------------------------------------------------------------
    // EVENT BINDINGS
    // -----------------------------------------------------------------------
    function bindEvents() {
        on(DOM.brandHomeBtn, "click", () => {
            AudioEngine.click();
            Screens.showTitle();
        });

        on(DOM.quickSoundBtn, "click", handleToggleSfx);
        on(DOM.quickMusicBtn, "click", handleToggleMusic);
        on(DOM.quickSettingsBtn, "click", () => {
            AudioEngine.click();
            Screens.showSettings();
        });

        function enterFullscreenOnStart() {
            try {
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => { });
                    if (DOM.settingsFullscreenLabel) DOM.settingsFullscreenLabel.textContent = "Exit Fullscreen";
                }
            } catch (_) { }
        }

        // Screen 1: Title
        on(DOM.startNewGameBtn, "click", () => {
            AudioEngine.ensureContext();
            AudioEngine.click();
            enterFullscreenOnStart();
            Screens.showLobby();
        });
        on(DOM.resumeGameBtn, "click", () => {
            AudioEngine.ensureContext();
            AudioEngine.click();
            enterFullscreenOnStart();
            Gameplay.resumeRun();
        });
        on(DOM.titleUploadBtn, "click", () => {
            AudioEngine.click();
            UploadManager.open();
        });
        on(DOM.titleHelpBtn, "click", () => {
            AudioEngine.click();
            Screens.showRules();
        });
        on(DOM.titleSettingsBtn, "click", () => {
            AudioEngine.click();
            Screens.showSettings();
        });

        // Screen 2: Lobby
        on(DOM.lobbyTimerDecBtn, "click", () => adjustTimer(-5));
        on(DOM.lobbyTimerIncBtn, "click", () => adjustTimer(5));
        on(DOM.lobbyEnterHotSeatBtn, "click", () => {
            AudioEngine.ensureContext();
            AudioEngine.click();
            enterFullscreenOnStart();
            Gameplay.startNewRun();
        });
        on(DOM.lobbyBackBtn, "click", () => {
            AudioEngine.click();
            Screens.showTitle();
        });
        on(DOM.playerNameInput, "keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                AudioEngine.ensureContext();
                enterFullscreenOnStart();
                Gameplay.startNewRun();
            }
        });

        // Screen 3: Gameplay
        on(DOM.arenaPrizePillBtn, "click", () => {
            AudioEngine.click();
            renderPrizeLadders();
            openModal(DOM.mobileLadderModal);
        });
        on(DOM.inline5050Btn, "click", () => Gameplay.use5050());
        on(DOM.inlineAudienceBtn, "click", () => Gameplay.useAudiencePoll());
        on(DOM.inlineExpertBtn, "click", () => Gameplay.useAskExpert());
        on(DOM.inlineFlipBtn, "click", () => Gameplay.useFlipQuestion());
        on(DOM.modal5050Btn, "click", () => Gameplay.use5050());
        on(DOM.modalAudienceBtn, "click", () => Gameplay.useAudiencePoll());
        on(DOM.modalExpertBtn, "click", () => Gameplay.useAskExpert());
        on(DOM.dismissLifelineClueBtn, "click", () => {
            DOM.activeLifelineClue.classList.add("hidden");
            DOM.activeLifelineClue.classList.remove("flex");
        });
        on(DOM.quitGameBtn, "click", () => Gameplay.quitGame());
        on(DOM.lockAnswerBtn, "click", () => Gameplay.confirmLockAnswer());
        on(DOM.nextStepBtn, "click", () => Gameplay.goNextStep());

        // Screen 4: Results
        on(DOM.playAgainBtn, "click", () => {
            AudioEngine.ensureContext();
            AudioEngine.click();
            Gameplay.startNewRun();
        });
        on(DOM.resultsTitleBtn, "click", () => {
            AudioEngine.click();
            Screens.showTitle();
        });

        // Settings Page
        on(DOM.settingsBackBtn, "click", () => {
            AudioEngine.click();
            Screens.showTitle();
        });
        on(DOM.settingsSoundBtn, "click", handleToggleSfx);
        on(DOM.settingsMusicBtn, "click", handleToggleMusic);
        on(DOM.settingsTimerDecBtn, "click", () => adjustTimer(-5));
        on(DOM.settingsTimerIncBtn, "click", () => adjustTimer(5));
        on(DOM.settingsFullscreenBtn, "click", async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                    if (DOM.settingsFullscreenLabel) DOM.settingsFullscreenLabel.textContent = "Exit Fullscreen";
                } else {
                    await document.exitFullscreen();
                    if (DOM.settingsFullscreenLabel) DOM.settingsFullscreenLabel.textContent = "Fullscreen";
                }
            } catch (_) { }
        });

        // Rules Page
        on(DOM.rulesBackBtn, "click", () => {
            AudioEngine.click();
            Screens.showTitle();
        });

        // Upload Page
        on(DOM.uploadBackBtn, "click", () => {
            AudioEngine.click();
            UploadManager.close();
        });
        on(DOM.cancelUploadBtn, "click", () => {
            AudioEngine.click();
            UploadManager.close();
        });
        on(DOM.downloadSampleJsonBtn, "click", () => {
            AudioEngine.click();
            downloadSampleJson();
        });
        on(DOM.downloadSampleCsvBtn, "click", () => {
            AudioEngine.click();
            downloadSampleCsv();
        });
        on(DOM.quizFileInput, "change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) UploadManager.handleFile(file);
        });
        on(DOM.confirmImportBtn, "click", () => UploadManager.confirmImport());

        // In-Game Overlays
        on(DOM.closeMobileLadderBtn, "click", closeAllModals);
        on(DOM.closePollModalBtn, "click", closeAllModals);

        [DOM.mobileLadderModal, DOM.pollModal].forEach((modalEl) => {
            on(modalEl, "click", (e) => {
                if (e.target === modalEl) closeAllModals();
            });
        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllModals();
                return;
            }
            const activeModal = [DOM.mobileLadderModal, DOM.pollModal].some(
                (m) => m && !m.classList.contains("hidden")
            );
            if (activeModal) return;

            if (!DOM.screenGameplay.classList.contains("hidden")) {
                const key = e.key.toUpperCase();
                if (["A", "B", "C", "D"].includes(key)) {
                    Gameplay.handleAnswerSelection(key);
                } else if (e.key === "Enter" && DOM.lockAnswerBtn && !DOM.lockAnswerBtn.classList.contains("hidden") && !DOM.lockAnswerBtn.disabled) {
                    e.preventDefault();
                    Gameplay.confirmLockAnswer();
                } else if ((e.key === "Enter" || e.key === " ") && !DOM.nextStepBtn.classList.contains("hidden") && !DOM.nextStepBtn.disabled) {
                    e.preventDefault();
                    Gameplay.goNextStep();
                }
            }
        });
    }

    function bootApp() {
        initDOM();
        StateMgr.loadGameProgress();
        bindEvents();
        syncAudioButtonsUI();
        Screens.showTitle();
        refreshIcons();
        window.addEventListener("load", refreshIcons);

        // Start Title Screen KBC Intro immediately on load
        AudioEngine.ensureContext();
        AudioEngine.startTitleIntro();

        // Fallback unlock on first interaction if browser blocks initial unmuted autoplay
        const unlockTitleIntroOnFirstTap = (e) => {
            if (e.target && e.target.closest("#startNewGameBtn, #resumeGameBtn")) return;
            if (DOM.screenTitle && !DOM.screenTitle.classList.contains("hidden")) {
                AudioEngine.ensureContext();
                AudioEngine.startTitleIntro();
            }
        };
        document.addEventListener("pointerdown", unlockTitleIntroOnFirstTap, { once: true });
        document.addEventListener("keydown", unlockTitleIntroOnFirstTap, { once: true });
    }

    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", bootApp);
    } else {
        bootApp();
    }

    return { Screens, Gameplay };
})();

