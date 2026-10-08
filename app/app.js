const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const landingMain = main?.innerHTML || '';
const landingFooter = footer?.outerHTML || '';

const roles = {
  agriculteur: {
    label: 'Agriculteur',
    icon: '♧',
    description: 'Achetez, louez et trouvez des réparateurs.',
  },
  entreprise: {
    label: 'Entreprise',
    icon: '▣',
    description: 'Vendez des machines, pièces et services.',
  },
  maintenancier: {
    label: 'Maintenancier',
    icon: '⚒',
    description: 'Recevez des demandes de réparation.',
  },
};

const authFeatures = [
  ['♧', '4 profils, 1 écosystème', 'Agriculteur, Entreprise, Maintenancier, Administrateur'],
  ['⌖', 'Géolocalisation intelligente', 'Trouvez les services et machines proches de vous.'],
  ['▣', 'Paiements sécurisés', 'Payez et recevez via MTN, Moov et Flooz en toute sécurité.'],
  ['♢', 'Notifications en temps réel', 'Suivez vos demandes, paiements et interventions facilement.'],
];

const authFeatureMarkup = authFeatures.map(([icon, title, text]) => `
  <div class="auth-feature">
    <span class="auth-feature-icon">${icon}</span>
    <div><h3>${title}</h3><p>${text}</p></div>
  </div>
`).join('');

const roleMarkup = Object.entries(roles).map(([value, role]) => `
  <label class="role-option">
    <input type="radio" name="profile" value="${value}" ${value === 'agriculteur' ? 'checked' : ''}>
    <span class="role-card"><b class="role-icon">${role.icon}</b><strong>${role.label}</strong><small>${role.description}</small></span>
  </label>
`).join('');

const authShell = (formMarkup, title, copy, activeTab) => `
  <div class="auth-shell auth-${activeTab}">
    <section class="auth-presentation">
      <a class="auth-brand" href="#accueil"><img class="brand-logo" src="assets/logo.officiel.png" alt="AGRIMAC - L'écosystème agricole intelligent du Bénin"></a>
      <div class="auth-intro"><h1>${title}</h1><p>${copy}</p></div>
      <div class="auth-features">${authFeatureMarkup}</div>
      <div class="auth-image"><div class="auth-image-badge"><b>AGRIMAC</b><span>Une agriculture plus moderne, plus rentable et plus durable.</span></div></div>
    </section>
    <section class="auth-form-column">
      <div class="auth-card">
        <div class="auth-tabs"><a class="${activeTab === 'login' ? 'active' : ''}" href="#connexion">Se connecter</a><a class="${activeTab === 'register' ? 'active' : ''}" href="#inscription">S'inscrire</a></div>
        ${formMarkup}
      </div>
    </section>
  </div>
`;

const loginMarkup = () => authShell(`
  <div class="auth-form-heading"><span class="auth-symbol">◉</span><h2>Bienvenue sur <em>AGRIMAC</em></h2><p>Connectez-vous pour accéder à votre espace.</p></div>
  <form class="auth-form" data-form="login" novalidate>
    <label>Numéro de téléphone<div class="phone-input"><span>☎ +229</span><input name="phone" type="tel" inputmode="numeric" placeholder="Ex : 01 97 12 34 56" autocomplete="tel" required></div><small class="field-error" data-error="phone"></small></label>
    <label>Mot de passe<div class="password-input"><span>⌑</span><input name="password" type="password" placeholder="Entrez votre mot de passe" autocomplete="current-password" required><button type="button" class="password-toggle" aria-label="Afficher le mot de passe">◉</button></div><small class="field-error" data-error="password"></small></label>
    <div class="auth-options"><label class="check-label"><input type="checkbox" name="remember"> Se souvenir de moi</label><a href="#" data-action="forgot">Mot de passe oublié ?</a></div>
    <button class="auth-submit" type="submit">Se connecter <span>→</span></button>
  </form>
  <div class="auth-divider"><span>ou</span></div>
  <button class="voice-button" type="button" data-action="voice">◉ <span><b>Se connecter avec la voix</b><small>Commande vocale</small></span></button>
  <div class="auth-info"><b>♢ Votre compte n'est pas encore vérifié ?</b><p>Si vous êtes une Entreprise ou un Maintenancier, votre compte sera vérifié par un administrateur avant activation.</p></div>
  <div class="auth-bottom"><p>Pas encore de compte ?</p><a class="auth-secondary" href="#inscription">Créer un compte</a></div>
`, 'Connecter aujourd’hui,<br><em>développer demain.</em>', 'AGRIMAC relie Agriculteurs, Entreprises et Maintenanciers pour une agriculture plus moderne, plus rentable et plus durable.', 'login');

