/* =============================================================================
   GARRYS MOD JAVASCRIPT HOOKS & CALLBACKS
   Documentation des fonctions officielles du moteur Source / Garry's Mod :
   - GameDetails( servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language )
   - SetFilesTotal( total )
   - SetFilesNeeded( needed )
   - SetStatusChanged( status )
   - DownloadingFile( fileName )
============================================================================= */

// État global du chargement
window.GMOD_STATE = {
    isGmod: false,
    serverName: "",
    serverUrl: "",
    mapName: "",
    maxPlayers: "",
    steamId: "",
    gamemode: "",
    volume: 50,
    language: "fr",
    filesTotal: 0,
    filesNeeded: 0,
    filesDownloaded: 0,
    currentFile: "Initialisation du protocole de confinement...",
    currentStatus: "Connexion au réseau sécurisé du Site...",
    percentage: 0
};

// Analyse des paramètres d'URL (ex: ?steamid=%s&mapname=%m)
(function parseUrlParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('steamid')) {
            window.GMOD_STATE.steamId = params.get('steamid');
        }
        if (params.has('mapname')) {
            window.GMOD_STATE.mapName = params.get('mapname');
        }
    } catch (e) {
        console.warn("Erreur lecture URL:", e);
    }
})();

/**
 * 1. Callback appelé par Garry's Mod lors de la connexion
 */
function GameDetails(servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language) {
    window.GMOD_STATE.isGmod = true;
    window.GMOD_STATE.serverName = servername || CONFIG.server.defaultName;
    window.GMOD_STATE.serverUrl = serverurl || "";
    window.GMOD_STATE.mapName = mapname || CONFIG.server.defaultMap;
    window.GMOD_STATE.maxPlayers = maxplayers || CONFIG.server.maxPlayersDefault;
    window.GMOD_STATE.steamId = steamid || window.GMOD_STATE.steamId;
    window.GMOD_STATE.gamemode = gamemode || CONFIG.server.defaultGamemode;
    window.GMOD_STATE.volume = (volume !== undefined) ? (volume * 100) : CONFIG.audio.defaultVolume;
    window.GMOD_STATE.language = language || "fr";

    if (window.onGmodGameDetails) {
        window.onGmodGameDetails(window.GMOD_STATE);
    }
}

/**
 * 2. Nombre total de fichiers requis
 */
function SetFilesTotal(total) {
    window.GMOD_STATE.isGmod = true;
    window.GMOD_STATE.filesTotal = Math.max(0, parseInt(total) || 0);
    window.GMOD_STATE.filesNeeded = window.GMOD_STATE.filesTotal;
    updateProgressDisplay();
}

/**
 * 3. Nombre de fichiers restants à télécharger
 */
function SetFilesNeeded(needed) {
    window.GMOD_STATE.isGmod = true;
    const n = Math.max(0, parseInt(needed) || 0);
    window.GMOD_STATE.filesNeeded = n;
    
    if (window.GMOD_STATE.filesTotal > 0) {
        window.GMOD_STATE.filesDownloaded = Math.max(0, window.GMOD_STATE.filesTotal - n);
        const ratio = window.GMOD_STATE.filesDownloaded / window.GMOD_STATE.filesTotal;
        window.GMOD_STATE.percentage = Math.min(100, Math.floor(ratio * 100));
    }
    updateProgressDisplay();
}

/**
 * 4. Changement du statut de chargement Source
 */
function SetStatusChanged(status) {
    window.GMOD_STATE.isGmod = true;
    window.GMOD_STATE.currentStatus = status || "Chargement en cours...";
    
    // Si aucun fichier total n'est fourni, estimation basée sur les statuts Source classiques
    estimatePercentageFromStatus(status);
    
    if (window.onGmodStatusChanged) {
        window.onGmodStatusChanged(status);
    }
    updateProgressDisplay();
}

/**
 * 5. Fichier en cours de téléchargement
 */
function DownloadingFile(fileName) {
    window.GMOD_STATE.isGmod = true;
    window.GMOD_STATE.currentFile = fileName || "";
    
    if (window.onGmodDownloadingFile) {
        window.onGmodDownloadingFile(fileName);
    }
    updateProgressDisplay();
}

/**
 * Mise à jour de l'affichage de l'état de chargement
 */
function updateProgressDisplay() {
    const elPercentage = document.getElementById("loading-percentage");
    const elBar = document.getElementById("progress-bar-fill");
    const elFilesCount = document.getElementById("loading-files-count");
    const elStatus = document.getElementById("loading-status-text");
    const elFile = document.getElementById("loading-current-file");

    if (elPercentage) elPercentage.textContent = window.GMOD_STATE.percentage + "%";
    if (elBar) elBar.style.width = window.GMOD_STATE.percentage + "%";
    
    if (elFilesCount) {
        if (window.GMOD_STATE.filesTotal > 0) {
            elFilesCount.textContent = `Éléments : ${window.GMOD_STATE.filesDownloaded} / ${window.GMOD_STATE.filesTotal}`;
        } else {
            elFilesCount.textContent = `Téléchargement Workshop actif`;
        }
    }

    if (elStatus && window.GMOD_STATE.currentStatus) {
        elStatus.textContent = window.GMOD_STATE.currentStatus;
    }

    if (elFile && window.GMOD_STATE.currentFile) {
        elFile.textContent = window.GMOD_STATE.currentFile;
    }
}

/**
 * Heuristique de pourcentage pour les statuts GMod usuels
 */
function estimatePercentageFromStatus(status) {
    if (window.GMOD_STATE.filesTotal > 0) return; // Priorité aux vrais compteurs
    
    const s = (status || "").toLowerCase();
    let target = window.GMOD_STATE.percentage;

    if (s.includes("connecting") || s.includes("connexion")) target = 10;
    else if (s.includes("getting server info") || s.includes("récupération")) target = 25;
    else if (s.includes("workshop") || s.includes("addons")) target = 50;
    else if (s.includes("downloading") || s.includes("téléchargement")) target = 65;
    else if (s.includes("mounting") || s.includes("montage")) target = 85;
    else if (s.includes("sending client info") || s.includes("envoi")) target = 95;
    else if (s.includes("spawning server") || s.includes("prêt")) target = 100;

    if (target > window.GMOD_STATE.percentage) {
        window.GMOD_STATE.percentage = target;
    }
}
