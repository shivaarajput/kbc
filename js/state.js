window.KBC = window.KBC || {};

window.KBC.State = (() => {
    const { DEFAULT_QUIZ_DATA, CANONICAL_KBC_LADDER, formatINR } = window.KBC.Data;

    const STORAGE_KEY = "kbc_quiz_master_saved_state_v2";
    const TIMER_STORAGE_KEY = "kbc_custom_timer_seconds_v1";
    const PLAYER_NAME_KEY = "kbc_player_name_v1";
    const LEADERBOARD_KEY = "kbc_leaderboard_v1";

    function getLeaderboard() {
        try {
            const raw = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
            return Array.isArray(raw) ? raw : [];
        } catch (_) {
            return [];
        }
    }

    function recordLeaderboardEntry(playerName, prize, score, total) {
        if (!prize || prize <= 0) return;
        try {
            const list = getLeaderboard();
            list.push({
                name: String(playerName || "Contestant").trim() || "Contestant",
                prize: Number(prize) || 0,
                score: Number(score) || 0,
                total: Number(total) || 0,
                ts: Date.now()
            });
            list.sort((a, b) => b.prize - a.prize || b.score - a.score || b.ts - a.ts);
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, 5)));
        } catch (_) { }
    }

    function getSavedTimerDuration() {
        try {
            const raw = Number(localStorage.getItem(TIMER_STORAGE_KEY));
            if (Number.isFinite(raw) && raw >= 5 && raw <= 300) {
                return Math.round(raw);
            }
        } catch (_) { }
        return null;
    }

    function saveTimerDuration(seconds) {
        try {
            localStorage.setItem(TIMER_STORAGE_KEY, String(seconds));
        } catch (_) { }
    }

    function getSavedPlayerName() {
        try {
            return localStorage.getItem(PLAYER_NAME_KEY) || "";
        } catch (_) { }
        return "";
    }

    function savePlayerName(name) {
        try {
            localStorage.setItem(PLAYER_NAME_KEY, String(name || "").trim());
        } catch (_) { }
    }

    const state = {
        playerName: getSavedPlayerName() || "Contestant",
        quiz: {
            quizTitle: DEFAULT_QUIZ_DATA.quizTitle,
            timer: getSavedTimerDuration() ?? DEFAULT_QUIZ_DATA.timer,
            questions: DEFAULT_QUIZ_DATA.questions.map((q) => ({ ...q, options: { ...q.options } }))
        },
        currentIdx: 0,
        hasActiveRun: false,
        isFinished: false,
        isLockingAnswer: false,
        score: 0,
        bankedPrize: 0,
        lifelines: {
            fiftyFifty: false,
            audiencePoll: false,
            askExpert: false,
            flipQuestion: false
        },
        questionRuntime: {},
        pendingUpload: null
    };

    function saveGameProgress() {
        try {
            const hasPlayedAnyQuestion = Object.values(state.questionRuntime).some(
                (q) => q && (q.status !== "unanswered" || q.selected || (q.eliminated && q.eliminated.length > 0) || q.clue)
            );
            const shouldPersist = state.hasActiveRun && !state.isFinished && hasPlayedAnyQuestion;

            if (!shouldPersist) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }

            const payload = {
                playerName: state.playerName,
                quiz: state.quiz,
                currentIdx: state.currentIdx,
                hasActiveRun: state.hasActiveRun,
                isFinished: false,
                score: state.score,
                bankedPrize: state.bankedPrize,
                lifelines: state.lifelines,
                questionRuntime: state.questionRuntime,
                savedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (_) { }
    }

    function clearSavedGameProgress() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) { }
    }

    function loadGameProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.quiz || !Array.isArray(parsed.quiz.questions) || parsed.quiz.questions.length === 0) {
                return false;
            }
            if (parsed.isFinished) {
                localStorage.removeItem(STORAGE_KEY);
                return false;
            }

            if (parsed.playerName) {
                state.playerName = String(parsed.playerName);
            }

            const savedTimer = getSavedTimerDuration();
            state.quiz = {
                quizTitle: String(parsed.quiz.quizTitle || DEFAULT_QUIZ_DATA.quizTitle),
                timer: savedTimer ?? (Number(parsed.quiz.timer) || DEFAULT_QUIZ_DATA.timer),
                questions: parsed.quiz.questions.map((q, i) => ({
                    id: q.id ?? i + 1,
                    question: String(q.question || ""),
                    options: {
                        A: String(q.options?.A || ""),
                        B: String(q.options?.B || ""),
                        C: String(q.options?.C || ""),
                        D: String(q.options?.D || "")
                    },
                    correctAnswer: String(q.correctAnswer || "A")
                }))
            };

            const maxIdx = Math.max(0, state.quiz.questions.length - 1);
            state.currentIdx = Math.min(Math.max(0, Number(parsed.currentIdx) || 0), maxIdx);
            state.hasActiveRun = Boolean(parsed.hasActiveRun);
            state.isFinished = false;
            state.isLockingAnswer = false;
            state.score = Number(parsed.score) || 0;
            state.bankedPrize = Number(parsed.bankedPrize) || 0;
            state.lifelines = {
                fiftyFifty: Boolean(parsed.lifelines?.fiftyFifty),
                audiencePoll: Boolean(parsed.lifelines?.audiencePoll),
                askExpert: Boolean(parsed.lifelines?.askExpert),
                flipQuestion: Boolean(parsed.lifelines?.flipQuestion)
            };
            state.questionRuntime =
                parsed.questionRuntime && typeof parsed.questionRuntime === "object"
                    ? parsed.questionRuntime
                    : {};
            return true;
        } catch (_) {
            return false;
        }
    }

    function resetRunState() {
        clearSavedGameProgress();
        state.currentIdx = 0;
        state.hasActiveRun = true;
        state.isFinished = false;
        state.isLockingAnswer = false;
        state.score = 0;
        state.bankedPrize = 0;
        state.lifelines = {
            fiftyFifty: false,
            audiencePoll: false,
            askExpert: false,
            flipQuestion: false
        };
        state.questionRuntime = {};
    }

    function getMilestone(index) {
        if (index < CANONICAL_KBC_LADDER.length) {
            return CANONICAL_KBC_LADDER[index];
        }
        const extraSteps = index - (CANONICAL_KBC_LADDER.length - 1);
        return CANONICAL_KBC_LADDER[CANONICAL_KBC_LADDER.length - 1] * Math.pow(2, extraSteps);
    }

    function getSafeHavenIndexes(totalCount) {
        const set = new Set();
        if (totalCount >= 5) set.add(4);
        if (totalCount >= 10) set.add(9);
        if (totalCount >= 15) set.add(14);
        if (totalCount >= 2 && set.size === 0) {
            set.add(Math.floor(totalCount / 2) - 1);
        }
        return set;
    }

    function getGuaranteedSafeAmount() {
        const total = state.quiz.questions.length;
        const safeIndexes = getSafeHavenIndexes(total);
        let safeAmount = 0;
        for (let i = 0; i < total; i++) {
            const rt = state.questionRuntime[i];
            if (rt && rt.status === "correct" && safeIndexes.has(i)) {
                safeAmount = getMilestone(i);
            }
        }
        return safeAmount;
    }

    function buildLadderHTML() {
        const total = state.quiz.questions.length;
        const safeIndexes = getSafeHavenIndexes(total);
        const rows = [];

        for (let i = total - 1; i >= 0; i--) {
            const stepNo = i + 1;
            const amount = getMilestone(i);
            const rt = state.questionRuntime[i];
            const isCurrent = i === state.currentIdx && !state.isFinished;
            const isPassed = rt && rt.status === "correct";
            const isSafe = safeIndexes.has(i);

            let rowClass = "bg-slate-950/65 border-slate-800/80 text-blue-200/75";
            let badgeClass = "text-blue-300/70";
            let amountClass = "text-slate-200";

            if (isCurrent) {
                rowClass = "bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border-amber-300 text-white shadow-md shadow-amber-500/15";
                badgeClass = "text-amber-300 font-black";
                amountClass = "text-amber-300 font-black";
            } else if (isPassed) {
                rowClass = "bg-emerald-950/60 border-emerald-500/45 text-emerald-200";
                badgeClass = "text-emerald-300";
                amountClass = "text-emerald-300 font-bold";
            } else if (isSafe) {
                rowClass = "bg-blue-950/70 border-amber-400/35 text-amber-100";
                badgeClass = "text-amber-300";
                amountClass = "text-amber-200 font-bold";
            }

            rows.push(`
                <div class="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs ${rowClass}">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-5 text-[11px] tabular-nums ${badgeClass}">${stepNo}</span>
                        ${isSafe ? `<i data-lucide="shield-check" class="w-3.5 h-3.5 text-amber-300 shrink-0"></i>` : ""}
                        ${isPassed ? `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>` : ""}
                    </div>
                    <span class="tabular-nums ${amountClass}">${formatINR(amount)}</span>
                </div>
            `);
        }
        return rows.join("");
    }

    return {
        state,
        saveTimerDuration,
        getSavedTimerDuration,
        savePlayerName,
        getLeaderboard,
        recordLeaderboardEntry,
        saveGameProgress,
        clearSavedGameProgress,
        loadGameProgress,
        resetRunState,
        getMilestone,
        getSafeHavenIndexes,
        getGuaranteedSafeAmount,
        buildLadderHTML
    };
})();