const registerMarkup = () => authShell(`
  <div class="auth-form-heading register-heading"><h2>Créer votre compte <em>AGRIMAC</em></h2><p>Inscrivez-vous gratuitement et choisissez votre profil.</p></div>
  <div class="progress-steps"><span class="current"><b>1</b><small>Profil</small></span><span><b>2</b><small>Informations</small></span><span><b>3</b><small>Vérification</small></span></div>
  <form class="auth-form register-form" data-form="register" novalidate>
    <fieldset><legend>1. Choisissez votre profil</legend><div class="role-grid">${roleMarkup}</div></fieldset>
    <fieldset><legend>2. Informations personnelles</legend>
      <label>Nom complet<div class="text-input"><span>♙</span><input name="fullname" type="text" placeholder="Entrez votre nom complet" autocomplete="name" required></div><small class="field-error" data-error="fullname"></small></label>
      <label>Numéro de téléphone<div class="phone-input"><span>☎ +229</span><input name="phone" type="tel" inputmode="numeric" placeholder="Ex : 01 97 12 34 56" autocomplete="tel" required></div><small class="field-error" data-error="phone"></small></label>
      <label>Mot de passe<div class="password-input"><span>⌑</span><input name="password" type="password" placeholder="Entrez votre mot de passe" autocomplete="new-password" required><button type="button" class="password-toggle" aria-label="Afficher le mot de passe">◉</button></div><div class="strength" data-strength><i></i><i></i><i></i></div><small class="strength-label">Choisissez un mot de passe sécurisé</small><small class="field-error" data-error="password"></small></label>
      <label>Confirmer le mot de passe<div class="text-input"><span>⌑</span><input name="confirm" type="password" placeholder="Confirmez votre mot de passe" autocomplete="new-password" required></div><small class="field-error" data-error="confirm"></small></label>
    </fieldset>
    <button class="voice-fill" type="button" data-action="voice">◉ <span><b>Remplir avec la voix</b><small>Dictée vocale</small></span></button>
    <fieldset><legend>3. Choisissez votre mode d'utilisation</legend><div class="mode-grid"><label class="mode-option"><input type="radio" name="mode" value="simplifie" checked><span><b>▦</b><strong>Mode simplifié</strong><small>Grandes icônes · Texte plus gros · Navigation guidée</small></span></label><label class="mode-option"><input type="radio" name="mode" value="avance"><span><b>▤</b><strong>Mode avancé</strong><small>Plus de fonctionnalités · Interface complète · Plus d'options</small></span></label></div></fieldset>
    <label class="terms"><input type="checkbox" name="terms" required><span>J'accepte les <a href="#">Conditions d'utilisation</a> et la <a href="#">Politique de confidentialité</a>.</span></label>
    <button class="auth-submit" type="submit">Créer mon compte <span>→</span></button>
  </form>
`, "Rejoignez AGRIMAC<br><em>aujourd’hui.</em>", "Construisez l'avenir de l'agriculture béninoise avec une plateforme moderne, intelligente et sécurisée.", 'register');

function setAuthMessage(form, message, type = 'error') {
  const existing = form.querySelector('.form-message');
  existing?.remove();
  const element = document.createElement('p');
  element.className = `form-message ${type}`;
  element.textContent = message;
  form.prepend(element);
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });
  form.querySelectorAll('.has-error').forEach((element) => element.classList.remove('has-error'));
  form.querySelector('.form-message')?.remove();
}

function setError(form, field, message) {
  const input = form.elements[field];
  input?.closest('label')?.classList.add('has-error');
  const error = form.querySelector(`[data-error="${field}"]`);
  if (error) error.textContent = message;
}

function validatePhone(phone) {
  return /^01\d{8}$/.test(phone.replace(/\s/g, ''));
}

