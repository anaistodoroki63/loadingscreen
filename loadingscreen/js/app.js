/* =============================================================================
   SCP FOUNDATION LOADING SCREEN - APPLICATION CONTROLLER
   Fonctionnalités :
   - Moteur Audio Ambiant WebAudio (Drone SCP immersif sans fichier externe)
   - Carrousel interactif des dossiers SCP avec schematics techniques
   - Navigation par onglets (Dossiers / Directives & Règles / Réseau)
   - Télémétrie en direct & Journal des capteurs du Site
   - Horloge temps réel de la Fondation
   - Mode simulation de chargement automatique pour prévisualisation navigateur
============================================================================= */

class SCPApp {
    constructor() {
        this.currentDossierIndex = 0;
        this.dossierTimer = null;
        this.tipTimer = null;
        this.tipIndex = 0;
        this.audioCtx = null;
        this.ambientGain = null;
        this.isPlayingAudio = false;
        this.isMuted = false;
        this.volume = CONFIG.audio.defaultVolume / 100;
        this.externalAudio = null;
        this.simulationTimer = null;
        
        this.init();
    }

    init() {
        this.populateServerInfo();
        this.setupDossiers();
        this.setupRules();
        this.setupTabs();
        this.setupClock();
        this.setupAudio();
        this.setupTips();
        this.setupTelemetryLogs();
        this.setupScanlinesToggle();
        this.checkBrowserMode();
        this.bindGmodEvents();
    }

    /* -------------------------------------------------------------
       1. INFORMATIONS DU SERVEUR ET JOUEUR
    ------------------------------------------------------------- */
    populateServerInfo() {
        const s = CONFIG.server;
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt("header-site-code", s.siteCode);
        setTxt("header-sector-code", s.sector);
        setTxt("server-name-val", s.defaultName);
        setTxt("server-map-val", s.defaultMap);
        setTxt("server-gamemode-val", s.defaultGamemode);
        setTxt("server-clearance-val", s.clearanceLevel);

        // Alerte de sécurité
        const alertData = CONFIG.alerts[s.alertLevel] || CONFIG.alerts.CODE_ORANGE;
        const alertBadge = document.getElementById("alert-level-badge");
        const alertLabel = document.getElementById("alert-level-label");
        const alertPulse = document.getElementById("alert-pulse-dot");

        if (alertBadge && alertLabel) {
            alertLabel.textContent = alertData.label;
            alertBadge.style.borderColor = alertData.color;
            alertBadge.style.color = alertData.color;
            if (alertPulse) {
                alertPulse.style.backgroundColor = alertData.color;
                alertPulse.style.boxShadow = `0 0 10px ${alertData.color}`;
            }
        }

        // Liens communauté
        const discordBtn = document.getElementById("link-discord");
        if (discordBtn && s.discordInvite) discordBtn.href = s.discordInvite;

        const workshopBtn = document.getElementById("link-workshop");
        if (workshopBtn && s.workshopCollection) workshopBtn.href = s.workshopCollection;

        const webBtn = document.getElementById("link-website");
        if (webBtn && s.websiteUrl) webBtn.href = s.websiteUrl;

        // Configuration initiale du joueur
        this.updatePlayerCard(window.GMOD_STATE.steamId || "76561198000000000", "AGENT FONDATION");
    }

    updatePlayerCard(steamid, name) {
        const elName = document.getElementById("player-name-val");
        const elSteam = document.getElementById("player-steamid-val");
        const elAvatar = document.getElementById("player-avatar-img");

        if (elName) elName.textContent = name || "AGENT ACCRÉDITÉ";
        if (elSteam) elSteam.textContent = `ID-64: ${steamid}`;

        // Avatar Steam ou avatar généré SCP
        if (elAvatar) {
            if (steamid && steamid !== "76561198000000000") {
                // Essai d'avatar Steam ou silhouette
                elAvatar.src = `https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg`;
            } else {
                elAvatar.src = "assets/scp-logo.svg";
            }
        }
    }

