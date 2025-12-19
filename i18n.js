// Translations module for Barycentre

export const translations = {
  fr: {
    subtitle: 'Le bar parfait pour tout le monde',
    nav: {
      participants: '① PARTICIPANTS',
      criteria: '② CRITÈRES',
      results: '③ RÉSULTATS'
    },
    step1: {
      title: 'PARTICIPANTS',
      namePlaceholder: 'Nom',
      addressPlaceholder: 'Adresse',
      addBtn: '+ AJOUTER',
      nextBtn: 'SUIVANT →',
      minParticipants: 'X AU MOINS 2 PARTICIPANTS REQUIS',
      modeCar: 'Voiture',
      modeBike: 'Vélo',
      modeWalking: 'À pied'
    },
    step2: {
      title: 'CRITÈRES DE RECHERCHE',
      priorityLabel: 'PRIORISER PAR',
      priorityBaryScore: 'BARYSCORE (équilibre des trajets)',
      moreOptions: '(Prochainement : popularité, prix, accessibilité...)',
      searchBtn: 'RECHERCHER',
      searchRequired: 'X LANCEZ D\'ABORD LA RECHERCHE'
    },
    step3: {
      title: 'RÉSULTATS',
      shareBtn: '↗ PARTAGER',
      viewRoutes: 'Voir itinéraires',
      score: 'BaryScore',
      noResults: 'Aucun résultat trouvé',
      noAddress: 'Adresse non disponible',
      noName: 'Bar sans nom'
    },
    toast: {
      linkCopied: '→ LIEN COPIÉ',
      error: 'X ERREUR',
      sessionImported: '→ SESSION IMPORTÉE',
      searching: '■ RECHERCHE EN COURS...',
      calculating: '■ CALCUL DES ITINÉRAIRES...',
      modeChanged: 'Mode: ',
      fallbackWarning: 'Utilisation du routage estimé (OSRM indisponible)',
      retrying: 'Nouvelle tentative...',
      apiError: 'Service temporairement indisponible',
      fallbackMode: 'Basculement vers routage estimé'
    },
    info: {
      title: 'À propos',
      services: 'Services utilisés',
      staticData: 'Données statiques (France)',
      staticDataDesc: 'Base OSM préchargée pour résultats instantanés',
      geocoding: 'Géocodage d\'adresses',
      search: 'Recherche de lieux (hors France)',
      tiles: 'Tuiles cartographiques',
      library: 'Bibliothèque cartographique',
      baryScore: 'BaryScore',
      baryScoreDesc: 'Système de notation intelligent basé sur une grille de vitesses moyennes. Les temps de trajet et distances affichés sont des estimations (pas de routage exact), suffisamment précises pour comparer et classer les lieux.',
      license: 'Licence MIT - Code source ouvert'
    }
  },
  en: {
    subtitle: 'The perfect bar for everyone',
    nav: {
      participants: '① PARTICIPANTS',
      criteria: '② CRITERIA',
      results: '③ RESULTS'
    },
    step1: {
      title: 'PARTICIPANTS',
      namePlaceholder: 'Name',
      addressPlaceholder: 'Address',
      addBtn: '+ ADD',
      nextBtn: 'NEXT →',
      minParticipants: 'X AT LEAST 2 PARTICIPANTS REQUIRED',
      modeCar: 'Car',
      modeBike: 'Bike',
      modeWalking: 'Walking'
    },
    step2: {
      title: 'SEARCH CRITERIA',
      priorityLabel: 'PRIORITIZE BY',
      priorityBaryScore: 'BARYSCORE (travel balance)',
      moreOptions: '(Coming soon: popularity, price, accessibility...)',
      searchBtn: 'SEARCH',
      searchRequired: 'X LAUNCH SEARCH FIRST'
    },
    step3: {
      title: 'RESULTS',
      shareBtn: '↗ SHARE',
      viewRoutes: 'View routes',
      score: 'BaryScore',
      noResults: 'No results found',
      noAddress: 'Address unavailable',
      noName: 'Unnamed bar'
    },
    toast: {
      linkCopied: '→ LINK COPIED',
      error: 'X ERROR',
      sessionImported: '→ SESSION IMPORTED',
      searching: '■ SEARCHING...',
      calculating: '■ CALCULATING ROUTES...',
      modeChanged: 'Mode: ',
      fallbackWarning: 'Using estimated routing (OSRM unavailable)',
      retrying: 'Retrying...',
      apiError: 'Service temporarily unavailable',
      fallbackMode: 'Switching to estimated routing'
    },
    info: {
      title: 'About',
      services: 'Services used',
      staticData: 'Static data (France)',
      staticDataDesc: 'Preloaded OSM database for instant results',
      geocoding: 'Address geocoding',
      search: 'Place search (outside France)',
      tiles: 'Map tiles',
      library: 'Mapping library',
      baryScore: 'BaryScore',
      baryScoreDesc: 'Intelligent scoring system based on average speed grid. Travel times and distances shown are estimates (not exact routing), accurate enough to compare and rank locations.',
      license: 'MIT License - Open source code'
    }
  }
};

// Current language state
let currentLang = 'fr';

// Get translation by key (e.g., 'step1.title')
export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Get current language
export function getCurrentLang() {
  return currentLang;
}

// Set current language
export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    return true;
  }
  return false;
}

// Update all elements with data-i18n attribute
export function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
}

// Initialize language buttons
export function initLanguageSelector(onLangChange) {
  document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (setLang(lang)) {
        document.querySelectorAll('.lang-btn[data-lang]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateI18n();
        if (onLangChange) {
          onLangChange(lang);
        }
      }
    });
  });
}
