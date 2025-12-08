/* NEON HACKER - CORE LOGIC
    Tüm mekanikler: HP, Para, Sızma, Glitch, Trace, Save/Load
*/

const GAME_CONFIG = {
    autoSaveInterval: 5000,
    currencyUpdateInterval: 10000,
    baseGlitchChance: 0.02, // Her tıklamada %2 şans
    baseTraceChance: 0.01   // Her tıklamada %1 şans
};

// Veri Tipleri ve Değerleri
const DATA_TYPES = [
    { name: "Kişisel Veri", basePrice: 10, rarity: "Düşük" },
    { name: "Sunucu Logları", basePrice: 25, rarity: "Orta" },
    { name: "Kredi Kartı Bilgisi", basePrice: 60, rarity: "Yüksek" },
    { name: "Kurumsal E-posta", basePrice: 120, rarity: "Yüksek" },
    { name: "Kripto Cüzdan Seed", basePrice: 300, rarity: "Premium" },
    { name: "Yapay Zeka Modeli", basePrice: 500, rarity: "Premium" },
    { name: "Gizli Devlet Projesi", basePrice: 1500, rarity: "BlackMarket" }
];

const CURRENCIES = ['USD', 'EUR', 'GOLD', 'BTC'];

// Ana Oyun Nesnesi
const game = {
    state: {
        hp: 0,
        money: 0,
        inventory: [],
        currencies: { USD: 0, EUR: 0, GOLD: 0, BTC: 0 },
        rates: { USD: 30, EUR: 32, GOLD: 2000, BTC: 1000000 },
        infiltration: 0,
        strikes: 0,
        glitchLevel: 0,
        upgrades: {
            clickPower: { level: 1, cost: 50, name: "Brute Force Script" },
            autoClicker: { level: 0, cost: 200, name: "Botnet Node" },
            infiltrateSpeed: { level: 1, cost: 300, name: "Port Scanner" },
            riskReducer: { level: 0, cost: 500, name: "VPN Proxy" },
            glitchStabilizer: { level: 0, cost: 750, name: "Error Handler" }
        }
    },
    
    status: {
        isTracing: false,
        isGlitching: false,
        isRebooting: false
    },

    timers: {},

    // --- BAŞLATMA ---
    init: function() {
        this.loadGame();
        this.ui.updateAll();
        this.loops.start();
        this.events.bind();
        this.log("Sistem başlatıldı. Hoş geldin, Kullanıcı.");
    },

    // --- TEMEL MEKANİKLER ---
    clickHack: function() {
        if (this.status.isRebooting) return;
        if (this.state.strikes >= 10) return;

        // Trace Cezası
        if (this.status.isTracing) {
            this.addStrike();
            return;
        }

        // Glitch Cezası
        if (this.status.isGlitching) {
            this.increaseGlitch(10); // Glitch sırasında tıklamak glitch'i artırır
        }

        // HP Kazanımı
        let gain = 1 + (this.state.upgrades.clickPower.level * 1.5);
        this.state.hp += gain;

        // Sızma İlerlemesi
        let infGain = 1 + (this.state.upgrades.infiltrateSpeed.level * 0.5);
        this.state.infiltration += infGain;

        if (this.state.infiltration >= 100) {
            this.state.infiltration = 0;
            this.lootData();
        }

        // Rastgele Olay Tetikleme Şansı
        this.checkRandomEvents();

        this.ui.updateHP();
        this.ui.updateInfiltration();
    },

    lootData: function() {
        const randIndex = Math.floor(Math.random() * DATA_TYPES.length);
        const data = DATA_TYPES[randIndex];
        this.state.inventory.push(data);
        this.log(`Veri sızdırıldı: [${data.rarity}] ${data.name}`);
        this.ui.updateInventory();
        
        // Animasyon
        const bar = document.getElementById('infiltration-bar');
        bar.style.backgroundColor = '#fff';
        setTimeout(() => bar.style.backgroundColor = '', 100);
    },

    // --- OLAYLAR (TRACE & GLITCH) ---
    checkRandomEvents: function() {
        // Risk Azaltıcı Yükseltmesi
        let riskFactor = 1 / (1 + this.state.upgrades.riskReducer.level * 0.2);

        // Trace Başlatma
        if (!this.status.isTracing && Math.random() < GAME_CONFIG.baseTraceChance * riskFactor) {
            this.startTrace();
        }

        // Glitch Başlatma
        if (!this.status.isGlitching && Math.random() < GAME_CONFIG.baseGlitchChance * riskFactor) {
            this.startGlitchEffect();
        }
    },

    startTrace: function() {
        this.status.isTracing = true;
        document.getElementById('trace-overlay').classList.remove('hidden');
        this.log("UYARI: DIŞ GÖZ TESPİTİ! HAREKET ETME!");
        
        setTimeout(() => {
            this.status.isTracing = false;
            document.getElementById('trace-overlay').classList.add('hidden');
            this.log("Göz kayboldu. Güvendesin.");
        }, 3000); // 3 saniye sürer
    },

    addStrike: function() {
        this.state.strikes++;
        this.ui.updateStrikes();
        this.log("!!! STRIKE ALDIN !!!");
        
        // Görsel uyarı
        document.body.style.backgroundColor = '#500';
        setTimeout(() => document.body.style.backgroundColor = '', 200);

        if (this.state.strikes >= 10) {
            this.gameOver();
        }
    },

    startGlitchEffect: function() {
        this.status.isGlitching = true;
        document.body.classList.add('glitching');
        
        // 2 saniye sürer
        setTimeout(() => {
            this.status.isGlitching = false;
            document.body.classList.remove('glitching');
        }, 2000);
    },

    increaseGlitch: function(amount) {
        // Glitch Stabilizer azaltır
        let reducer = this.state.upgrades.glitchStabilizer.level * 0.5;
        let finalAmount = Math.max(1, amount - reducer);
        
        this.state.glitchLevel += finalAmount;
        this.ui.updateGlitch();
        this.log(`Sistem Kararsızlığı Arttı: %${this.state.glitchLevel.toFixed(1)}`);

        if (this.state.glitchLevel >= 100) {
            this.triggerReboot();
        }
    },

    triggerReboot: function() {
        this.status.isRebooting = true;
        document.getElementById('reboot-screen').classList.remove('hidden');
        this.saveSystem.save(); // İlerlemeyi kaydet ama reboot at
        
        let timer = 15;
        const el = document.getElementById('reboot-timer');
        
        const interval = setInterval(() => {
            timer--;
            el.innerText = timer;
            if (timer <= 0) {
                clearInterval(interval);
                location.reload(); // Sayfayı yenile
            }
        }, 1000);
    },

    gameOver: function() {
        document.getElementById('game-over-screen').classList.remove('hidden');
        this.status.isRebooting = true; // Oyunu dondur
        localStorage.removeItem('neonHackerSave'); // Save'i sil
    },

    // --- MARKET & EKONOMİ ---
    market: {
        sellAll: function(vendorType) {
            if (game.state.inventory.length === 0) {
                game.log("Satılacak veri yok.");
                return;
            }

            let multiplier = 1;
            let risk = 0;

            switch(vendorType) {
                case 'p2p': multiplier = 0.8; risk = 0; break;
                case 'broker': multiplier = 1.0; risk = 0.1; break;
                case 'darkweb': multiplier = 1.5; risk = 0.4; break;
                case 'syndicate': multiplier = 2.0; risk = 0.8; break; // Çok riskli
            }

            // Risk kontrolü (Trace veya Glitch tetikler)
            if (Math.random() < risk) {
                game.log("Satış sırasında sorun çıktı!");
                game.increaseGlitch(20);
                game.startTrace();
            }

            let totalVal = 0;
            game.state.inventory.forEach(item => {
                totalVal += item.basePrice * multiplier;
            });

            game.state.inventory = []; // Envanteri boşalt
            game.state.money += totalVal;
            game.ui.updateMoney();
            game.ui.updateInventory();
            game.log(`Tüm veriler satıldı. Kazanç: ${totalVal.toFixed(2)} ₺`);
        }
    },

    bank: {
        updateRates: function() {
            // Rastgele dalgalanma (+-%5)
            for (let curr of CURRENCIES) {
                let change = 1 + (Math.random() * 0.1 - 0.05);
                game.state.rates[curr] *= change;
            }
            game.ui.updateBank();
        },
        buyCurrency: function() {
            let amountTRY = parseFloat(document.getElementById('exchange-amount').value);
            let currency = document.getElementById('currency-select').value;
            let rate = game.state.rates[currency];

            if (!amountTRY || amountTRY <= 0) return;
            if (game.state.money >= amountTRY) {
                game.state.money -= amountTRY;
                game.state.currencies[currency] += amountTRY / rate;
                game.ui.updateMoney();
                game.ui.updateBank();
                game.log(`${amountTRY} ₺ karşılığı ${currency} alındı.`);
            } else {
                game.log("Yetersiz bakiye.");
            }
        },
        sellCurrency: function() {
            let currency = document.getElementById('currency-select').value;
            let amountCurr = game.state.currencies[currency];
            let rate = game.state.rates[currency];

            if (amountCurr <= 0) { game.log("Döviz bakiyesi yok."); return; }

            let gainTRY = amountCurr * rate;
            game.state.currencies[currency] = 0;
            game.state.money += gainTRY;
            game.ui.updateMoney();
            game.ui.updateBank();
            game.log(`${currency} bozduruldu. Kazanç: ${gainTRY.toFixed(2)} ₺`);
        }
    },

    // --- YÜKSELTMELER ---
    buyUpgrade: function(key) {
        let upg = this.state.upgrades[key];
        // Hack Puanı ile mi Para ile mi? Prompt'ta belirtilmemiş, Hack Puanı kullanalım.
        // Ama "fiyat" dediği için Para da olabilir. Hibrit yapalım: Hack Puanı.
        
        // Bu örnekte Hack Puanı kullanıyoruz.
        if (this.state.hp >= upg.cost) {
            this.state.hp -= upg.cost;
            upg.level++;
            upg.cost = Math.floor(upg.cost * 1.5);
            this.ui.updateUpgrades();
            this.ui.updateHP();
            this.log(`${upg.name} yükseltildi. Yeni Seviye: ${upg.level}`);
        } else {
            this.log("Yetersiz Hack Puanı!");
        }
    },

    // --- UI YÖNETİMİ ---
    ui: {
        updateAll: function() {
            this.updateHP();
            this.updateMoney();
            this.updateStrikes();
            this.updateGlitch();
            this.updateInfiltration();
            this.updateInventory();
            this.updateBank();
            this.updateUpgrades();
        },
        updateHP: () => document.getElementById('hp-display').innerText = Math.floor(game.state.hp),
        updateMoney: () => document.getElementById('money-display').innerText = game.state.money.toFixed(2),
        updateStrikes: () => document.getElementById('strike-display').innerText = game.state.strikes,
        updateGlitch: () => document.getElementById('glitch-display').innerText = game.state.glitchLevel.toFixed(1),
        updateInfiltration: () => {
            let val = Math.floor(game.state.infiltration);
            document.getElementById('infiltration-bar').style.width = val + '%';
            document.getElementById('infiltration-text').innerText = '%' + val;
        },
        updateInventory: () => {
            const list = document.getElementById('inventory-list');
            list.innerHTML = "";
            game.state.inventory.forEach(item => {
                let div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<h4>${item.name}</h4><div class="rarity">${item.rarity}</div>`;
                list.appendChild(div);
            });
        },
        updateBank: () => {
            const list = document.getElementById('currency-list');
            list.innerHTML = "";
            
            // Mevcut Varlıklar
            for (let c of CURRENCIES) {
                let div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<h4>${c}</h4>
                                 <p>Kur: ${game.state.rates[c].toFixed(2)} ₺</p>
                                 <p>Cüzdan: ${game.state.currencies[c].toFixed(4)}</p>`;
                list.appendChild(div);
            }
        },
        updateUpgrades: () => {
            const list = document.getElementById('upgrade-list');
            list.innerHTML = "";
            for (let key in game.state.upgrades) {
                let u = game.state.upgrades[key];
                let div = document.createElement('div');
                div.className = 'card upgrade-item';
                div.innerHTML = `<h4>${u.name} (Lvl ${u.level})</h4>
                                 <p>Maliyet: ${u.cost} HP</p>
                                 <button onclick="game.buyUpgrade('${key}')">SATIN AL</button>`;
                list.appendChild(div);
            }
        }
    },

    // --- DÖNGÜLER ---
    loops: {
        start: function() {
            // Auto Clicker (1sn)
            setInterval(() => {
                if (game.state.upgrades.autoClicker.level > 0 && !game.status.isRebooting) {
                    game.state.hp += game.state.upgrades.autoClicker.level * 2;
                    game.ui.updateHP();
                }
            }, 1000);

            // Döviz Kuru (10sn)
            setInterval(() => {
                game.bank.updateRates();
                let t = 10;
                let timerEl = document.getElementById('currency-timer');
                let downCount = setInterval(()=> {
                    t--; timerEl.innerText=t;
                    if(t<=0) clearInterval(downCount);
                }, 1000);
            }, GAME_CONFIG.currencyUpdateInterval);

            // Auto Save (5sn)
            setInterval(() => {
                game.saveSystem.save();
            }, GAME_CONFIG.autoSaveInterval);
            
            // Glitch Azaltma (Zamanla soğuma)
            setInterval(() => {
                if(game.state.glitchLevel > 0 && !game.status.isGlitching) {
                    game.state.glitchLevel = Math.max(0, game.state.glitchLevel - 0.5);
                    game.ui.updateGlitch();
                }
            }, 1000);
        }
    },

    // --- KAYIT SİSTEMİ ---
    saveSystem: {
        save: function() {
            if(game.state.strikes >= 10) return; // Game over ise kaydetme
            localStorage.setItem('neonHackerSave', JSON.stringify(game.state));
            console.log("Oyun Kaydedildi.");
        },
        clearSave: function() {
            localStorage.removeItem('neonHackerSave');
            location.reload();
        }
    },

    loadGame: function() {
        const saved = localStorage.getItem('neonHackerSave');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Object merge (yeni özellikler eklendiyse bozulmasın diye)
                game.state = { ...game.state, ...parsed };
            } catch (e) {
                console.error("Save dosyası bozuk", e);
            }
        }
    },

    log: function(msg) {
        const logPanel = document.getElementById('terminal-log');
        const fullLogs = document.getElementById('full-logs');
        
        const time = new Date().toLocaleTimeString();
        const p = document.createElement('p');
        p.innerText = `> [${time}] ${msg}`;
        
        logPanel.prepend(p);
        
        // Settings panelindeki full log
        const li = document.createElement('li');
        li.innerText = `[${time}] ${msg}`;
        fullLogs.prepend(li);

        if (logPanel.children.length > 20) logPanel.lastChild.remove();
    },

    events: {
        bind: function() {
            document.getElementById('hack-btn').addEventListener('click', () => game.clickHack());
        }
    }
};

// --- YARDIMCI FONKSİYONLAR ---
function switchTab(tabId) {
    // Tüm içerikleri gizle
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Tüm butonları pasif yap
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    // Seçileni aç
    document.getElementById(tabId).classList.add('active');
    // Butonu aktif yap (event.target bulmak yerine basit loop)
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if(btn.onclick.toString().includes(tabId)) btn.classList.add('active');
    });
}

function hardReset() {
    game.saveSystem.clearSave();
}

// OYUNU BAŞLAT
window.onload = () => game.init();
