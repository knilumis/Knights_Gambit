let playerHP = 100;
let enemyHP = 50;
let maxPlayerHP = 100;
let maxEnemyHP = 50;
let level = 1;
let currentPlayer = 'player'; // Oyuncular arasında sıra geçişi için
let countdown = 10;
let countdownInterval;
let playerDefense = 0; // Oyuncu savunma değeri
let enemyDefense = 0;  // Bot savunma değeri

function startGame() {
    const playerName = document.getElementById('player-name').value;
    if (playerName.trim() === "") {
        alert("Lütfen bir isim girin!");
        return;
    }

    const playerStatsElement = document.getElementById('player-stats');
    if (playerStatsElement) {
        playerStatsElement.innerText = `${playerName} HP:`;
    }

    document.getElementById('menu-container').style.display = 'none'; // Menüyü gizle
    document.getElementById('game-container').style.display = 'flex'; // Oyunu göster
    updateStats();
    startCountdown();
}

function updateStats() {
    const playerHpElement = document.getElementById('player-hp');
    const enemyHpElement = document.getElementById('enemy-hp');
    const turnIndicatorElement = document.getElementById('turn-indicator');

    if (playerHpElement && enemyHpElement && turnIndicatorElement) {
        playerHpElement.innerText = playerHP;
        enemyHpElement.innerText = enemyHP;
        turnIndicatorElement.innerText = `Şimdi sıra: ${currentPlayer === 'player' ? 'Oyuncu' : 'Rakip'}`;
    }

    // Sağlık barlarını güncelle
    updateHealthBar('player-health-bar', playerHP, maxPlayerHP);
    updateHealthBar('enemy-health-bar', enemyHP, maxEnemyHP);
}

function updateHealthBar(barId, currentHP, maxHP) {
    const bar = document.getElementById(barId);
    if (bar) {
        const percentage = (currentHP / maxHP) * 100;
        bar.style.width = percentage + '%';
    }
}

function startCountdown() {
    clearInterval(countdownInterval); // Önceki sayaç varsa durdur
    countdown = 10;
    document.getElementById('countdown').innerText = countdown;
    countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById('countdown').innerText = countdown;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            switchTurn();
        }
    }, 1000);
}

function switchTurn() {
    currentPlayer = currentPlayer === 'player' ? 'enemy' : 'player';
    console.log(`Şimdi sıra: ${currentPlayer}`);
    updateStats();
    if (currentPlayer === 'enemy') {
        clearInterval(countdownInterval); // Bot hamlesi sırasında sayacı durdur
        setTimeout(botAction, 1000); // Botun hareketini yapmadan önce 1 saniye bekle
    } else {
        startCountdown(); // Yeni tur için geri sayımı başlat
    }
}

function performAction(action) {
    if (currentPlayer === 'player') {
        if (action === 'attack') attack();
        else if (action === 'defense') defense();
        else if (action === 'heal') heal();
    } else {
        console.log("Şu an rakibin sırası, bekle.");
    }
}

function botAction() {
    // Botun hareketini yapay zeka ile seç
    let action;
    if (level <= 2) {
        action = simpleBotStrategy();
    } else if (level <= 5) {
        action = intermediateBotStrategy();
    } else {
        action = advancedBotStrategy();
    }
    
    // Doğrudan botun hamle fonksiyonunu çağır
    if (action === 'attack') attack();
    else if (action === 'defense') defense();
    else if (action === 'heal') heal();
}

function simpleBotStrategy() {
    // Basit strateji: Rastgele bir hareket yap
    const actions = ['attack', 'defense', 'heal'];
    return actions[Math.floor(Math.random() * actions.length)];
}

function intermediateBotStrategy() {
    // Orta seviye strateji: Oyuncunun sağlığına göre hareket et
    if (playerHP < 30) return 'attack';
    if (enemyHP < 20) return 'heal';
    return simpleBotStrategy(); // Diğer durumlarda rastgele hareket
}

function advancedBotStrategy() {
    // Gelişmiş strateji: Hem oyuncunun hem de kendi sağlığına göre karar ver
    if (enemyHP < 30 && Math.random() < 0.5) return 'heal';
    if (playerHP < 20) return 'attack';
    if (playerHP < 50 && enemyHP > 40) return 'attack';
    return 'defense'; // Diğer durumlarda savunma
}

