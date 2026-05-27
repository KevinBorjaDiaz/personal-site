
export function createTimer(t) {
    let time1, time2, cycles, offset;
    let waiting = false;

    const phase1 = t.projects.timer.phase1;
    const phase2 = t.projects.timer.phase2;

    let time = 0;
    let counter = 0;
    let currentPhase = phase1;

    let startTime = 0;
    let running = false;
    const el = {
        time1: document.getElementById("time1"),
        time2: document.getElementById("time2"),
        cycles: document.getElementById("cycles"),
        offset: document.getElementById("offset"),
        counter: document.getElementById("counter"),
        time: document.getElementById("time"),
        phase: document.getElementById("phase"),
        btn: document.getElementById("startBtn"),
    };

    function updateUI() {
        el.counter.textContent = String(counter);
        el.time.textContent = waiting ? t.projects.timer.waiting : time.toFixed(2);
        el.phase.textContent = currentPhase;
        el.btn.textContent = running ? t.projects.timer.stop : t.projects.timer.start;
    }

    function beep() {
        const audio = new Audio("/beep.m4a");
        audio.play().catch(() => { });
    }

    function startPhase() {
        startTime = performance.now();
        running = true;
        loop();
    }

    function loop() {
        if (!running) return;

        const now = performance.now();
        const elapsed = now - startTime;

        const limit = currentPhase === phase1 ? time1 || 0 : time2 || 0;

        time = elapsed / 1000;
        updateUI();

        if (elapsed >= limit * 1000) {
            beep();

            if (currentPhase === phase1) {
                currentPhase = phase2;
            } else if (cycles && counter === cycles - 1) {
                counter++;
                stop();
                return;
            } else {
                counter++;
                startCycle();
                return;
            }

            startPhase();
            return;
        }

        requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        updateUI();
    }

    async function startCycle() {
        running = false;

        if (offset) {
            waiting = true;
            updateUI();

            await new Promise((r) => setTimeout(r, offset * 1000));

            beep();
            waiting = false;
        }

        currentPhase = phase1;
        startPhase();
    }

    function start() {
        time1 = Number(el.time1.value);
        time2 = Number(el.time2.value);
        cycles = Number(el.cycles.value);
        offset = Number(el.offset.value);

        if (!time1 || !time2) return;

        counter = 0;
        startCycle();
    }

    el.btn.addEventListener("click", () => {
        running ? stop() : start();
    });
}