const dashboardConfigs = {
  agriculteur: {
    label: 'Agriculteur',
    greeting: 'Bonjour',
    subtitle: 'Bienvenue sur AGRIMAC, votre écosystème agricole.',
    stats: [['12', 'Demandes en cours', '↑ 18% ce mois-ci'], ['3', 'Réservations actives', '2 à confirmer'], ['45 000 FCFA', 'Dépenses ce mois', '↓ 8% vs. précédent'], ['8', 'Messages non lus', 'À traiter aujourd’hui']],
    nav: ['Tableau de bord', 'Rechercher', 'Mes demandes', 'Messagerie', 'Paiements', 'Favoris', 'Notifications', 'Mon profil', 'Paramètres'],
    actions: [['⌕', 'Rechercher une machine'], ['▣', 'Demander un devis'], ['⚒', 'Trouver un réparateur'], ['＋', 'Publier une demande']],
    activityTitle: 'Mes demandes récentes',
    activity: [['Tracteur John Deere 5050D', 'Demande de location', 'En attente', 'Aujourd’hui'], ['Réparation pompe à eau', 'Devis reçu de M. Arsène', 'À consulter', 'Hier'], ['Moissonneuse-batteuse', 'Réservation confirmée', 'Confirmée', '12 juin']],
    asideTitle: 'À proximité',
    asideCopy: 'Machines et prestataires disponibles autour de vous.',
  },
  entreprise: {
    label: 'Entreprise',
    greeting: 'Bonjour',
    subtitle: 'Pilotez votre activité et développez vos ventes.',
    stats: [['23', 'Commandes reçues', '↑ 12% ce mois-ci'], ['7', 'Demandes de devis', 'À traiter'], ['1 280 000 FCFA', 'Chiffre d’affaires', '↑ 16% vs. précédent'], ['12', 'Messages clients', 'Nouveaux échanges']],
    nav: ['Tableau de bord', 'Catalogue', 'Commandes', 'Demandes de devis', 'Messages', 'Paiements', 'Statistiques', 'Mon profil', 'Paramètres'],
    actions: [['＋', 'Ajouter une annonce'], ['▣', 'Gérer le catalogue'], ['▤', 'Voir les commandes'], ['⌁', 'Répondre aux devis']],
    activityTitle: 'Commandes récentes',
    activity: [['Location tracteur John Deere', 'Koffi Agbodan', 'À préparer', 'Aujourd’hui'], ['Pièces de rechange moteur', 'Exploitation Sèmè', 'Payée', 'Hier'], ['Service de labour', 'Ferme du Borgou', 'En attente', '12 juin']],
    asideTitle: 'Performance commerciale',
    asideCopy: 'Votre activité progresse de 16% ce mois-ci.',
  },
  maintenancier: {
    label: 'Maintenancier',
    greeting: 'Bonjour',
    subtitle: 'Retrouvez vos demandes et interventions planifiées.',
    stats: [['12', 'Demandes en attente', '5 nouvelles'], ['8', 'Devis envoyés', '3 à relancer'], ['5', 'Interventions planifiées', 'Cette semaine'], ['4.7/5', 'Note moyenne', '128 avis clients']],
    nav: ['Tableau de bord', 'Demandes en attente', 'Mes devis', 'Interventions planifiées', 'Interventions terminées', 'Mes interventions', 'Historique', 'Messagerie', 'Disponibilités', 'Paramètres'],
    actions: [['▤', 'Voir les demandes'], ['＋', 'Créer un devis'], ['◷', 'Gérer mes disponibilités'], ['⌖', 'Mes zones d’intervention']],
    activityTitle: 'Interventions à venir',
    activity: [['Réparation tracteur agricole', 'Koffi Agbodan · Parakou', 'Demain, 08:00', 'Planifiée'], ['Entretien pompe d’irrigation', 'Ferme Sèmè · Porto-Novo', 'Jeudi, 14:30', 'Confirmée'], ['Diagnostic moissonneuse', 'Entreprise AgriPlus', 'Vendredi, 09:00', 'À confirmer']],
    asideTitle: 'Zone d’intervention',
    asideCopy: 'Parakou, Borgou et communes voisines.',
  },
};

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('agrimacUser') || '{}'); } catch { return {}; }
}