function attack() {
    let damage = Math.floor(Math.random() * 10) + 5; // 5-15 arası hasar
    if (currentPlayer === 'player') {
        // Düşmanın savunmasını uygula
        damage -= enemyDefense;
        if (damage < 0) damage = 0; // Hasar negatif olamaz
        enemyHP -= damage;
        if (enemyHP < 0) enemyHP = 0;
        showIndicator('enemy', `-${damage}`, 'damage-indicator');
        logAction(`Oyuncu saldırdı ve ${damage} hasar verdi!`);
        enemyDefense = 0; // Savunma bir kez kullanıldıktan sonra sıfırlanır
    } else {
        // Oyuncunun savunmasını uygula
        damage -= playerDefense;
        if (damage < 0) damage = 0; // Hasar negatif olamaz
        playerHP -= damage;
        if (playerHP < 0) playerHP = 0;
        showIndicator('player', `-${damage}`, 'damage-indicator');
        logAction(`Rakip saldırdı ve ${damage} hasar verdi!`);
        playerDefense = 0; // Savunma bir kez kullanıldıktan sonra sıfırlanır
    }

    removeDefenseHighlight(); // Saldırı yapıldığında savunma vurgusunu kaldır
    updateStats(); // HP güncellemesi
    endTurn();
}

function defense() {
    let defensePower = Math.floor(Math.random() * 5) + 3; // 3-7 arası savunma gücü
    if (currentPlayer === 'player') {
        playerDefense = defensePower;
        showIndicator('player', `+${defensePower}`, 'defense-indicator');
        logAction(`Oyuncu savunma yaptı! Gelen hasar ${playerDefense} azalacak.`);
        addDefenseHighlight('player-health-bar'); // Savunma yapıldığında mavi çerçeve ekle
    } else {
        enemyDefense = defensePower;
        showIndicator('enemy', `+${defensePower}`, 'defense-indicator');
        logAction(`Rakip savunma yaptı! Gelen hasar ${enemyDefense} azalacak.`);
        addDefenseHighlight('enemy-health-bar'); // Savunma yapıldığında mavi çerçeve ekle
    }
    endTurn();
}

function heal() {
    let healAmount = Math.floor(Math.random() * 10) + 5; // 5-15 arası iyileştirme
    if (currentPlayer === 'player') {
        playerHP += healAmount;
        if (playerHP > maxPlayerHP) playerHP = maxPlayerHP;
        logAction(`Oyuncu ${healAmount} HP iyileşti!`);
    } else {
        enemyHP += healAmount;
        if (enemyHP > maxEnemyHP) enemyHP = maxEnemyHP;
        logAction(`Rakip ${healAmount} HP iyileşti!`);
    }
    updateStats(); // HP güncellemesi
    endTurn();
}

function logAction(action) {
    console.log(action);
    document.getElementById('action-log').innerText = action;
}

function showIndicator(character, text, className) {
    const charElement = document.getElementById(character);
    const indicator = document.createElement('div');
    indicator.className = className;
    indicator.innerText = text;
    charElement.appendChild(indicator);
    setTimeout(() => charElement.removeChild(indicator), 2000); // 2 saniye sonra göstergeyi kaldır
}

function addDefenseHighlight(barId) {
    const barContainer = document.getElementById(barId).parentElement;
    if (barContainer) {
        barContainer.classList.add('defense-active');
    }
}

function removeDefenseHighlight() {
    const playerBarContainer = document.getElementById('player-health-bar').parentElement;
    const enemyBarContainer = document.getElementById('enemy-health-bar').parentElement;
    if (playerBarContainer) {
        playerBarContainer.classList.remove('defense-active');
    }
    if (enemyBarContainer) {
        enemyBarContainer.classList.remove('defense-active');
    }
}

function checkBattleOutcome() {
    if (enemyHP <= 0) {
        logAction("Rakip yenildi! Bir sonraki seviyeye geçiliyor.");
        level++;
        enemyHP = 50 + (level * 10); // Yeni seviyede daha güçlü rakip
        maxEnemyHP = enemyHP;
        playerHP = maxPlayerHP; // Oyuncunun canı yenileniyor
        updateStats(); // HP güncellemesi
        startCountdown();
    } else if (playerHP <= 0) {
        logAction("Oyuncu yenildi! Oyun bitti.");
        // Oyunu yeniden başlat veya oyuncuya bir seçenek sun
    }
}

function endTurn() {
    checkBattleOutcome();
    switchTurn(); // Sıra değişimi
}

updateStats();
