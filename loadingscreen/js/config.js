/* =============================================================================
   CONFIGURATION DU LOADING SCREEN SCP FOUNDATION
   Modifiez facilement les paramètres ci-dessous selon votre serveur.
============================================================================= */

const CONFIG = {
    // Informations Générales du Site & Serveur
    server: {
        defaultName: "Site-19 // Fondation SCP RP",
        siteCode: "SITE-19",
        sector: "SECTEUR-04 // CONFINEMENT LOURD",
        clearanceLevel: "ACCÈS NIVEAU 4 REQUIS",
        version: "v3.8.4-SECURE",
        defaultMap: "rp_site19_v3",
        defaultGamemode: "SCP-RP",
        maxPlayersDefault: "64",
        alertLevel: "CODE_ORANGE", // Options: CODE_VERT, CODE_JAUNE, CODE_ORANGE, CODE_ROUGE, BRECHE
        discordInvite: "https://discord.gg/votre-serveur",
        websiteUrl: "https://votresite.fr",
        workshopCollection: "https://steamcommunity.com/sharedfiles/filedetails/?id=000000000"
    },

    // Musiques d'ambiance (Vous pouvez ajouter vos fichiers audio dans un dossier /audio ou mettre des URLs)
    // Note: Un synthétiseur ambiant WebAudio haute technologie est inclus par défaut si aucune musique externe n'est jouée !
    audio: {
        autoPlay: true,
        defaultVolume: 35, // 0 à 100
        enableAmbientSynth: true, // Générateur de drone d'ambiance cyberpunk/SCP immersif sans aucun fichier externe requis !
        playlist: [
            {
                title: "Ambiance Confinement Site-19",
                artist: "Archives Fondation SCP",
                url: "" // Laissez vide pour utiliser le synthé d'ambiance ou mettez "audio/ambiance1.mp3"
            }
        ]
    },

    // Dossiers des anomalies SCP affichés en rotation
    dossiers: [
        {
            id: "SCP-173",
            name: "La Sculpture",
            class: "EUCLID",
            threatColor: "#e67e22",
            image: "assets/scp-173.svg",
            description: "Composé de béton et d'armatures métalliques avec des traces de peinture aérosol Krylon. SCP-173 est animé et extrêmement hostile. L'objet ne peut pas bouger lorsqu'il est observé directement dans un champ de vision ininterrompu.",
            procedures: "Maintenir en permanence dans un conteneur verrouillé. Trois membres du personnel doivent entrer lors de chaque maintenance et maintenir un contact visuel constant avec annonces vocales avant de cligner des yeux."
        },
        {
            id: "SCP-096",
            name: "Le Gars Timide",
            class: "EUCLID",
            threatColor: "#e67e22",
            image: "assets/scp-096.svg",
            description: "Humanoïde mesurant approximativement 2,38 mètres. Bras disproportionnellement longs. Lorsque quelqu'un observe le visage de SCP-096 (directement ou via enregistrement/photo), il entre dans une crise d'angoisse incontrôlable avant de traquer et neutraliser la personne à toute allure.",
            procedures: "Cellule cubique en acier de 5 m x 5 m x 5 m hermétiquement scellée. Vérifications hebdomadaires des capteurs obligatoires. Aucune caméra optique n'est tolérée sur zone."
        },
        {
            id: "SCP-049",
            name: "Le Médecin de Peste",
            class: "EUCLID",
            threatColor: "#e67e22",
            image: "assets/scp-049.svg",
            description: "Entité humanoïde arborant l'apparence d'un médecin de peste du XVIIe siècle. La robe et le masque de céramique semblent faire partie intégrante de son corps biologique. Capable de stopper toutes les fonctions vitales par simple contact tactile.",
            procedures: "Confiné dans une cellule sécurisée standard de niveau 3. SCP-049 doit être sédaté avant tout transfert. Il affirme chercher à guérir l'humanité de « La Grande Peste »."
        },
        {
            id: "SCP-106",
            name: "Le Vieil Homme",
            class: "KETER",
            threatColor: "#e74c3c",
            image: "assets/scp-106.svg",
            description: "Humanoïde âgé en état de décomposition avancée. Émet une substance noire et corrosive sur toutes les surfaces en contact. Capable de traverser les matières solides et de piéger ses proies dans sa « dimension de poche ».",
            procedures: "Confinement primaire constitué de quarante couches d'acier au plomb, suspendu au-dessus d'un fluide électromagnétique. En cas de brèche, exécuter la procédure de rappel 11-A (distraction fémorale)."
        },
        {
            id: "SCP-682",
            name: "Reptile Difficile à Détruire",
            class: "KETER",
            threatColor: "#e74c3c",
            image: "assets/scp-682.svg",
            description: "Créature reptilienne imposante dotée d'une vitesse, d'une force et de réflexes phénoménaux. Haine viscérale de toute forme de vie. Possède une capacité de régénération et d'adaptation génétique extrême à tout type de dommage.",
            procedures: "Immersion intégrale et constante dans un bain d'acide chlorhydrique à 85% dans une cuve blindée de 5 m x 5 m x 5 m renforcée au carbone. Neutralisation immédiate dès 10% de résistance manifestée."
        },
        {
            id: "SCP-914",
            name: "Le Mécanisme d'Horlogerie",
            class: "SAFE",
            threatColor: "#2ecc71",
            image: "assets/scp-914.svg",
            description: "Gigantesque appareil d'horlogerie pesant plusieurs tonnes composé de rouages de laiton et de cuivre. Possède deux compartiments (Entrée / Sortie) et un cadran à 5 positions: Très Grossier, Grossier, 1:1, Fin, et Très Fin.",
            procedures: "Aucun protocole physique actif nécessaire hors verrouillage du compartiment d'accès. Toutes les expérimentations requièrent l'accord préalable d'un chercheur Niveau 4."
        }
    ],

    // Règles et protocole de sécurité du serveur
    rules: [
        { id: "R-01", title: "Respect du Rôle & du FearRP", text: "Respectez impérativement la chaîne de commandement et la valeur de votre vie face aux entités hostiles." },
        { id: "R-02", title: "Cartes d'Accès & Clearances", text: "L'usurpation ou le vol de carte de niveau supérieur sans autorisation roleplay est strictement prohibé." },
        { id: "R-03", title: "Protocole de Brèche (Code Rouge)", text: "En cas d'alarme de brèche, le personnel civil doit évacuer vers les abris de confinement sans délai." },
        { id: "R-04", title: "Fairplay & Combats MTF / Insurgés", text: "Le spawnkill, le métagaming et l'usage d'informations extérieures en radio sont passibles de sanctions." },
        { id: "R-05", title: "Expérimentations Classe D", text: "Tout test sur les Classes D doit être encadré par au moins deux gardes armés et validé par un scientifique." }
    ],

    // Conseils tactiques affichés en bas d'écran
    tips: [
        "CONSEIL TACTIQUE: Ne quittez jamais SCP-173 du regard lorsque la porte du sas s'ouvre.",
        "CONSEIL TACTIQUE: Gardez vos communications radio concises sur les fréquences d'intervention.",
        "CONSEIL TACTIQUE: En cas de regard involontaire vers SCP-096, préparez votre position défensive.",
        "CONSEIL TACTIQUE: Les scientifiques doivent toujours être escortés par la sécurité en zone HCZ.",
        "CONSEIL TACTIQUE: Appuyez sur F1 ou F4 en jeu pour consulter le guide du serveur et les métiers disponibles."
    ],

    // Alertes de statut disponibles
    alerts: {
        CODE_VERT: { label: "STATUT VERT // CONFINEMENT STABLE", color: "#2ecc71", desc: "Toutes les anomalies sont sous contrôle nominal." },
        CODE_JAUNE: { label: "STATUT JAUNE // VIGILANCE ACCRUE", color: "#f1c40f", desc: "Activité anormale détectée dans le secteur inférieur." },
        CODE_ORANGE: { label: "STATUT ORANGE // RISQUE DE BRÈCHE", color: "#e67e22", desc: "Forces d'intervention MTF déployées en surveillance renforcée." },
        CODE_ROUGE: { label: "STATUT ROUGE // BRÈCHE DE CONFINEMENT", color: "#e74c3c", desc: "Multiples brèches confirmées. Évacuation immédiate du personnel non armé." },
        BRECHE: { label: "PROTOCOLE OMÉGA // VERROUILLAGE TOTAL", color: "#ff003c", desc: "Têtes nucléaires d'urgence armées. Confinement irrécupérable." }
    }
};