function dashboardMarkup() {
  const user = getCurrentUser();
  const role = dashboardConfigs[user.role] ? user.role : 'agriculteur';
  const config = dashboardConfigs[role];
  const name = user.fullname?.trim() || (role === 'entreprise' ? 'Votre entreprise' : 'Koffi');
  const navMarkup = config.nav.map((item, index) => `<a class="dashboard-nav-item ${index === 0 ? 'active' : ''}" href="#dashboard"><span>${['⌂', '⌕', '▤', '▣', '▥', '☆', '♢', '♙', '⚙'][index % 9]}</span><b>${item}</b>${index === 2 || index === 6 ? '<i>5</i>' : ''}</a>`).join('');
  const statsMarkup = config.stats.map(([value, label, trend], index) => `<article class="dashboard-stat"><span class="dashboard-stat-icon">${['♧', '▣', 'ϟ', '♢'][index]}</span><div><strong>${value}</strong><b>${label}</b><small>${trend}</small></div></article>`).join('');
  const actionsMarkup = config.actions.map(([icon, label]) => `<button class="dashboard-action"><span>${icon}</span><b>${label}</b></button>`).join('');
  const activityMarkup = config.activity.map(([title, detail, status, date]) => `<div class="activity-row"><div><b>${title}</b><small>${detail}</small></div><span class="status-chip">${status}</span><time>${date}</time></div>`).join('');

  return `<div class="dashboard-shell">
    <aside class="dashboard-sidebar">
      <div class="dashboard-brand"><img src="assets/logo.officiel.png" alt="AGRIMAC"><span>${config.label}</span></div>
      <div class="dashboard-profile"><div class="dashboard-avatar">${name.slice(0, 1).toUpperCase()}</div><div><b>${name}</b><small>${config.label} <em>●</em></small></div></div>
      <nav class="dashboard-nav">${navMarkup}</nav>
      <div class="dashboard-sidebar-bottom"><div class="simplified-mode"><span>◈</span><div><b>Mode ${user.mode === 'avance' ? 'avancé' : 'simplifié'}</b><small>Interface adaptée</small></div><i>●</i></div><a href="#accueil" class="dashboard-logout">↪ Se déconnecter</a></div>
    </aside>
    <section class="dashboard-content">
      <header class="dashboard-topbar"><button class="dashboard-menu-toggle" type="button" aria-label="Ouvrir le menu">☰</button><div><h1>${config.greeting}, ${name.split(' ')[0]} ! <span>•</span></h1><p>${config.subtitle}</p></div><div class="dashboard-top-actions"><label class="dashboard-search">⌕<input placeholder="Rechercher..."></label><button class="dashboard-icon-button">♧<i></i></button><div class="dashboard-mini-avatar">${name.slice(0, 1).toUpperCase()}</div></div></header>
      <main class="dashboard-page"><div class="dashboard-heading"><div><span class="dashboard-eyebrow">TABLEAU DE BORD</span><h2>Votre activité en un coup d’œil</h2></div><button class="dashboard-primary">＋ Nouvelle action</button></div>
        <div class="dashboard-stats">${statsMarkup}</div>
        <div class="dashboard-grid"><section class="dashboard-panel activity-panel"><div class="panel-heading"><div><h3>${config.activityTitle}</h3><p>Suivez l’évolution de vos activités.</p></div><a href="#dashboard">Voir tout →</a></div><div class="activity-list">${activityMarkup}</div></section><section class="dashboard-panel side-panel"><div class="panel-heading"><div><h3>${config.asideTitle}</h3><p>${config.asideCopy}</p></div><span class="panel-more">•••</span></div><div class="dashboard-map"><span class="map-line"></span><b class="map-pin pin-one">●</b><b class="map-pin pin-two">●</b><b class="map-pin pin-three">●</b><div class="map-center">⌖</div></div><div class="panel-footer-note"><span>⌖</span><b>Localisation active</b><small>Mis à jour il y a 5 min</small></div></section></div>
        <section class="dashboard-panel quick-panel"><div class="panel-heading"><div><h3>Actions rapides</h3><p>Accédez directement aux fonctions principales.</p></div></div><div class="dashboard-actions">${actionsMarkup}</div></section>
      </main>
    </section>
  </div>`;
}