    /* -------------------------------------------------------------
       2. CARROUSEL DES DOSSIERS SCP
    ------------------------------------------------------------- */
    setupDossiers() {
        const container = document.getElementById("dossier-indicators");
        if (!container) return;

        container.innerHTML = "";
        CONFIG.dossiers.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = `dossier-dot ${idx === 0 ? "active" : ""}`;
            dot.addEventListener("click", () => {
                this.showDossier(idx);
                this.resetDossierTimer();
            });
            container.appendChild(dot);
        });

        const prevBtn = document.getElementById("dossier-prev-btn");
        const nextBtn = document.getElementById("dossier-next-btn");

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.prevDossier();
                this.playBeep(440, 0.05);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                this.nextDossier();
                this.playBeep(660, 0.05);
            });
        }

        this.showDossier(0);
        this.startDossierTimer();
    }

    showDossier(index) {
        if (!CONFIG.dossiers || CONFIG.dossiers.length === 0) return;
        this.currentDossierIndex = (index + CONFIG.dossiers.length) % CONFIG.dossiers.length;
        const d = CONFIG.dossiers[this.currentDossierIndex];

        const elId = document.getElementById("dossier-id");
        const elName = document.getElementById("dossier-name");
        const elStamp = document.getElementById("dossier-stamp");
        const elImg = document.getElementById("dossier-img");
        const elDesc = document.getElementById("dossier-desc");
        const elProc = document.getElementById("dossier-proc");

        if (elId) elId.textContent = d.id;
        if (elName) elName.textContent = d.name;
        if (elStamp) {
            elStamp.textContent = `CLASSE : ${d.class}`;
            elStamp.style.color = d.threatColor || "#e67e22";
            elStamp.style.borderColor = d.threatColor || "#e67e22";
            elStamp.style.boxShadow = `0 0 10px ${d.threatColor}44`;
        }
        if (elImg) {
            elImg.src = d.image;
            elImg.alt = d.id;
        }
        if (elDesc) elDesc.textContent = d.description;
        if (elProc) elProc.textContent = d.procedures;

        // Mise à jour des puces indicatrices
        const dots = document.querySelectorAll(".dossier-dot");
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === this.currentDossierIndex);
        });
    }

    nextDossier() {
        this.showDossier(this.currentDossierIndex + 1);
        this.resetDossierTimer();
    }

    prevDossier() {
        this.showDossier(this.currentDossierIndex - 1);
        this.resetDossierTimer();
    }

    startDossierTimer() {
        this.dossierTimer = setInterval(() => {
            this.showDossier(this.currentDossierIndex + 1);
        }, 9000);
    }

    resetDossierTimer() {
        if (this.dossierTimer) clearInterval(this.dossierTimer);
        this.startDossierTimer();
    }

    /* -------------------------------------------------------------
       3. DIRECTIVES & RÈGLES DU SITE
    ------------------------------------------------------------- */
    setupRules() {
        const rulesList = document.getElementById("rules-list-container");
        if (!rulesList) return;

        rulesList.innerHTML = "";
        CONFIG.rules.forEach(rule => {
            const item = document.createElement("div");
            item.className = "rule-item";
            item.innerHTML = `
                <div class="rule-badge">${rule.id}</div>
                <div class="rule-content">
                    <h4>${rule.title}</h4>
                    <p>${rule.text}</p>
                </div>
            `;
            rulesList.appendChild(item);
        });
    }

    /* -------------------------------------------------------------
       4. SYSTÈME D'ONGLETS
    ------------------------------------------------------------- */
    setupTabs() {
        const tabs = document.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".tab-content");

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const targetId = tab.getAttribute("data-tab");
                tabs.forEach(t => t.classList.remove("active"));
                contents.forEach(c => c.classList.remove("active"));

                tab.classList.add("active");
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add("active");

                this.playBeep(520, 0.04);
            });
        });
    }

    /* -------------------------------------------------------------
       5. HORLOGE FONDATION SCP
    ------------------------------------------------------------- */
    setupClock() {
        const clockEl = document.getElementById("terminal-clock");
        const update = () => {
            if (!clockEl) return;
            const now = new Date();
            const pad = n => n.toString().padStart(2, "0");
            const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
            clockEl.textContent = `SYS.TIME: ${timeStr}`;
        };
        update();
        setInterval(update, 1000);
    }

    /* -------------------------------------------------------------
       6. MOTEUR AUDIO D'AMBIANCE & LECTEUR
    ------------------------------------------------------------- */
    setupAudio() {
        const toggleBtn = document.getElementById("audio-toggle-btn");
        const volSlider = document.getElementById("audio-volume-slider");
        const bars = document.getElementById("audio-visualizer");

        // Fichier externe ou Synthétiseur
        const externalTrack = CONFIG.audio.playlist && CONFIG.audio.playlist[0] && CONFIG.audio.playlist[0].url;

        if (externalTrack) {
            this.externalAudio = new Audio(externalTrack);
            this.externalAudio.loop = true;
            this.externalAudio.volume = this.volume;
        }

        const handleAudioToggle = () => {
            if (this.isPlayingAudio) {
                this.pauseAudio();
            } else {
                this.playAudio();
            }
        };

        if (toggleBtn) toggleBtn.addEventListener("click", handleAudioToggle);

        if (volSlider) {
            volSlider.value = CONFIG.audio.defaultVolume;
            volSlider.addEventListener("input", (e) => {
                this.volume = parseFloat(e.target.value) / 100;
                if (this.ambientGain) {
                    this.ambientGain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
                }
                if (this.externalAudio) {
                    this.externalAudio.volume = this.volume;
                }
            });
        }

        // Démarrage automatique dès la première interaction ou en chargeant
        if (CONFIG.audio.autoPlay) {
            const startAuto = () => {
                this.playAudio();
                window.removeEventListener("click", startAuto);
                window.removeEventListener("keydown", startAuto);
            };
            window.addEventListener("click", startAuto);
            window.addEventListener("keydown", startAuto);
            
            // Tentative directe
            setTimeout(() => {
                this.playAudio().catch(() => {});
            }, 300);
        }
    }

    async playAudio() {
        const toggleBtn = document.getElementById("audio-toggle-btn");
        const bars = document.getElementById("audio-visualizer");

        try {
            if (this.externalAudio) {
                await this.externalAudio.play();
            } else if (CONFIG.audio.enableAmbientSynth) {
                this.startAmbientSynth();
            }

            this.isPlayingAudio = true;
            if (bars) bars.classList.remove("paused");
            if (toggleBtn) {
                toggleBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                `;
            }
        } catch (e) {
            console.log("Lecture audio différée (politique navigateur):", e);
        }
    }

    pauseAudio() {
        const toggleBtn = document.getElementById("audio-toggle-btn");
        const bars = document.getElementById("audio-visualizer");

        if (this.externalAudio) {
            this.externalAudio.pause();
        }
        if (this.audioCtx && this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }

        this.isPlayingAudio = false;
        if (bars) bars.classList.add("paused");
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        }
    }

    startAmbientSynth() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
            return;
        }

        // Création d'un drone immersif haute technologie
        this.ambientGain = this.audioCtx.createGain();
        this.ambientGain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, this.audioCtx.currentTime);

        // Oscillateurs basse fréquence combinés (binaural drone)
        const osc1 = this.audioCtx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(55, this.audioCtx.currentTime); // Note A1

        const osc2 = this.audioCtx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(55.6, this.audioCtx.currentTime); // Déphasage léger pour battement binaural

        const oscSub = this.audioCtx.createOscillator();
        oscSub.type = "sine";
        oscSub.frequency.setValueAtTime(27.5, this.audioCtx.currentTime); // Sub-bass 27.5Hz

        osc1.connect(filter);
        osc2.connect(filter);
        oscSub.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.audioCtx.destination);

        osc1.start();
        osc2.start();
        oscSub.start();
    }

    playBeep(freq = 600, duration = 0.05) {
        if (!this.isPlayingAudio) return;
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContext();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(this.volume * 0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {}
    }

    /* -------------------------------------------------------------
       7. DÉFILEMENT DES CONSEILS TACTIQUES
    ------------------------------------------------------------- */
    setupTips() {
        const tipEl = document.getElementById("tactical-tip-text");
        if (!tipEl || !CONFIG.tips || CONFIG.tips.length === 0) return;

        const updateTip = () => {
            tipEl.style.opacity = "0";
            setTimeout(() => {
                tipEl.textContent = CONFIG.tips[this.tipIndex];
                tipEl.style.opacity = "1";
                this.tipIndex = (this.tipIndex + 1) % CONFIG.tips.length;
            }, 300);
        };

        updateTip();
        this.tipTimer = setInterval(updateTip, 7000);
    }

    /* -------------------------------------------------------------
       8. JOURNAL TÉLÉMÉTRIQUE DU SITE (LOGS EN DIRECT)
    ------------------------------------------------------------- */
    setupTelemetryLogs() {
        const stream = document.getElementById("terminal-stream-logs");
        if (!stream) return;

        const mockLogs = [
            { text: "Sas HCZ-04 scellé // Vérification pressurisation", type: "normal" },
            { text: "Surveillance SCP-173 : Contact visuel actif (3 Agents)", type: "success" },
            { text: "Bain d'acide SCP-682 : PH 1.1 conforme aux normes", type: "normal" },
            { text: "Patrouille FIM Epsilon-11 déployée Secteur-B", type: "warn" },
            { text: "Capteurs de résonance 106 : Absence de fluctuation", type: "normal" },
            { text: "Protocole de sécurité de l'Atelier Steam engagé", type: "success" }
        ];

        let index = 0;
        setInterval(() => {
            const entry = mockLogs[index % mockLogs.length];
            const now = new Date();
            const time = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')}`;
            
            const logDiv = document.createElement("div");
            logDiv.className = `log-entry ${entry.type}`;
            logDiv.innerHTML = `
                <span class="log-time">[${time}]</span>
                <span>${entry.text}</span>
            `;

            stream.prepend(logDiv);
            if (stream.children.length > 5) {
                stream.removeChild(stream.lastChild);
            }
            index++;
        }, 4500);
    }

    /* -------------------------------------------------------------
       9. TOGGLE OVERLAY CRT SCANLINES
    ------------------------------------------------------------- */
    setupScanlinesToggle() {
        const toggleBtn = document.getElementById("crt-toggle-btn");
        const scanlines = document.getElementById("crt-scanlines");
        if (!toggleBtn || !scanlines) return;

        toggleBtn.addEventListener("click", () => {
            scanlines.classList.toggle("off");
            const isOff = scanlines.classList.contains("off");
            toggleBtn.textContent = isOff ? "CRT: OFF" : "CRT: ON";
            this.playBeep(480, 0.05);
        });
    }

    /* -------------------------------------------------------------
       10. MODE SIMULATION DE CHARGEMENT POUR PRÉVISUALISATION
    ------------------------------------------------------------- */
    checkBrowserMode() {
        // Si ouvert dans un navigateur standard (hors jeu)
        setTimeout(() => {
            if (!window.GMOD_STATE.isGmod) {
                this.startBrowserPreviewSimulation();
            }
        }, 1200);
    }

    startBrowserPreviewSimulation() {
        console.log("Aperçu Navigateur Détecté : Activation de la simulation de chargement GMod.");
        
        let simPercentage = 0;
        const simStatuses = [
            { pct: 15, text: "Connexion au réseau sécurisé du Site-19...", file: "materials/site19/concrete_wall.vmt" },
            { pct: 35, text: "Vérification des cartes d'accès et accréditations...", file: "models/player/scp173/scp173.mdl" },
            { pct: 55, text: "Téléchargement des addons Workshop...", file: "sound/scp/containment_alarm.wav" },
            { pct: 75, text: "Montage des modèles et textures de confinement...", file: "maps/rp_site19_v3.bsp" },
            { pct: 90, text: "Envoi des données client au serveur SCP...", file: "lua/autorun/server/security.lua" },
            { pct: 100, text: "Prêt ! Bienvenue sur le Site-19.", file: "Initialisation terminée." }
        ];

        let statusIdx = 0;
        this.simulationTimer = setInterval(() => {
            simPercentage += 1;
            
            if (simPercentage > 100) {
                simPercentage = 100;
                clearInterval(this.simulationTimer);
            }

            if (statusIdx < simStatuses.length && simPercentage >= simStatuses[statusIdx].pct) {
                window.GMOD_STATE.currentStatus = simStatuses[statusIdx].text;
                window.GMOD_STATE.currentFile = simStatuses[statusIdx].file;
                statusIdx++;
            }

            window.GMOD_STATE.percentage = simPercentage;
            window.GMOD_STATE.filesTotal = 142;
            window.GMOD_STATE.filesDownloaded = Math.floor((simPercentage / 100) * 142);
            updateProgressDisplay();
        }, 120);

        // Bouton reset pour le testeur
        const resetBtn = document.getElementById("hud-reset-sim");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                if (this.simulationTimer) clearInterval(this.simulationTimer);
                simPercentage = 0;
                statusIdx = 0;
                this.startBrowserPreviewSimulation();
            });
        }
    }

    /* -------------------------------------------------------------
       11. LIAISON AVEC LES ÉVÉNEMENTS GMOD
    ------------------------------------------------------------- */
    bindGmodEvents() {
        window.onGmodGameDetails = (state) => {
            const setTxt = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            setTxt("server-name-val", state.serverName);
            setTxt("server-map-val", state.mapName);
            setTxt("server-gamemode-val", state.gamemode);
            this.updatePlayerCard(state.steamId, "AGENT CONNECTÉ");
        };

        window.onGmodDownloadingFile = (fileName) => {
            const fileEl = document.getElementById("loading-current-file");
            if (fileEl) fileEl.textContent = fileName;
        };

        window.onGmodStatusChanged = (status) => {
            const statEl = document.getElementById("loading-status-text");
            if (statEl) statEl.textContent = status;
        };
    }
}

// Initialisation dès chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    window.App = new SCPApp();
});
