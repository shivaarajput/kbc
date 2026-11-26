window.KBC = window.KBC || {};

window.KBC.Data = (() => {
    const DEFAULT_QUIZ_DATA = {
        quizTitle: "Kaun Banega Crorepati",
        timer: 30,
        questions: [
            {
                id: 1,
                question: "Which planet in our solar system is known as the 'Red Planet'?",
                options: {
                    A: "Venus",
                    B: "Mars",
                    C: "Jupiter",
                    D: "Saturn"
                },
                correctAnswer: "B"
            },
            {
                id: 2,
                question: "Who wrote the Indian National Anthem 'Jana Gana Mana'?",
                options: {
                    A: "Bankim Chandra Chatterjee",
                    B: "Rabindranath Tagore",
                    C: "Sarojini Naidu",
                    D: "Subhas Chandra Bose"
                },
                correctAnswer: "B"
            },
            {
                id: 3,
                question: "Which is the largest ocean on Earth?",
                options: {
                    A: "Indian Ocean",
                    B: "Atlantic Ocean",
                    C: "Pacific Ocean",
                    D: "Arctic Ocean"
                },
                correctAnswer: "C"
            },
            {
                id: 4,
                question: "In which sport is the term 'LBW' (Leg Before Wicket) used?",
                options: {
                    A: "Hockey",
                    B: "Football",
                    C: "Cricket",
                    D: "Tennis"
                },
                correctAnswer: "C"
            },
            {
                id: 5,
                question: "Which gas do plants primarily absorb from the atmosphere for photosynthesis?",
                options: {
                    A: "Oxygen",
                    B: "Nitrogen",
                    C: "Carbon Dioxide",
                    D: "Hydrogen"
                },
                correctAnswer: "C"
            },
            {
                id: 6,
                question: "Who was the first Indian woman to travel into space?",
                options: {
                    A: "Sunita Williams",
                    B: "Kalpana Chawla",
                    C: "Tessy Thomas",
                    D: "Ritu Karidhal"
                },
                correctAnswer: "B"
            },
            {
                id: 7,
                question: "Which Mughal emperor built the Taj Mahal in Agra?",
                options: {
                    A: "Akbar",
                    B: "Jahangir",
                    C: "Shah Jahan",
                    D: "Aurangzeb"
                },
                correctAnswer: "C"
            },
            {
                id: 8,
                question: "What is the chemical symbol for Gold?",
                options: {
                    A: "Gd",
                    B: "Ag",
                    C: "Au",
                    D: "Go"
                },
                correctAnswer: "C"
            },
            {
                id: 9,
                question: "Which Indian city is also known as the 'Pink City'?",
                options: {
                    A: "Udaipur",
                    B: "Jodhpur",
                    C: "Jaipur",
                    D: "Bikaner"
                },
                correctAnswer: "C"
            },
            {
                id: 10,
                question: "In 2023, which spacecraft became the first to land near the lunar south pole?",
                options: {
                    A: "Chandrayaan-2",
                    B: "Luna-25",
                    C: "Chandrayaan-3",
                    D: "Artemis I"
                },
                correctAnswer: "C"
            },
            {
                id: 11,
                question: "Who was the first Indian to win an individual Olympic Gold Medal?",
                options: {
                    A: "Abhinav Bindra",
                    B: "Neeraj Chopra",
                    C: "Sushil Kumar",
                    D: "Rajyavardhan Singh Rathore"
                },
                correctAnswer: "A"
            },
            {
                id: 12,
                question: "Which article of the Indian Constitution abolishes 'Untouchability'?",
                options: {
                    A: "Article 14",
                    B: "Article 17",
                    C: "Article 21",
                    D: "Article 32"
                },
                correctAnswer: "B"
            },
            {
                id: 13,
                question: "Which scientist discovered Penicillin in 1928?",
                options: {
                    A: "Louis Pasteur",
                    B: "Edward Jenner",
                    C: "Alexander Fleming",
                    D: "Robert Koch"
                },
                correctAnswer: "C"
            },
            {
                id: 14,
                question: "The 'Rani ki Vav' stepwell, featured on the Indian ₹100 currency note, is located in which state?",
                options: {
                    A: "Rajasthan",
                    B: "Gujarat",
                    C: "Maharashtra",
                    D: "Madhya Pradesh"
                },
                correctAnswer: "B"
            },
            {
                id: 15,
                question: "Who was the first recipient of the Bharat Ratna alongside C. Rajagopalachari and S. Radhakrishnan in 1954?",
                options: {
                    A: "Jawaharlal Nehru",
                    B: "C. V. Raman",
                    C: "Rajendra Prasad",
                    D: "M. Visvesvaraya"
                },
                correctAnswer: "B"
            },
            {
                id: 16,
                question: "Which ancient Indian mathematician wrote the treatise 'Siddhanta Shiromani', which includes 'Lilavati' and 'Bijaganita'?",
                options: {
                    A: "Aryabhata",
                    B: "Brahmagupta",
                    C: "Bhaskara II",
                    D: "Varahamihira"
                },
                correctAnswer: "C"
            }
        ]
    };

    const FLIP_BACKUP_QUESTIONS = [
        {
            id: 101,
            question: "Which river is known as the 'Sorrow of Bihar'?",
            options: { A: "Ganga", B: "Kosi", C: "Son", D: "Gandak" },
            correctAnswer: "B"
        },
        {
            id: 102,
            question: "Which vitamin is primarily produced when human skin is exposed to sunlight?",
            options: { A: "Vitamin A", B: "Vitamin C", C: "Vitamin D", D: "Vitamin K" },
            correctAnswer: "C"
        },
        {
            id: 103,
            question: "Who is known as the 'Missile Man of India'?",
            options: { A: "Vikram Sarabhai", B: "Homi J. Bhabha", C: "A. P. J. Abdul Kalam", D: "Satish Dhawan" },
            correctAnswer: "C"
        },
        {
            id: 104,
            question: "Which instrument is used to measure atmospheric pressure?",
            options: { A: "Thermometer", B: "Barometer", C: "Hygrometer", D: "Anemometer" },
            correctAnswer: "B"
        }
    ];

    const CANONICAL_KBC_LADDER = [
        1000,
        2000,
        3000,
        5000,
        10000,
        20000,
        40000,
        80000,
        160000,
        320000,
        640000,
        1250000,
        2500000,
        5000000,
        10000000,
        70000000
    ];

    function formatINR(amount) {
        return "₹" + Number(amount || 0).toLocaleString("en-IN");
    }

    function escapeHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizeAnswerKey(rawAns, optionsObj) {
        if (rawAns === undefined || rawAns === null) return null;
        const val = String(rawAns).trim();
        if (!val) return null;

        const upper = val.toUpperCase();
        if (["A", "B", "C", "D"].includes(upper)) return upper;

        const letterMatch = upper.match(/^OPTION\s*([A-D])$|^([A-D])[).:\s]/);
        if (letterMatch) {
            return letterMatch[1] || letterMatch[2];
        }

        if (["1", "2", "3", "4"].includes(val)) {
            return ["A", "B", "C", "D"][Number(val) - 1];
        }

        const lowerVal = val.toLowerCase();
        for (const key of ["A", "B", "C", "D"]) {
            if (String(optionsObj[key] || "").trim().toLowerCase() === lowerVal) {
                return key;
            }
        }
        return null;
    }

    function validateAndNormalizeQuiz(rawData, fallbackTitle = "Custom Quiz", fallbackTimer = 30) {
        if (!rawData || typeof rawData !== "object") {
            throw new Error("Invalid quiz structure.");
        }

        const questionsRaw = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData.questions)
                ? rawData.questions
                : null;

        if (!questionsRaw || questionsRaw.length === 0) {
            throw new Error("No questions found in file.");
        }

        const title = !Array.isArray(rawData) && rawData.quizTitle
            ? String(rawData.quizTitle).trim()
            : fallbackTitle;

        const parsedTimer = !Array.isArray(rawData) ? Number(rawData.timer) : NaN;
        const timer = Number.isFinite(parsedTimer) && parsedTimer >= 5 && parsedTimer <= 300
            ? Math.round(parsedTimer)
            : fallbackTimer;

        const questions = questionsRaw.map((item, idx) => {
            if (!item || typeof item !== "object") {
                throw new Error(`Question ${idx + 1} is invalid.`);
            }
            const qText = String(item.question || item.prompt || "").trim();
            if (!qText) {
                throw new Error(`Question ${idx + 1} is missing question text.`);
            }

            const opts = item.options && typeof item.options === "object"
                ? {
                    A: String(item.options.A ?? item.options.a ?? "").trim(),
                    B: String(item.options.B ?? item.options.b ?? "").trim(),
                    C: String(item.options.C ?? item.options.c ?? "").trim(),
                    D: String(item.options.D ?? item.options.d ?? "").trim()
                }
                : {
                    A: String(item.A ?? item.a ?? item.optionA ?? "").trim(),
                    B: String(item.B ?? item.b ?? item.optionB ?? "").trim(),
                    C: String(item.C ?? item.c ?? item.optionC ?? "").trim(),
                    D: String(item.D ?? item.d ?? item.optionD ?? "").trim()
                };

            if (!opts.A || !opts.B || !opts.C || !opts.D) {
                throw new Error(`Question ${idx + 1} must have all 4 options (A, B, C, D).`);
            }

            const ansKey = normalizeAnswerKey(item.correctAnswer ?? item.answer ?? item.correct, opts);
            if (!ansKey) {
                throw new Error(`Question ${idx + 1} has an invalid correct answer.`);
            }

            return {
                id: item.id ?? idx + 1,
                question: qText,
                options: opts,
                correctAnswer: ansKey
            };
        });

        return {
            quizTitle: title || fallbackTitle,
            timer,
            questions
        };
    }

    function parseCsvToQuiz(csvText, fileName) {
        if (typeof Papa === "undefined") {
            throw new Error("CSV parser unavailable.");
        }
        const parsed = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => String(h || "").trim().toLowerCase()
        });

        if (!parsed.data || parsed.data.length === 0) {
            throw new Error("CSV file has no rows.");
        }

        const questions = parsed.data.map((row) => ({
            question: row.question || row.prompt || "",
            options: {
                A: row.a || row.optiona || row.option_a || row["option a"] || "",
                B: row.b || row.optionb || row.option_b || row["option b"] || "",
                C: row.c || row.optionc || row.option_c || row["option c"] || "",
                D: row.d || row.optiond || row.option_d || row["option d"] || ""
            },
            correctAnswer: row.correctanswer || row.correct_answer || row.answer || row.correct || ""
        }));

        const fallbackTitle = String(fileName || "Uploaded CSV Quiz")
            .replace(/\.csv$/i, "")
            .replace(/[_-]+/g, " ")
            .trim() || "Uploaded CSV Quiz";

        return validateAndNormalizeQuiz({ quizTitle: fallbackTitle, timer: 30, questions }, fallbackTitle, 30);
    }

    function triggerDownload(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadSampleJson() {
        const json = JSON.stringify(DEFAULT_QUIZ_DATA, null, 2);
        triggerDownload("kbc-sample-quiz.json", json, "application/json;charset=utf-8");
    }

    function downloadSampleCsv() {
        const header = "question,A,B,C,D,correctAnswer";
        const rows = DEFAULT_QUIZ_DATA.questions.map((q) => {
            const cells = [q.question, q.options.A, q.options.B, q.options.C, q.options.D, q.correctAnswer];
            return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
        });
        triggerDownload("kbc-sample-quiz.csv", [header, ...rows].join("\n"), "text/csv;charset=utf-8");
    }

    return {
        DEFAULT_QUIZ_DATA,
        FLIP_BACKUP_QUESTIONS,
        CANONICAL_KBC_LADDER,
        formatINR,
        escapeHtml,
        validateAndNormalizeQuiz,
        parseCsvToQuiz,
        downloadSampleJson,
        downloadSampleCsv
    };
})();