function renderRoute() {
  const route = window.location.hash.slice(1).split('?')[0];
  document.body.classList.remove('dashboard-state');
  document.body.classList.toggle('auth-state', route === 'connexion' || route === 'inscription');
  if (!main) return;

  if (route === 'connexion') {
    main.className = 'auth-main';
    main.innerHTML = loginMarkup();
    document.querySelector('footer')?.remove();
    document.title = 'AGRIMAC - Connexion';
    window.scrollTo(0, 0);
    return;
  }
  if (route === 'inscription') {
    main.className = 'auth-main';
    main.innerHTML = registerMarkup();
    document.querySelector('footer')?.remove();
    document.title = 'AGRIMAC - Inscription';
    window.scrollTo(0, 0);
    return;
  }

  if (route === 'dashboard') {
    document.body.classList.remove('auth-state');
    document.body.classList.add('dashboard-state');
    main.className = 'dashboard-main';
    main.innerHTML = dashboardMarkup();
    document.querySelector('footer')?.remove();
    document.title = `AGRIMAC - Tableau de bord ${dashboardConfigs[getCurrentUser().role]?.label || 'Agriculteur'}`;
    window.scrollTo(0, 0);
    return;
  }

  document.body.classList.remove('dashboard-state');
  main.className = '';
  main.innerHTML = landingMain;
  nav?.classList.remove('mobile-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (!document.querySelector('footer') && landingFooter) document.body.insertAdjacentHTML('beforeend', landingFooter);
  document.title = 'AGRIMAC | L’écosystème agricole du Bénin';
}

menuButton?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('mobile-open') || false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('mobile-open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

document.addEventListener('click', (event) => {
  const dashboardMenu = event.target.closest('.dashboard-menu-toggle');
  if (dashboardMenu) {
    document.querySelector('.dashboard-sidebar')?.classList.toggle('is-open');
    return;
  }
  const passwordToggle = event.target.closest('.password-toggle');
  if (passwordToggle) {
    const input = passwordToggle.closest('.password-input')?.querySelector('input');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  if (target.dataset.action === 'forgot') {
    event.preventDefault();
    const form = target.closest('form');
    setAuthMessage(form, 'Un lien de réinitialisation sera envoyé après connexion à votre numéro.', 'success');
  }
  if (target.dataset.action === 'voice') {
    const form = target.closest('form');
    setAuthMessage(form, 'La dictée vocale sera disponible dès que l’accès au microphone sera autorisé.', 'success');
  }
});

document.addEventListener('input', (event) => {
  if (!event.target.matches('[name="password"]')) return;
  const strength = event.target.closest('label')?.querySelector('[data-strength]');
  if (!strength) return;
  const value = event.target.value;
  const score = Number(value.length >= 8) + Number(/[A-Z]/.test(value)) + Number(/[0-9]/.test(value));
  strength.querySelectorAll('i').forEach((bar, index) => bar.classList.toggle('filled', index < score));
});

document.addEventListener('change', (event) => {
  if (event.target.matches('[name="profile"]')) localStorage.setItem('agrimacRole', event.target.value);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  clearErrors(form);
  const data = new FormData(form);
  const phone = String(data.get('phone') || '');
  const password = String(data.get('password') || '');
  let valid = true;

  if (!validatePhone(phone)) { setError(form, 'phone', 'Saisissez un numéro béninois valide à 10 chiffres commençant par 01.'); valid = false; }
  if (password.length < 6) { setError(form, 'password', 'Le mot de passe doit contenir au moins 6 caractères.'); valid = false; }
  if (form.dataset.form === 'register') {
    if (String(data.get('fullname') || '').trim().length < 2) { setError(form, 'fullname', 'Indiquez votre nom complet.'); valid = false; }
    if (password !== String(data.get('confirm') || '')) { setError(form, 'confirm', 'Les mots de passe ne correspondent pas.'); valid = false; }
    if (!data.get('terms')) { setAuthMessage(form, 'Acceptez les conditions d’utilisation pour continuer.'); valid = false; }
  }
  if (!valid) return;

  const user = {
    fullname: String(data.get('fullname') || ''),
    phone: phone.replace(/\s/g, ''),
    role: String(data.get('profile') || localStorage.getItem('agrimacRole') || 'agriculteur'),
    mode: String(data.get('mode') || 'simplifie'),
  };
  localStorage.setItem('agrimacUser', JSON.stringify(user));
  setAuthMessage(form, form.dataset.form === 'register' ? 'Compte créé. Votre espace sera disponible après vérification du numéro.' : 'Connexion validée. Redirection vers votre espace en préparation.', 'success');
  form.querySelector('button[type="submit"]').disabled = true;
  window.setTimeout(() => { window.location.hash = 'dashboard'; }, 900);
});

window.addEventListener('hashchange', renderRoute);
renderRoute();
