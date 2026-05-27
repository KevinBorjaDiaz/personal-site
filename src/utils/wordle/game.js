import {
    fiveLetterWords_EN,
    sevenLetterWords_EN,
    fiveLetterWords_ES,
    sevenLetterWords_ES,
} from "./index.js";

export function createGame(config) {

    const el = {
        game: document.getElementById("game"),
        keyboard: document.getElementById("keyboard"),
        error: document.getElementById("error"),
        language: document.getElementById("language"),
        length: document.getElementById("length"),
    };

    const lettersRow1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    const lettersRow2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    const lettersRow3 = ["Z", "X", "C", "V", "B", "N", "M"];

    let guesses = [];
    let currentGuess = 0;
    let currentColumn = 0;
    const maxGuesses = 6;

    let language = localStorage.getItem("wordleLanguage") || "EN";
    let wordLength = parseInt(localStorage.getItem("wordleWordLength")) || 5;

    let targetWord = "";
    let errorMessage = "";
    let alphabetMap = {};

    // ---------------- INIT ----------------
    function init() {
        el.language.value = language;
        el.length.value = wordLength;

        resetGame();

        window.addEventListener("keydown", onKeyDown);

        el.language.addEventListener("change", (e) => {
            language = e.target.value;
            localStorage.setItem("wordleLanguage", language);
            resetGame();
        });

        el.length.addEventListener("change", (e) => {
            wordLength = parseInt(e.target.value);
            localStorage.setItem("wordleWordLength", wordLength);
            resetGame();
        });
    }

    // ---------------- GAME ----------------
    function resetGame() {
        guesses = [];
        alphabetMap = {};
        currentGuess = 0;
        currentColumn = 0;
        errorMessage = "";

        for (let i = 0; i < maxGuesses; i++) {
            const row = [];
            for (let j = 0; j < wordLength; j++) {
                row.push({ letter: "", status: "" });
            }
            guesses.push(row);
        }

        targetWord = getRandomWord();

        render();
    }

    function getWordList() {
        if (language === "EN") {
            return wordLength === 5 ? fiveLetterWords_EN : sevenLetterWords_EN;
        }
        return wordLength === 5 ? fiveLetterWords_ES : sevenLetterWords_ES;
    }

    function getRandomWord() {
        const list = getWordList();
        return list[Math.floor(Math.random() * list.length)].toUpperCase();
    }

    function validateWord(word) {
        return getWordList()
            .map((w) => w.toUpperCase())
            .includes(word.toUpperCase());
    }

    // ---------------- INPUT ----------------
    function onLetter(letter) {
        if (currentColumn >= wordLength) return;

        guesses[currentGuess][currentColumn].letter = letter;
        currentColumn++;
        render();
    }

    function onDelete() {
        if (currentColumn <= 0) return;

        currentColumn--;
        guesses[currentGuess][currentColumn].letter = "";
        render();
    }

    function onEnter() {
        if (currentColumn !== wordLength) {
            errorMessage = "Not enough letters";
            render();
            return;
        }

        const guess = guesses[currentGuess].map((c) => c.letter).join("");

        if (!validateWord(guess)) {
            errorMessage = "Word not in dictionary";
            render();
            return;
        }

        errorMessage = "";

        if (guess === targetWord) {
            alert(`Nice. Word: ${targetWord}`);
            resetGame();
            return;
        }

        checkGuess(guess);

        currentGuess++;
        currentColumn = 0;

        if (currentGuess >= maxGuesses) {
            alert(`Game Over. Word: ${targetWord}`);
            resetGame();
        }

        render();
    }

    function checkGuess(guess) {
        const row = guesses[currentGuess];
        const targetLetters = targetWord.split("");

        // correct
        for (let i = 0; i < wordLength; i++) {
            if (guess[i] === targetWord[i]) {
                row[i].status = "correct";
                targetLetters[i] = "";
                alphabetMap[guess[i]] = "correct";
            }
        }

        // present / absent
        for (let i = 0; i < wordLength; i++) {
            if (row[i].status === "correct") continue;

            if (targetLetters.includes(guess[i])) {
                row[i].status = "present";
                targetLetters[targetLetters.indexOf(guess[i])] = "";

                if (alphabetMap[guess[i]] !== "correct") {
                    alphabetMap[guess[i]] = "present";
                }
            } else {
                row[i].status = "absent";
                if (!alphabetMap[guess[i]]) {
                    alphabetMap[guess[i]] = "absent";
                }
            }
        }
    }

    function onKeyDown(e) {
        const key = e.key.toUpperCase();

        if (key === "ENTER") return onEnter();
        if (key === "BACKSPACE") return onDelete();

        if (/^[A-Z]$/.test(key)) {
            onLetter(key);
        }
    }

    // ---------------- RENDER ----------------
    function render() {
        // grid
        el.game.innerHTML = guesses
            .map( (row) => `
                <div class="d-flex">
                    ${row.map( (cell) => `
                        <div class="wordCell ${cell.status}">
                            <strong>${cell.letter}</strong>
                        </div>`,).join("")}
                </div>`,)
        .join("");

        // error
        el.error.textContent = errorMessage;

        // keyboard
        const renderRow = (letters) =>
            letters.map( (l) => `
                <button class="alphabetCell d-flex btn btn-secondary ${alphabetMap[l] || ""}" data-key="${l}">
                    ${l}
                </button>
            `,).join("");

        el.keyboard.innerHTML = `
        <div class="d-flex alphabetRow">${renderRow(lettersRow1)}</div>
        <div class="d-flex alphabetRow">${renderRow(lettersRow2)} ${language === "ES" ? `<button class="alphabetCell d-flex btn btn-secondary ${alphabetMap["Ñ"] || ""}" data-key="Ñ">Ñ</button>` : ""}</div>
        <div class="d-flex alphabetRow">
            <button class="alphabetCell d-flex btn btn-secondary" id="enter">ENTER</button>
            ${renderRow(lettersRow3)}
            <button class="alphabetCell d-flex btn btn-secondary" id="delete">⌫</button>
        </div>
        `;

        // bind
        el.keyboard.querySelectorAll("[data-key]").forEach((btn) => {
            btn.onclick = () => onLetter(btn.dataset.key);
        });

        document.getElementById("enter").onclick = onEnter;
        document.getElementById("delete").onclick = onDelete;
    }

    init();
}

createGame();