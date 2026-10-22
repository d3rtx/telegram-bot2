(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const balanceEl = document.getElementById("balance");
    const balanceHeader = document.getElementById("balanceDisplay");
    const playBtn = document.getElementById("playBtn");
    const targetBtn = document.getElementById("targetBtn");
    const gameStatus = document.getElementById("gameStatus");
    const gameResult = document.getElementById("gameResult");
    const refreshBtn = document.getElementById("refreshBtn");
    const shopButtons = document.getElementById("shopButtons");

    const GAME_COST = 5;
    const GAME_WIN = 20;

    document.getElementById("gameCost").textContent = GAME_COST;
    document.getElementById("gameWin").textContent = GAME_WIN;

    let userBalance = 0;

    // Инициализация
    function init() {
        tg.ready();
        tg.MainButton.text = "Профиль";
        tg.MainButton.show();

        fetchBalance();
        renderShop();

        // Кнопка профиля в заголовке Telegram
        tg.MainButton.onClick(() => {
            tg.showAlert(`Ваш баланс: ${userBalance} ⭐`);
        });
    }

    // Запрос баланса у бота через web_app_data
    function fetchBalance() {
        tg.sendData(JSON.stringify({ action: "get_balance" }));
        // Ответ придёт как сообщение от бота, здесь просто устанавливаем заглушку
        balanceEl.textContent = userBalance;
        balanceHeader.textContent = `Баланс: ${userBalance} ⭐`;
    }

    // Обновить баланс вручную
    refreshBtn.addEventListener("click", () => {
        fetchBalance();
        tg.showAlert("Запросите баланс у бота — он пришлёт сообщение с текущей суммой.");
    });

    // Магазин: кнопки покупки звёзд (инвойсы через бота)
    function renderShop() {
        const packages = [
            { stars: 10, label: "10 ⭐" },
            { stars: 50, label: "50 ⭐" },
            { stars: 100, label: "100 ⭐" },
            { stars: 500, label: "500 ⭐" },
        ];

        shopButtons.innerHTML = "";
        packages.forEach((pkg) => {
            const btn = document.createElement("button");
            btn.className = "btn btn-primary";
            btn.textContent = `Купить ${pkg.label}`;
            btn.onclick = () => {
                tg.sendData(JSON.stringify({ action: "buy_stars", stars: pkg.stars }));
                tg.showAlert("Оплата звёзд происходит через бота — нажмите /start и выберите «Купить звёзды'");
            };
            shopButtons.appendChild(btn);
        });
    }

    // Игровая логика
    let gameActive = false;

    playBtn.addEventListener("click", () => {
        if (gameActive) return;

        // Списываем ставку (уведомляем бота)
        tg.sendData(
            JSON.stringify({
                action: "save_score",
                score: 0,
                cost: GAME_COST,
                win: 0,
            })
        );

        gameActive = true;
        playBtn.disabled = true;
        playBtn.textContent = "Идёт игра...";
        targetBtn.classList.add("hidden");
        targetBtn.classList.remove("active");
        gameResult.textContent = "";
        gameStatus.textContent = "Ждите зелёного сигнала...";

        // Случайная задержка 1-3 секунды перед вспышкой
        const delay = 1000 + Math.random() * 2000;

        setTimeout(() => {
            if (!gameActive) return;
            targetBtn.classList.remove("hidden");
            targetBtn.classList.add("active");
            gameStatus.textContent = "ЖМИ СЕЙЧАС!";
            targetBtn.focus();
        }, delay);
    });

    targetBtn.addEventListener("click", () => {
        if (!gameActive) return;

        const win = GAME_WIN;
        gameActive = false;

        targetBtn.classList.add("hidden");
        targetBtn.classList.remove("active");
        playBtn.disabled = false;
        playBtn.textContent = "Сыграть снова";

        // Сохраняем результат и начисление у бота
        tg.sendData(
            JSON.stringify({
                action: "save_score",
                score: win,
                cost: GAME_COST,
                win: win,
            })
        );

        gameStatus.textContent = `Вы выиграли ${win} ⭐!`;
        gameResult.textContent = `🎉 +${win} ⭐`;
        gameResult.style.color = "#2ecc71";

        tg.showAlert(`Поздравляем! Вы выиграли ${win} ⭐`);
    });

    // Сброс, если пользователь долго не нажимает
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && gameActive) {
            gameActive = false;
            targetBtn.classList.add("hidden");
            targetBtn.classList.remove("active");
            playBtn.disabled = false;
            playBtn.textContent = "Сыграть снова";
            gameStatus.textContent = "Игра прервана";
        }
    });

    init();
})();