import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bell, Building2, CalendarDays, Check, ChevronRight, ClipboardList, FileBarChart, FileText, Home, LayoutDashboard, LogOut, MapPin, Menu, MessageCircle, Package, Plus, Search, Settings, ShieldCheck, ShoppingCart, Star, Tractor, Users, Wrench, X, Mic, CircleHelp, Activity, WalletCards, Megaphone, Tags, AlertTriangle, Database, BarChart3, Paperclip, Phone, MoreHorizontal, Send, Image, Eye } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadMock, notify, openAction } from './ui';
import { AdminDashboardPremiumReference } from './adminPremiumPages';
import { RealAgrimacMap } from './RealAgrimacMap';
import { useNotifications } from './api/useNotifications';
import { resources } from './api/resources';
import { AdminDashboardConnected } from './adminDashboardConnected';
import { logout as logoutSession } from './api/client';

const ASSET = '/';
const roles = { agriculteur: 'Agriculteur', entreprise: 'Entreprise', maintenancier: 'Maintenancier', administrateur: 'Administrateur' };
const paths = { agriculteur: '/dashboard/agriculteur', entreprise: '/dashboard/entreprise', maintenancier: '/dashboard/maintenancier', administrateur: '/dashboard/administrateur' };

function startBrowserVoice(onResult) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) { notify('La recherche vocale n’est pas prise en charge par ce navigateur.', 'error'); return; }
  const recognition = new Recognition();
  recognition.lang = 'fr-FR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = event => onResult(event.results[0][0].transcript);
  recognition.onerror = () => notify('La reconnaissance vocale a échoué.', 'error');
  recognition.start();
  notify('Écoute vocale activée. Parlez maintenant.');
}

function NotificationButton({ role, navigate }) { const notifications = useNotifications(); return <button className="reference-bell" onClick={() => navigate(`${paths[role]}/notifications`)} aria-label="Notifications"><Bell size={18} /><i className={notifications.unread ? 'has-unread' : ''} /></button>; }
function ReferenceFarmerNotificationsLive() { const { items, loading, error } = useNotifications(); const navigate = useNavigate(); if (loading) return <div className="reference-notifications-live">Chargement des notifications...</div>; if (error) return <div className="reference-notifications-live">Notifications indisponibles</div>; return <div className="reference-notifications">{items.slice(0, 4).map(item => <button key={item.id} onClick={() => navigate(`${paths.agriculteur}/${item.type === 'NEW_MESSAGE' ? 'messagerie' : item.type.includes('PAYMENT') ? 'paiements' : 'demandes'}`)}><span><Bell size={15} /></span><div><b>{item.title}</b><small>{item.body}</small></div><time>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>{!item.readAt && <i />}</button>)}</div>; }
function ReferenceFarmerActivityLive() { const [items, setItems] = React.useState(null); const navigate = useNavigate(); React.useEffect(() => { resources.farmer.requests().then(data => setItems(Array.isArray(data) ? data : data.items || [])).catch(() => setItems([])); }, []); if (!items) return <div className="reference-activity-live">Chargement de vos demandes...</div>; if (!items.length) return <div className="reference-activity-live">Aucune demande récente</div>; return <div className="reference-activity">{items.slice(0, 3).map(item => <button key={item.id} onClick={() => navigate(`${paths.agriculteur}/demandes`)}><b>{item.title}</b><small>{item.city || item.region || 'Localisation non renseignée'}</small><span className="reference-status">{item.status}</span><ChevronRight size={14} /></button>)}</div>; }

const navigation = {
  agriculteur: [
    { group: 'Principal', items: [['Tableau de bord', '', LayoutDashboard], ['Rechercher', 'rechercher', Search, 'Machines & services'], ['Mes demandes', 'demandes', ClipboardList, 'Devis, réparations', 8], ['Messagerie', 'messagerie', MessageCircle, 'Vos échanges', 5], ['Paiements', 'paiements', WalletCards, 'Transactions & factures'], ['Avis & évaluations', 'avis', Star, 'Mes avis et notations'], ['Favoris', 'favoris', Star, 'Prestataires & machines'], ['Notifications', 'notifications', Bell, 'Alertes importantes', 5]] },
    { group: 'Compte', items: [['Mon profil', 'profil', Users, 'Informations personnelles'], ['Paramètres', 'parametres', Settings, "Préférences de l'app"]] },
  ],
  entreprise: [
    { group: 'Principal', items: [['Tableau de bord', '', LayoutDashboard]] },
    { group: 'Gestion', items: [['Catalogue', 'catalogue', Package, 'Produits & services'], ['Produits', 'produits', Package, 'Machines & pièces'], ['Services', 'services', Wrench, 'Prestations proposées'], ['Commandes', 'commandes', ShoppingCart, 'Suivi des ventes', 23], ['Demandes de devis', 'devis', FileText, 'Réponses à traiter', 7], ['Messages', 'messagerie', MessageCircle, 'Clients et partenaires', 12]] },
    { group: 'Analytiques', items: [['Statistiques', 'statistiques', BarChart3, 'Performances commerciales'], ['Rapports', 'rapports', FileBarChart, 'Exports & analyses']] },
    { group: 'Compte', items: [['Mon entreprise', 'profil', Building2, 'Identité et équipe'], ['Paramètres', 'parametres', Settings, "Préférences de l'app"]] },
  ],
  maintenancier: [
    { group: 'Principal', items: [['Tableau de bord', '', LayoutDashboard], ['Demandes en attente', 'demandes', ClipboardList, 'Nouvelles missions', 12], ['Mes devis', 'devis', FileText, 'Propositions envoyées', 8], ['Interventions planifiées', 'interventions', CalendarDays, 'Votre agenda', 5]] },
    { group: 'Activité', items: [['Historique', 'historique', FileText, 'Revenus & évaluations'], ['Avis & évaluations', 'avis', Star, 'Retours clients', 23], ['Notifications', 'notifications', Bell, 'Alertes de missions', 5], ['Calendrier', 'calendrier', CalendarDays, 'Rendez-vous & agenda'], ['Mes statistiques', 'statistiques', BarChart3, 'Performance métier']] },
    { group: 'Outils', items: [['Messagerie', 'messagerie', MessageCircle, 'Clients & partenaires', 7], ['Disponibilités & Zones', 'disponibilites', CalendarDays, 'Horaires et communes couvertes']] },
    { group: 'Compte', items: [['Mon profil', 'profil', Users, 'Identité professionnelle'], ['Paramètres', 'parametres', Settings, "Préférences de l'app"]] },
  ],
  administrateur: [
    { group: 'Principal', items: [['Tableau de bord', '', LayoutDashboard]] },
    { group: 'Gestion des utilisateurs', items: [['Utilisateurs', 'utilisateurs', Users, 'Tous les comptes'], ['Entreprises', 'entreprises', Building2, 'Comptes à valider', 24], ['Maintenanciers', 'maintenanciers', Wrench, 'Comptes à valider', 18], ['Agriculteurs', 'agriculteurs', Tractor, 'Comptes actifs', '4,892']] },
    { group: 'Contenu & Annonces', items: [['Annonces & produits', 'annonces', Package, 'Toutes les publications'], ['Catégories', 'categories', Tags, 'Gérer les catégories'], ['Signalements', 'signalements', AlertTriangle, 'Contenus signalés', 12]] },
    { group: 'Analytiques & Rapports', items: [['Statistiques globales', 'statistiques', BarChart3, 'Vue plateforme'], ['Rapports', 'rapports', FileBarChart, 'Exports administratifs']] },
    { group: 'Système', items: [['Paramètres', 'parametres', Settings, 'Configuration générale'], ['Journaux d’activités', 'journaux', Database, 'Logs & historique']] },
  ],
};

function Logo() { return <Link className="reference-brand" to="/"><img src={`${ASSET}logo.officiel.png`} alt="AGRIMAC" /><span>L'écosystème agricole du Bénin</span></Link>; }

export function ReferenceDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [maintainerCounts, setMaintainerCounts] = React.useState(null);
  const [roleCounts, setRoleCounts] = React.useState(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('agrimacUser') || 'null'); } catch { return null; } })() || { role: 'agriculteur', fullname: 'Koffi Agbodan' };
  const pathRole = location.pathname.match(/^\/dashboard\/([^/]+)/)?.[1];
  const role = roles[pathRole] ? pathRole : roles[user.role] ? user.role : 'agriculteur';
  if (role === 'maintenancier' && !maintainerCounts) navigation.maintenancier = navigation.maintenancier.map(section => ({ ...section, items: section.items.map(item => item.slice(0, 4)) }));
  if ((role === 'agriculteur' || role === 'entreprise') && !roleCounts) navigation[role] = navigation[role].map(section => ({ ...section, items: section.items.map(item => item.slice(0, 4)) }));
  if (role === 'administrateur' && !navigation.administrateur.some(section => section.items.some(item => item[1] === 'scraping'))) navigation.administrateur = [...navigation.administrateur, { group: 'Système', items: [['Scraping', 'scraping', Database, 'Sources & importations']] }];
  const notificationState = useNotifications();
  React.useEffect(() => {
    if (role !== 'maintenancier') return undefined;
    let cancelled = false;
    Promise.all([resources.maintainer.requests(), resources.maintainer.quotes(), resources.maintainer.interventions(), resources.user.me(), resources.notifications.list({ limit: 1, skip: 0 }), resources.conversations.list({ limit: 1, skip: 0 })]).then(async ([requests, quotes, interventions, userData, notifications, conversations]) => {
      const reviews = userData?.id ? await resources.reviews.list(userData.id).catch(() => []) : [];
      if (cancelled) return;
      const list = value => Array.isArray(value) ? value : value?.items || [];
      const counts = { demandes: list(requests).length, devis: list(quotes).length, interventions: list(interventions).length, avis: Array.isArray(reviews) ? reviews.length : 0, notifications: notifications?.unread || 0, messagerie: conversations?.unread || 0 };
      navigation.maintenancier = navigation.maintenancier.map(section => ({ ...section, items: section.items.map(item => counts[item[1]] === undefined ? item : [...item.slice(0, 4), counts[item[1]]]) }));
      setMaintainerCounts({ ...counts });
    }).catch(() => { if (!cancelled) setMaintainerCounts({ requests: 0, quotes: 0, interventions: 0, reviews: 0, notifications: 0, messages: 0 }); });
    return () => { cancelled = true; };
  }, [role]);
  React.useEffect(() => {
    if (role !== 'agriculteur' && role !== 'entreprise') return undefined;
    let cancelled = false;
    const list = value => Array.isArray(value) ? value : value?.items || [];
    const requests = role === 'agriculteur' ? resources.farmer.requests() : resources.company.orders();
    const secondary = role === 'agriculteur' ? resources.conversations.list({ limit: 1, skip: 0 }) : resources.company.quotes();
    Promise.all([requests, secondary, resources.notifications.list({ limit: 1, skip: 0 }), role === 'agriculteur' ? Promise.resolve(null) : resources.conversations.list({ limit: 1, skip: 0 })]).then(([primary, secondaryData, notifications, enterpriseConversations]) => {
      if (cancelled) return;
      const counts = role === 'agriculteur' ? { demandes: list(primary).length, messagerie: secondaryData?.unread, notifications: notifications?.unread } : { commandes: list(primary).length, devis: list(secondaryData).length, messagerie: enterpriseConversations?.unread, notifications: notifications?.unread };
      navigation[role] = navigation[role].map(section => ({ ...section, items: section.items.map(item => counts[item[1]] == null ? item : [...item.slice(0, 4), counts[item[1]]]) }));
      setRoleCounts(counts);
    }).catch(() => { if (!cancelled) setRoleCounts({}); });
    return () => { cancelled = true; };
  }, [role]);
  const sidebarNavigation = role === 'maintenancier' && maintainerCounts ? navigation[role].map(section => ({ ...section, items: section.items.map(item => { const badgeByRoute = { demandes: maintainerCounts.requests, devis: maintainerCounts.quotes, interventions: maintainerCounts.interventions, avis: maintainerCounts.reviews, notifications: notificationState.unread }; return badgeByRoute[item[1]] === undefined ? item : [...item.slice(0, 4), badgeByRoute[item[1]]]; }) })) : navigation[role];
  React.useEffect(() => {
    if (role !== 'maintenancier') return undefined;
    const syncLanguage = event => {
      const button = event.target.closest?.('.reference-topbar button');
      if (!button) return;
      const label = button.textContent.trim();
      const language = label === 'FR' || label.includes('Français') ? 'Français' : label === 'EN' || label.includes('English') ? 'English' : label.includes('Fon') ? 'Fon' : null;
      if (language) resources.user.updatePreferences({ language }).catch(() => undefined);
    };
    resources.user.preferences().then(preferences => { if (preferences?.language) localStorage.setItem('agrimacLanguage', preferences.language); }).catch(() => undefined);
    document.addEventListener('click', syncLanguage, true);
    return () => document.removeEventListener('click', syncLanguage, true);
  }, [role]);
  React.useEffect(() => {
    if (role !== 'maintenancier' || notificationState.loading) return undefined;
    const link = [...document.querySelectorAll('.reference-nav a')].find(item => item.getAttribute('href') === `${paths.maintenancier}/notifications`);
    if (!link) return undefined;
    const existing = link.querySelector('i');
    if (notificationState.unread > 0) {
      const badge = existing || document.createElement('i');
      badge.textContent = String(notificationState.unread);
      if (!existing) link.appendChild(badge);
    } else if (existing) existing.remove();
    return undefined;
  }, [location.pathname, notificationState.loading, notificationState.unread, role]);
  React.useEffect(() => {
    const roots = [];
    const upgrade = () => document.querySelectorAll('.farmer-replica-map:not([data-real-map-mounted])').forEach(node => { node.setAttribute('data-real-map-mounted', 'true'); const root = createRoot(node); root.render(<RealAgrimacMap className="farmer-replica-real-map" />); roots.push(root); });
    const frame = window.requestAnimationFrame(upgrade);
    const observer = new MutationObserver(upgrade);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); roots.forEach(root => root.unmount()); };
  }, [location.pathname]);
  const isRoot = location.pathname.replace(/\/+$/, '') === paths[role];
  React.useEffect(() => {
    if (!isRoot || role === 'administrateur' || role === 'maintenancier') return undefined;
    const content = document.querySelector('.reference-content');
    if (!content) return undefined;
    const banner = document.createElement('section');
    banner.className = 'admin-compliance shared-compliance-banner';
    banner.innerHTML = '<span class="shared-compliance-icon">✓</span><div><b>Sécurité & conformité</b><small>Vos données, transactions et échanges sont protégés par AGRIMAC.</small></div><button type="button">Voir les garanties <span>→</span></button>';
    content.appendChild(banner);
    banner.querySelector('button')?.addEventListener('click', () => notify('Les garanties de sécurité AGRIMAC sont actives.'));
    return () => banner.remove();
  }, [isRoot, role, location.pathname]);
  React.useEffect(() => {
    const mode = document.querySelector('.reference-mode');
    const help = document.querySelector('.reference-help');
    let advanced = (() => { try { return JSON.parse(localStorage.getItem('agrimacUser') || '{}').mode === 'avance'; } catch { return false; } })();
    const updateModeLabel = () => {
      if (!mode) return;
      const title = mode.querySelector('b');
      const detail = mode.querySelector('small');
      if (title) title.textContent = advanced ? 'Mode avancé' : 'Mode simplifié';
      if (detail) detail.textContent = advanced ? 'Interface complète' : 'Interface adaptée';
      mode.dataset.mode = advanced ? 'avance' : 'simplifie';
    };
    if (role === 'maintenancier') resources.user.preferences().then(preferences => { advanced = preferences?.displayMode === 'Avancé'; updateModeLabel(); }).catch(() => updateModeLabel());
    const activateMode = () => {
      advanced = !advanced;
      if (role === 'maintenancier') resources.user.updatePreferences({ displayMode: advanced ? 'Avancé' : 'Simplifié' }).then(() => notify(advanced ? 'Mode avancé activé.' : 'Mode simplifié activé.')).catch(() => notify('Le mode n’a pas pu être enregistré.', 'error'));
      else try {
        const storedUser = JSON.parse(localStorage.getItem('agrimacUser') || '{}');
        localStorage.setItem('agrimacUser', JSON.stringify({ ...storedUser, mode: advanced ? 'avance' : 'simplifie' }));
      } catch { /* Keep the visual switch usable if storage is unavailable. */ }
      updateModeLabel();
      if (role !== 'maintenancier') notify(advanced ? 'Mode avancé activé.' : 'Mode simplifié activé.');
    };
    updateModeLabel();
    const openHelp = () => {
      if (document.querySelector('.agrimac-help-overlay')) return;
      const overlay = document.createElement('div');
      overlay.className = 'agrimac-help-overlay';
      overlay.innerHTML = '<section class="agrimac-help-dialog" role="dialog" aria-modal="true" aria-label="Assistance AGRIMAC"><button class="agrimac-help-close" type="button" aria-label="Fermer">×</button><span class="agrimac-help-mark">?</span><h3>Besoin d’aide ?</h3><p>Notre assistance AGRIMAC vous accompagne pour naviguer, publier et gérer vos activités.</p><div class="agrimac-help-actions"><button type="button" class="primary-action" data-help-voice>♪ Lancer l’assistance vocale</button><button type="button" class="secondary-action" data-help-support>Contacter le support</button></div></section>';
      const close = () => overlay.remove();
      overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
      overlay.querySelector('.agrimac-help-close')?.addEventListener('click', close);
      overlay.querySelector('[data-help-voice]')?.addEventListener('click', () => { close(); startBrowserVoice(text => notify(`Vous avez dit : ${text}`)); });
      overlay.querySelector('[data-help-support]')?.addEventListener('click', () => { notify('Le centre de support AGRIMAC est ouvert.'); close(); });
      document.body.appendChild(overlay);
    };
    mode?.setAttribute('role', 'button');
    mode?.setAttribute('tabindex', '0');
    mode?.addEventListener('click', activateMode);
    mode?.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') activateMode(); });
    help?.addEventListener('click', openHelp);
    const voice = [...document.querySelectorAll('button')].find(button => /recherche vocale/i.test(button.textContent || ''));
    const openVoice = event => { event.preventDefault(); event.stopPropagation(); startBrowserVoice(text => navigate(`${paths[role]}/rechercher?query=${encodeURIComponent(text)}`)); };
    voice?.addEventListener('click', openVoice, true);
    return () => { mode?.removeEventListener('click', activateMode); help?.removeEventListener('click', openHelp); voice?.removeEventListener('click', openVoice, true); document.querySelector('.agrimac-help-overlay')?.remove(); };
  }, [location.pathname, role]);
  React.useEffect(() => {
    if (!isRoot) return undefined;
    const content = document.querySelector('.reference-content');
    if (!content) return undefined;
    const openDetail = (title, description, fields) => openAction({ type: 'detail', icon: '⌕', title, description, fields });
    const rootAction = event => {
      const button = event.target.closest('button');
      if (!button || !content.contains(button)) return;
      const text = button.innerText.trim().replace(/\s+/g, ' ');
      if (!text) return;
      if (role === 'agriculteur' && button.closest('.farmer-replica') && /nouvelle demande|publier une demande/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        openAction({ type: 'form', icon: '+', title: 'Publier une demande', description: 'Décrivez la machine, le service ou la réparation dont vous avez besoin.', submitLabel: 'Publier la demande', fields: [{ name: 'kind', label: 'Type de demande : achat, location ou réparation', required: true }, { name: 'category', label: 'Catégorie', required: true }, { name: 'title', label: 'Titre de la demande', required: true }, { name: 'equipment', label: 'Machine ou équipement recherché' }, { name: 'description', label: 'Description détaillée', multiline: true, required: true }, { name: 'location', label: 'Localisation', required: true }, { name: 'date', label: 'Date souhaitée', type: 'date' }, { name: 'urgency', label: 'Niveau d’urgence' }, { name: 'budget', label: 'Budget indicatif XOF', type: 'number' }, { name: 'photo', label: 'Ajouter une photo', type: 'file' }] });
        return;
      }
      if (role === 'agriculteur' && button.closest('.farmer-replica') && /voir sur la carte|voir la carte/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        openAction({ type: 'detail', icon: '⌖', title: 'Carte des prestataires proches', description: 'Machines, services et prestataires disponibles autour de votre position.', fields: [{ label: 'Zone', value: 'Cotonou · Abomey-Calavi · Parakou' }, { label: 'Résultats', value: '8 prestataires et équipements' }, { label: 'Actions', value: 'Consulter · Contacter · Demander un devis' }] });
        return;
      }
      if (role === 'agriculteur' && button.closest('.farmer-replica') && /voir tout|voir les avis|voir les notifications/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        const destination = /avis/i.test(text) ? 'avis' : /notification/i.test(text) ? 'notifications' : 'demandes';
        navigate(`${paths.agriculteur}/${destination}`);
        return;
      }
      if (role === 'agriculteur' && button.closest('.farmer-replica-kpi')) {
        event.preventDefault(); event.stopPropagation();
        const label = button.innerText.split('\n').find(Boolean) || 'Indicateur';
        const destination = /message/i.test(text) ? 'messagerie' : /dépens/i.test(text) ? 'paiements' : /note/i.test(text) ? 'avis' : 'demandes';
        navigate(`${paths[role]}/${destination}`);
        return;
      }
      if (role === 'agriculteur' && button.closest('.farmer-provider-list')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openDetail(row.split('\n')[0], 'Prestataire sélectionné autour de votre position.', [{ label: 'Prestataire', value: row }, { label: 'Action', value: /voir|carte/i.test(text) ? text : 'Contacter ou demander un devis' }]); return;
      }
      if (role === 'agriculteur' && button.closest('.farmer-notification-panel,.farmer-requests-panel')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openDetail(row.split('\n')[0], 'Élément sélectionné sur votre Dashboard Agriculteur.', [{ label: 'Contenu', value: row }, { label: 'Page associée', value: /notification/i.test(text) ? 'Notifications' : 'Mes demandes' }]); return;
      }
      if (role === 'entreprise' && button.closest('.enterprise-home-products,.enterprise-home-orders,.enterprise-home-notifications')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openDetail(row.split('\n')[0], 'Élément sélectionné dans l’activité de votre entreprise.', [{ label: 'Contenu', value: row }, { label: 'Contexte', value: /commande/i.test(text) ? 'Commande' : /notification/i.test(text) ? 'Notification' : 'Produit consulté' }]); return;
      }
      if (role === 'maintenancier' && button.closest('.maintainer-replica-kpi')) {
        event.preventDefault(); event.stopPropagation(); const textValue = button.innerText.trim(); const destination = /devis/i.test(textValue) ? 'devis' : /planifiées/i.test(textValue) ? 'interventions' : /terminées/i.test(textValue) ? 'historique' : /note/i.test(textValue) ? 'avis' : 'demandes'; navigate(`${paths[role]}/${destination}`); return;
      }
      if (role === 'maintenancier' && button.closest('.maintainer-replica-request,.replica-agenda,.replica-zones,.maintainer-replica-notifications')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openDetail(row.split('\n')[0] || 'Élément Maintenancier', 'Détail de l’élément sélectionné.', [{ label: 'Contenu', value: row }, { label: 'Profil', value: 'Maintenancier' }]); return;
      }
      if (role === 'administrateur' && button.closest('.admin-pending-list article')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); const subject = row.split('\n')[0] || 'Élément sélectionné'; openAction({ type: 'confirm', icon: /valider/i.test(text) ? '✓' : '×', title: `${/valider/i.test(text) ? 'Valider' : 'Rejeter'} ${subject}`, description: `Cette action concerne l’élément sélectionné : ${row}.`, submitLabel: /valider/i.test(text) ? 'Valider' : 'Confirmer', onConfirm: () => notify(`${subject} traité.`) }); return;
      }
      if (role === 'administrateur' && button.closest('.admin-activity-list')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openDetail(row.split('\n')[0], 'Événement système sélectionné.', [{ label: 'Événement', value: row }, { label: 'Journal', value: 'AuditLog AGRIMAC' }]); return;
      }
    };
    content.addEventListener('click', rootAction, true);
    return () => content.removeEventListener('click', rootAction, true);
  }, [isRoot, role, navigate]);
  React.useEffect(() => {
    const contextual = event => {
      const button = event.target.closest('button');
      if (!button) return;
      const label = button.innerText.trim().replace(/\s+/g, ' ').toLowerCase();
      if (role === 'maintenancier' && location.pathname.endsWith('/demandes') && button.classList.contains('feature-primary')) {
        event.preventDefault(); event.stopPropagation();
        openAction({ type: 'detail', icon: '⌖', title: 'Demandes proches', description: 'Carte des demandes de réparation disponibles dans vos zones.', fields: [{ label: 'Zones', value: 'Abomey-Calavi · Sô-Ava · Cotonou' }, { label: 'Résultats', value: '12 demandes proches' }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/messagerie') && button.closest('.maintainer-chat-actions')) {
        event.preventDefault(); event.stopPropagation();
        const icon = button.querySelector('svg')?.getAttribute('class') || '';
        openAction({ type: 'detail', icon: /Phone/i.test(icon) ? '☎' : '⚒', title: /Phone/i.test(icon) ? 'Appel du client' : 'Intervention associée', description: 'Action liée à la conversation actuellement sélectionnée.', fields: [{ label: 'Conversation', value: 'Client sélectionné' }, { label: 'État', value: 'Action disponible' }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/notifications') && button.closest('.maintainer-quality-notifications')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.innerText.trim().replace(/\s+/g, ' ');
        openAction({ type: 'detail', icon: '!', title: row.split('\n')[0] || 'Notification', description: 'Détail de la notification sélectionnée.', fields: [{ label: 'Événement', value: row }, { label: 'État', value: 'Consultée' }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/notifications') && button.closest('.premium-notification-feed')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.innerText.trim().replace(/\s+/g, ' ');
        openAction({ type: 'detail', icon: '!', title: row.split('MTN')[0].trim() || 'Notification', description: 'Détail de la notification sélectionnée.', fields: [{ label: 'Événement', value: row }, { label: 'État', value: 'Consultée' }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/calendrier') && button.classList.contains('feature-primary')) {
        event.preventDefault(); event.stopPropagation();
        openAction({ type: 'form', icon: '◷', title: 'Nouvel événement', description: 'Ajoutez un rendez-vous dans votre calendrier.', submitLabel: 'Créer', fields: [{ name: 'title', label: 'Intitulé', required: true }, { name: 'date', label: 'Date et heure', type: 'datetime-local', required: true }, { name: 'location', label: 'Lieu' }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/calendrier') && button.closest('.maintainer-calendar-events')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.innerText.trim().replace(/\s+/g, ' ');
        openAction({ type: 'detail', icon: '◷', title: row.split('\n')[1] || 'Rendez-vous', description: 'Détail du rendez-vous sélectionné.', fields: [{ label: 'Planning', value: row }] });
        return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/avis') && /voir les clients/i.test(label)) {
        event.preventDefault(); event.stopPropagation();
        openAction({ type: 'detail', icon: '◉', title: 'Clients ayant laissé un avis', description: 'Consultez les interventions et retours associés.', fields: [{ label: 'Avis reçus', value: '128' }, { label: 'Satisfaction', value: '92%' }] });
        return;
      }
      if (role === 'maintenancier' && (location.pathname.endsWith('/profil') || location.pathname.endsWith('/parametres')) && button.classList.contains('feature-setting-row')) {
        event.preventDefault(); event.stopPropagation();
        const title = button.innerText.trim().split('\n')[0] || 'Paramètre';
        openAction({ type: 'form', icon: '⚙', title, description: `Modifiez le paramètre ${title.toLowerCase()}.`, submitLabel: 'Enregistrer', fields: [{ name: 'value', label: 'Nouvelle valeur', multiline: true, required: true }] });
        return;
      }
      if (role === 'entreprise' && location.pathname.endsWith('/devis') && label === 'filtrer') {
        event.preventDefault(); event.stopPropagation();
        openAction({ type: 'form', icon: '≡', title: 'Filtrer les demandes de devis', description: 'Sélectionnez les demandes à afficher.', submitLabel: 'Appliquer', fields: [{ name: 'urgency', label: 'Urgence' }, { name: 'status', label: 'Statut' }, { name: 'period', label: 'Période' }] });
        return;
      }
      if (role === 'entreprise' && location.pathname.endsWith('/statistiques') && label === 'export csv') {
        event.preventDefault(); event.stopPropagation();
        downloadMock('statistiques-entreprise-csv', 'Indicateur|Valeur\nChiffre d’affaires|24,750K FCFA\nCommandes traitées|412\nPanier moyen|60K FCFA\nTaux de conversion|3.4%');
        return;
      }
      if (role === 'entreprise' && location.pathname.endsWith('/parametres') && button.classList.contains('enterprise-choice')) {
        event.preventDefault(); event.stopPropagation(); button.parentElement?.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button)); localStorage.setItem('agrimacUserMode', label); notify(`Mode ${label} sélectionné.`); return;
      }
      if (role === 'entreprise' && location.pathname.endsWith('/profil') && button.closest('.enterprise-documents')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openAction({ type: 'detail', icon: '▤', title: row.split('Vérifié')[0].trim(), description: 'Document officiel associé à l’entreprise.', fields: [{ label: 'Statut', value: 'Vérifié' }, { label: 'Source', value: 'Administration AGRIMAC' }] }); return;
      }
      if (role === 'maintenancier' && location.pathname.endsWith('/calendrier') && button.closest('.premium-event-list')) {
        event.preventDefault(); event.stopPropagation(); const row = button.innerText.trim().replace(/\s+/g, ' '); openAction({ type: 'detail', icon: '◷', title: row.split('Planifié')[0].trim(), description: 'Détail du rendez-vous sélectionné.', fields: [{ label: 'Calendrier', value: 'Maintenancier' }, { label: 'Rendez-vous', value: row }] }); return;
      }
      if (role === 'administrateur' && location.pathname === paths.administrateur && button.closest('.admin-quick-actions')) {
        event.preventDefault(); event.stopPropagation();
        if (label.includes('paramètres')) return navigate(`${paths.administrateur}/parametres`);
        if (label.includes('journaux')) return navigate(`${paths.administrateur}/journaux`);
        if (label.includes('exporter')) return downloadMock('dashboard-admin', 'Indicateur|Valeur\nUtilisateurs|5 924\nAnnonces|1 842\nTransactions|3 276');
        if (label.includes('notification')) return openAction({ type: 'form', icon: '♢', title: 'Envoyer une notification', description: 'Rédigez la notification à envoyer aux utilisateurs ciblés.', submitLabel: 'Envoyer', fields: [{ name: 'audience', label: 'Audience', required: true }, { name: 'message', label: 'Message', multiline: true, required: true }] });
        return openAction({ type: 'form', icon: '+', title: 'Ajouter un administrateur', description: 'Créez un compte administrateur avec ses permissions.', submitLabel: 'Créer', fields: [{ name: 'name', label: 'Nom complet', required: true }, { name: 'phone', label: 'Téléphone', required: true }, { name: 'permissions', label: 'Permissions', multiline: true }] });
      }
      if (role === 'administrateur' && location.pathname === paths.administrateur && button.closest('.admin-pending-list article')) {
        event.preventDefault(); event.stopPropagation();
        const article = button.closest('.admin-pending-list article');
        const name = article?.innerText.trim().split('\n')[0] || 'Compte en attente';
        const approving = /valider/i.test(label);
        openAction({ type: 'confirm', icon: approving ? '✓' : '×', title: `${approving ? 'Valider' : 'Rejeter'} ${name}`, description: `Cette décision concerne le compte ${name}.`, submitLabel: approving ? 'Valider le compte' : 'Rejeter le compte', onConfirm: () => notify(`${name} ${approving ? 'validé' : 'rejeté'}.`) });
        return;
      }
      if (role === 'administrateur' && location.pathname === paths.administrateur && button.closest('.admin-activity-list')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.innerText.trim().replace(/\s+/g, ' ');
        openAction({ type: 'detail', icon: '▤', title: row.split('MTN')[0].trim() || 'Activité système', description: 'Événement système sélectionné.', fields: [{ label: 'Événement', value: row }, { label: 'Journal', value: 'AuditLog AGRIMAC' }] });
        return;
      }
      if (location.pathname.endsWith('/devis') && role === 'entreprise' && button.closest('.enterprise-modal-actions') && /refuser/i.test(button.innerText)) {
        event.preventDefault(); event.stopPropagation();
        const detail = button.closest('.enterprise-quote-detail')?.innerText?.slice(0, 800) || 'Demande de devis sélectionnée.';
        openAction({ type: 'confirm', icon: '×', title: 'Refuser cette demande de devis', description: detail, submitLabel: 'Confirmer le refus', onConfirm: () => notify('Demande de devis refusée.') });
      }
      if (location.pathname.endsWith('/devis') && role === 'maintenancier' && button.closest('.maintainer-quality-table')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.closest('.maintainer-quality-table > div')?.innerText || 'Devis sélectionné';
        openAction({ type: 'detail', icon: '₣', title: row.split('\n')[0] || 'Devis', description: 'Détail du devis sélectionné.', fields: row.split('\n').slice(0, 5).map((value, index) => ({ label: ['Référence', 'Client', 'Intervention', 'Montant', 'Statut'][index] || 'Information', value })) });
      }
      if (location.pathname.endsWith('/historique') && role === 'maintenancier' && button.closest('.maintainer-quality-table')) {
        event.preventDefault(); event.stopPropagation();
        const row = button.closest('.maintainer-quality-table > div')?.innerText || 'Intervention sélectionnée';
        openAction({ type: 'detail', icon: '✓', title: row.split('\n')[0] || 'Intervention', description: 'Rapport de l’intervention terminée sélectionnée.', fields: row.split('\n').slice(0, 5).map((value, index) => ({ label: ['Intervention', 'Client', 'Montant', 'Évaluation', 'Date'][index] || 'Information', value })) });
      }
      if (location.pathname.endsWith('/messagerie') && role === 'maintenancier' && button.classList.contains('premium-conversation')) {
        event.preventDefault(); event.stopPropagation();
        const name = button.innerText.trim().split('\n')[0] || 'Conversation';
        openAction({ type: 'detail', icon: '✉', title: name, description: 'Conversation sélectionnée avec ce client.', fields: [{ label: 'Client', value: name }, { label: 'Canal', value: 'Messagerie AGRIMAC' }] });
      }
    };
    // Keep action ownership inside the page components; do not intercept clicks globally.
    return () => document.removeEventListener('click', contextual, true);
  }, [location.pathname, role]);
  React.useEffect(() => {
    const openDialog = (title, description, submitLabel = 'Enregistrer') => {
      document.querySelector('.agrimac-action-dialog-overlay')?.remove();
      const overlay = document.createElement('div');
      overlay.className = 'agrimac-action-dialog-overlay';
      overlay.innerHTML = `<form class="agrimac-action-dialog"><button type="button" class="agrimac-action-dialog-close" aria-label="Fermer">×</button><span class="agrimac-help-mark">+</span><h3>${title}</h3><p>${description}</p><label>Intitulé<input required placeholder="Saisissez un intitulé" /></label><label>Détails<textarea placeholder="Ajoutez les informations nécessaires..."></textarea></label><footer><button type="button" class="secondary-action" data-dialog-cancel>Annuler</button><button class="primary-action">${submitLabel}</button></footer></form>`;
      const close = () => overlay.remove();
      overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
      overlay.querySelector('.agrimac-action-dialog-close')?.addEventListener('click', close);
      overlay.querySelector('[data-dialog-cancel]')?.addEventListener('click', close);
      overlay.querySelector('form')?.addEventListener('submit', event => { event.preventDefault(); notify(`${title} enregistré.`); close(); });
      document.body.appendChild(overlay);
    };
    const routeFor = label => {
      const lower = label.toLowerCase();
      if (lower.includes('notification') || lower.includes('voir tout')) return `${paths[role]}/notifications`;
      if (lower.includes('publier l’avis') || lower.includes('publier la réponse')) return null;
      if (lower.includes('publier une demande') || lower.includes('nouvelle demande') || lower.includes('rechercher')) return `${paths[role]}/rechercher`;
      if (lower.includes('nouvelle action')) return role === 'entreprise' ? `${paths[role]}/produits` : role === 'maintenancier' ? `${paths[role]}/demandes` : role === 'administrateur' ? `${paths[role]}/utilisateurs` : `${paths[role]}/rechercher`;
      if (lower.includes('nouveau devis') || lower.includes('créer un devis') || lower.includes('devis')) return `${paths[role]}/devis`;
      if (lower.includes('nouveau message') || lower.includes('messagerie')) return `${paths[role]}/messagerie`;
      if (lower.includes('ajouter un produit') || lower.includes('catalogue') || lower.includes('produit')) return `${paths[role]}/produits`;
      if (lower.includes('rapport')) return `${paths[role]}/rapports`;
      if (lower.includes('statistique') || lower.includes('performance')) return `${paths[role]}/statistiques`;
      if (lower.includes('voir le détail') || lower.includes('consulter') || lower.includes('noter')) return role === 'agriculteur' ? `${paths[role]}/demandes` : role === 'entreprise' ? `${paths[role]}/commandes` : `${paths[role]}/demandes`;
      return null;
    };
    const handleAction = event => {
      const button = event.target.closest('button');
      if (!button || button.closest('.reference-sidebar') || button.closest('.agrimac-help-overlay') || button.closest('.agrimac-action-dialog-overlay') || button.closest('.admin-sidebar-overlay') || button.closest('.feature-modal-backdrop') || button.closest('.enterprise-modal-backdrop')) return;
      const label = (button.innerText.trim() || button.getAttribute('aria-label') || button.title || '').replace(/\s+/g, ' ');
      if (!label) return;
      const lower = label.toLowerCase();
      if (button.closest('.feature-stars,.feature-favorite-card,.feature-tabs,.feature-request-list,.enterprise-quote-list,.enterprise-products-toolbar,.enterprise-catalogue-filters,.admin-sidebar-filter-group,.admin-sidebar-row-actions,.admin-sidebar-table,.maintainer-quality-table,.maintainer-calendar-days,.maintainer-conversations,.reference-conversation-list')) return;
      if (button.closest('.maintainer-chat-actions,.reference-chat-actions')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Action de conversation', 'Lancez un appel, ouvrez le document associé ou consultez les options.', 'Ouvrir');
        return;
      }
      if (button.matches('.farmer-map-pin,.replica-pin')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Prestataires autour de vous', 'Consultez les demandes et prestataires présents dans cette zone.', 'Voir les détails');
        return;
      }
      if (button.closest('.farmer-provider-list')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/rechercher`);
        return;
      }
      if (button.closest('.farmer-replica-kpi')) {
        event.preventDefault();
        event.stopPropagation();
        const destination = lower.includes('message') ? 'messagerie' : lower.includes('dépens') ? 'paiements' : lower.includes('note') ? 'avis' : 'rechercher';
        navigate(`${paths[role]}/${destination}`);
        return;
      }
      if (button.closest('.maintainer-replica-request')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/demandes`);
        return;
      }
      if (button.closest('.replica-agenda')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/calendrier`);
        return;
      }
      if (button.closest('.replica-zones')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/disponibilites`);
        return;
      }
      if (button.closest('.admin-activity-list')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/journaux`);
        return;
      }
      if (role === 'administrateur' && lower.includes('sauvegarde')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Sauvegarde de la base de données', 'Lancez une sauvegarde sécurisée des données AGRIMAC.', 'Lancer');
        return;
      }
      if (role === 'administrateur' && lower.includes('paramètres système')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/parametres`);
        return;
      }
      if (button.closest('.reference-notifications,.farmer-notification-panel,.maintainer-replica-notifications,.feature-notification-feed')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/notifications`);
        return;
      }
      if (lower.includes('publier une demande') || lower.includes('nouvelle demande')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Publier une demande', 'Décrivez le matériel, le service ou la réparation recherchée.', 'Publier');
        return;
      }
      if (lower.includes('envoyer une notification') || lower.includes('ajouter un admin')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(lower.includes('notification') ? 'Envoyer une notification' : 'Ajouter un administrateur', 'Renseignez les informations nécessaires à cette action.', 'Enregistrer');
        return;
      }
      if (lower.includes('export csv')) {
        event.preventDefault();
        event.stopPropagation();
        downloadMock('agrimac-export-csv', 'AGRIMAC Export CSV\nStatut,Disponible\nDonnées,Mockées');
        return;
      }
      if (lower.includes('vocale') || lower.includes('recherche vocale') || lower === 'fr') {
        event.preventDefault();
        event.stopPropagation();
        openDialog(lower === 'fr' ? 'Langue de l’application' : 'Assistance vocale', lower === 'fr' ? 'Choisissez la langue de votre interface AGRIMAC.' : 'Utilisez votre voix pour rechercher ou lancer une action.', lower === 'fr' ? 'Appliquer' : 'Lancer');
        return;
      }
      if (lower.includes('voir mes avis') || lower.includes('historique de vos avis')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/avis`);
        return;
      }
      if (lower.includes('ajouter une photo') || lower.includes('document') || lower.includes('informations personnelles') || lower.includes('mot de passe') || lower.includes('sessions') || lower.includes('permissions')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Cette action ouvre un espace sécurisé de gestion des informations.', 'Continuer');
        return;
      }
      if (lower.includes('nouveau message')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Nouveau message', 'Choisissez le destinataire et rédigez votre message.', 'Envoyer');
        return;
      }
      if (lower.includes('filtrer') || lower === 'filtres' || lower.includes('ajouter une zone')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Filtres', 'Affinez les résultats de cette page avant de continuer.', 'Appliquer');
        return;
      }
      if (lower.includes('voir la carte') || lower.includes('voir sur la carte') || lower.includes('voir les demandes')) {
        event.preventDefault();
        event.stopPropagation();
        const destination = role === 'agriculteur' ? `${paths[role]}/rechercher` : `${paths[role]}/demandes`;
        if (location.pathname.replace(/\/+$/, '') === destination.replace(/\/+$/, '')) openDialog('Carte interactive', 'La carte des demandes et des prestataires est disponible dans cette vue.', 'Fermer');
        else navigate(destination);
        return;
      }
      if (lower.includes('gérer mes préférences') || lower.includes('préférences de notifications')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/parametres`);
        return;
      }
      if (lower.includes('modifier la photo') || lower.includes('ajouter un document') || lower.includes('ajuster') || lower.includes('changer de flotte') || lower.includes('formulaire')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Cette action ouvre un espace de modification sécurisé.', 'Enregistrer');
        return;
      }
      if (lower === 'simplifié' || lower === 'avancé') {
        event.preventDefault();
        event.stopPropagation();
        const group = button.parentElement;
        group?.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
        notify(`Mode ${lower} sélectionné.`);
        return;
      }
      if (lower.includes('réserver') || lower.includes('contacter') || lower.includes('voir le produit') || lower.includes('voir le détail')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Vérifiez les détails avant de confirmer cette action.', lower.includes('contacter') ? 'Envoyer' : 'Confirmer');
        return;
      }
      if (lower.includes('aperçu') || lower.includes('prévisualiser')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog('Aperçu', 'Le contenu sélectionné est prêt à être consulté.', 'Fermer');
        return;
      }
      if (lower.includes('nouvelle intervention') || lower.includes('nouvel événement') || lower.includes('nouvelle zone')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Ajoutez les informations de cette nouvelle activité.', 'Créer');
        return;
      }
      if (lower.includes('voir les journaux')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/journaux`);
        return;
      }
      if (lower.includes('voir les clients')) {
        event.preventDefault();
        event.stopPropagation();
        navigate(`${paths[role]}/messagerie`);
        return;
      }
      if (label.includes('•••')) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('.agrimac-action-popover')?.remove();
        const popover = document.createElement('div');
        popover.className = 'agrimac-action-popover';
        popover.innerHTML = '<b>Actions du panneau</b><button type="button" data-action-route="notifications">Voir les notifications</button><button type="button" data-action-close>Fermer</button>';
        popover.querySelector('[data-action-route]')?.addEventListener('click', () => { popover.remove(); navigate(`${paths[role]}/notifications`); });
        popover.querySelector('[data-action-close]')?.addEventListener('click', () => popover.remove());
        document.body.appendChild(popover);
        return;
      }
      if (lower.includes('répondre') || lower === 'voir') {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Ajoutez les informations nécessaires pour poursuivre cette action.', 'Continuer');
        return;
      }
      if (lower.includes('export')) return;
      const destination = routeFor(label);
      if (destination && location.pathname.replace(/\/+$/, '') === destination.replace(/\/+$/, '')) return;
      if (lower.includes('refuser') || lower.includes('accepter')) {
        event.preventDefault();
        event.stopPropagation();
        openDialog(label, 'Cette action est prête à être configurée avec vos informations.', lower.includes('refuser') ? 'Confirmer' : 'Enregistrer');
        return;
      }
      if (!destination || button.closest('form') || button.type === 'submit') return;
      event.preventDefault();
      event.stopPropagation();
      navigate(destination);
    };
    // Actions are owned by their page components. A text-based global router
    // sends unrelated buttons to the wrong destination and is intentionally disabled.
    return () => { document.removeEventListener('click', handleAction, true); document.querySelector('.agrimac-action-popover')?.remove(); document.querySelector('.agrimac-action-dialog-overlay')?.remove(); };
  }, [location.pathname, role, navigate]);
  const logout = async () => { await logoutSession(); navigate('/connexion', { replace: true }); };
  return <div className={`reference-dashboard-shell ${role === 'administrateur' ? 'admin-dashboard-shell' : ''}`}><AnimatePresence>{open && <motion.button className="reference-drawer-backdrop" aria-label="Fermer le menu" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence><aside className={`reference-sidebar ${open ? 'is-open' : ''}`}><div className="reference-sidebar-head"><Logo /><button className="reference-close" onClick={() => setOpen(false)}><X size={18} /></button></div><div className="reference-user">{role === 'maintenancier' ? <img className="reference-profile-photo" src={`${ASSET}maintenancier.png`} alt="Arsène Zannou" /> : <span className="reference-avatar">{user.fullname?.[0] || 'A'}</span>}<span><b>{user.fullname || 'Utilisateur'}</b><small>{roles[role]} <ShieldCheck size={12} /></small></span><ChevronRight size={15} /></div><nav className="reference-nav">{navigation[role].map(section => <div className="reference-nav-group" key={section.group}><small className="reference-nav-label">{section.group}</small>{section.items.map(([label, to, Icon, subtitle, badge]) => <NavLink end={!to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''} key={`${section.group}-${label}`} to={`${paths[role]}/${to}`}><Icon size={17} /><span><b>{label}</b>{subtitle && <small>{subtitle}</small>}</span>{badge && <i>{badge}</i>}</NavLink>)}</div>)}</nav><div className="reference-sidebar-footer"><div className="reference-mode"><ShieldCheck size={17} /><span><b>Mode simplifié</b><small>Interface adaptée</small></span><strong>Activé</strong></div><button className="reference-help" onClick={() => notify('Assistance vocale ouverte.')}><CircleHelp size={16} /><span><b>Besoin d’aide ?</b><small>Assistance vocale AGRIMAC</small></span></button><button className="reference-logout" onClick={logout}><LogOut size={15} /> Se déconnecter</button></div></aside><div className="reference-dashboard-main"><ReferenceTopbar role={role} user={user} onMenu={() => setOpen(true)} /><main className="reference-content">{isRoot ? (role === 'administrateur' ? <AdminDashboardPremiumReference /> : role === 'entreprise' ? <EnterpriseDashboardHome user={user} /> : role === 'maintenancier' ? <MaintainerDashboardReplica /> : <FarmerDashboardReplica />) : <Outlet />}</main></div></div>;
}

function ReferenceTopbar({ role, user, onMenu }) { const navigate = useNavigate(); const [query, setQuery] = React.useState(''); const [language, setLanguage] = React.useState(() => { try { return localStorage.getItem('agrimacLanguage') || 'FR'; } catch { return 'FR'; } }); const [languageOpen, setLanguageOpen] = React.useState(false); const search = value => navigate(`${paths[role]}/rechercher?query=${encodeURIComponent(value.trim())}`); const openVoiceSearch = () => openAction({ type: 'form', icon: '?', title: 'Recherche vocale', description: 'Saisissez votre demande ou lancez la recherche depuis votre espace AGRIMAC.', submitLabel: 'Rechercher', fields: [{ name: 'query', label: role === 'entreprise' ? 'Machine ou commande' : role === 'maintenancier' ? 'Demande ou client' : role === 'administrateur' ? 'Utilisateur ou entreprise' : 'Machine ou service', value: query, required: true }], onSubmit: form => { const value = String(form.get('query') || '').trim(); setQuery(value); search(value); } }); const chooseLanguage = value => { setLanguage(value); setLanguageOpen(false); try { localStorage.setItem('agrimacLanguage', value); const storedUser = JSON.parse(localStorage.getItem('agrimacUser') || '{}'); localStorage.setItem('agrimacUser', JSON.stringify({ ...storedUser, language: value })); } catch { /* Keep the selector usable when storage is unavailable. */ } notify(`Langue sélectionnée : ${value === 'FR' ? 'Français' : value === 'EN' ? 'English' : 'Fon'}.`); }; return <header className={`reference-topbar ${role === 'entreprise' ? 'enterprise-topbar' : ''}`}><button className="reference-menu" onClick={onMenu}><Menu size={21} /></button>{role !== 'entreprise' && <div className="reference-greeting"><h1>Bonjour, {(user.fullname || 'Utilisateur').split(' ')[0]} ! <span>👋</span></h1><p>{role === 'maintenancier' ? 'Voici un aperçu de vos interventions et demandes.' : role === 'administrateur' ? 'Supervisez et gérez votre écosystème AGRIMAC.' : 'Bienvenue sur AGRIMAC, votre écosystème agricole.'}</p></div>}<div className="reference-top-actions"><label className="reference-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && search(query)} placeholder={role === 'entreprise' ? 'Rechercher une machine, une commande...' : role === 'maintenancier' ? 'Rechercher une demande, un client...' : role === 'administrateur' ? 'Rechercher un utilisateur, une entreprise...' : 'Rechercher une machine, un service...'} /></label><button className="reference-voice" onClick={openVoiceSearch}><Mic size={16} /> Recherche vocale</button><div className="reference-language-picker"><button className="reference-language" onClick={() => setLanguageOpen(value => !value)} aria-expanded={languageOpen}>{language} <ChevronRight size={13} /></button>{languageOpen && <div className="reference-language-menu" role="menu"><button type="button" onClick={() => chooseLanguage('FR')}>Français</button><button type="button" onClick={() => chooseLanguage('EN')}>English</button><button type="button" onClick={() => chooseLanguage('FON')}>Fon</button></div>}</div><button className="reference-bell" onClick={() => navigate(`${paths[role]}/notifications`)}><Bell size={18} /><i /></button><button className="reference-profile" onClick={() => navigate(`${paths[role]}/profil`)}><span>{user.fullname?.[0] || 'A'}</span><ChevronRight size={14} /></button></div></header>; }

const dashboardData = {
  agriculteur: { title: 'Votre activité en un coup d’œil', kpis: [['12', 'Demandes envoyées', 'Ce mois-ci', ClipboardList], ['8', 'Messages non lus', 'Nouveaux messages', MessageCircle], ['245 000 FCFA', 'Total dépensé', 'Ce mois-ci', WalletCards], ['4.6 /5', 'Ma note moyenne', 'Basée sur 18 avis', Star], ['28°C', 'Cotonou, Bénin', 'Ensoleillé', MapPin]], primary: 'Trouver des prestataires proches de vous', secondary: 'Notifications récentes' },
  entreprise: { title: 'La performance de votre activité', kpis: [['24 750 000 FCFA', 'Ventes totales (mois)', '18.6% vs mois dernier', ShoppingCart], ['12 543', 'Vues catalogue', '12.4% vs mois dernier', Package], ['36', 'Commandes', '9.7% vs mois dernier', ShoppingCart], ['7', 'Devis en attente', '16.7% vs mois dernier', FileText], ['4.7 /5', 'Note moyenne', '128 avis', Star]], primary: 'Statistiques des ventes', secondary: 'Produits les plus consultés' },
  maintenancier: { title: 'Vos interventions en un coup d’œil', kpis: [['12', 'Demandes en attente', 'Nouvelles demandes', ClipboardList], ['8', 'Devis envoyés', 'En attente de réponse', FileText], ['5', 'Interventions planifiées', 'Cette semaine', CalendarDays], ['28', 'Interventions terminées', 'Ce mois-ci', Wrench], ['4.7 /5', 'Note moyenne', '128 avis reçus', Star]], primary: 'Demandes proches de votre zone', secondary: 'Notifications récentes' },
  administrateur: { title: 'Vue globale de la plateforme', kpis: [['5 924', 'Utilisateurs totaux', '+12.5% ce mois-ci', Users], ['256', 'Entreprises', '+8.3% ce mois-ci', Building2], ['412', 'Maintenanciers', '+9.7% ce mois-ci', Wrench], ['5 256', 'Agriculteurs', '+13.8% ce mois-ci', Tractor], ['1 842', 'Annonces actives', '+15.2% ce mois-ci', Package], ['37', 'Signalements', '-5.1% ce mois-ci', AlertTriangle]], primary: 'Vue d’ensemble des activités', secondary: 'Comptes en attente de validation' },
};

export function ReferenceDashboardHome({ role, user }) {
  if (role === 'administrateur') return <AdminDashboardConnected />;
  const data = dashboardData[role];
  const navigate = useNavigate();
  const [farmerStats, setFarmerStats] = React.useState(null);
  React.useEffect(() => { if (role !== 'agriculteur') return undefined; let cancelled = false; Promise.all([resources.farmer.requests(), resources.payments.list(), resources.notifications.list({ limit: 1, skip: 0 }), resources.conversations.list({ limit: 1, skip: 0 }), resources.farmer.favorites()]).then(([requests, payments, notifications, conversations, favorites]) => { if (cancelled) return; const requestItems = Array.isArray(requests) ? requests : requests.items || []; const paymentItems = Array.isArray(payments) ? payments : payments.items || []; setFarmerStats({ requests: requestItems.length, unreadMessages: conversations.unread || 0, spent: paymentItems.filter(item => item.status === 'SUCCESS').reduce((sum, item) => sum + (item.amountXof || 0), 0), unreadNotifications: notifications.unread || 0, favorites: Array.isArray(favorites) ? favorites.length : (favorites.items || []).length }); }).catch(() => { if (!cancelled) setFarmerStats(null); }); return () => { cancelled = true; }; }, [role]);
  const [period, setPeriod] = React.useState('30 jours');
  const base = paths[role];
  const go = section => navigate(`${base}/${section}`);
  const destinationFor = label => /message/i.test(label) ? 'messagerie' : /dépens|paiement/i.test(label) ? 'paiements' : /note|avis/i.test(label) ? 'avis' : /demande/i.test(label) ? 'demandes' : 'notifications';
  const actionSection = role === 'agriculteur' ? 'rechercher' : role === 'entreprise' ? 'produits' : role === 'maintenancier' ? 'demandes' : 'utilisateurs';
  const displayData = role === 'agriculteur' && farmerStats ? { ...data, kpis: [[String(farmerStats.requests), 'Demandes envoyées', 'Backend AGRIMAC', ClipboardList], [String(farmerStats.unreadMessages), 'Messages non lus', 'Backend AGRIMAC', MessageCircle], [`${farmerStats.spent.toLocaleString('fr-FR')} FCFA`, 'Total dépensé', 'Paiements confirmés', WalletCards], [String(farmerStats.unreadNotifications), 'Notifications non lues', 'Backend AGRIMAC', Bell], [String(farmerStats.favorites), 'Favoris', 'Backend AGRIMAC', Star]] } : data;
  return <div className={`reference-home reference-home-${role}`}>
    <div className="reference-home-heading"><div><span className="reference-overline">TABLEAU DE BORD</span><h2>{data.title}</h2></div><div><select value={period} onChange={event => setPeriod(event.target.value)} aria-label="Période du tableau de bord"><option>30 jours</option><option>Cette semaine</option><option>Cette année</option></select><button className="reference-primary" onClick={() => go(actionSection)}>+ {role === 'agriculteur' ? 'Nouvelle demande' : 'Nouvelle action'}</button></div></div>
    <div className="reference-kpi-grid">{displayData.kpis.map(([value, label, trend, Icon], index) => <button className={`reference-kpi tone-${index % 5}`} key={label} onClick={() => go(destinationFor(label))}><span><Icon size={19} /></span><div><strong>{value}</strong><b>{label}</b><small>{trend}</small></div><svg viewBox="0 0 80 24" preserveAspectRatio="none"><path d={index % 2 ? 'M0 18 C14 17 18 8 28 14 S45 22 54 10 S69 9 80 4' : 'M0 18 C14 18 18 8 28 14 S44 5 55 14 S69 17 80 4'} /></svg></button>)}</div>
    <div className="reference-main-grid"><section className="reference-panel reference-panel-wide"><header><div><h3>{data.primary}</h3><p>{role === 'agriculteur' ? 'Prestataires et équipements autour de votre exploitation.' : role === 'administrateur' ? 'Inscriptions, annonces publiées et transactions.' : 'Suivez les données importantes de votre activité.'}</p></div><button onClick={() => go(role === 'agriculteur' ? 'rechercher' : 'notifications')} aria-label="Ouvrir les options">•••</button></header>{role === 'agriculteur' || role === 'maintenancier' ? <ReferenceMap role={role} /> : <ReferenceChart role={role} period={period} onPeriodChange={setPeriod} />}</section><section className="reference-panel"><header><div><h3>{data.secondary}</h3><p>Les dernières informations À traiter.</p></div><button onClick={() => go('notifications')}>Voir tout</button></header>{role === 'agriculteur' ? <ReferenceFarmerNotificationsLive /> : <ReferenceNotifications role={role} />}</section></div>
    <div className="reference-lower-grid"><section className="reference-panel"><header><div><h3>{role === 'agriculteur' ? 'Demandes récentes' : 'Activité récente'}</h3><p>Sélectionnez une ligne pour consulter son contenu.</p></div><button onClick={() => go(role === 'agriculteur' ? 'demandes' : 'notifications')}>Voir tout</button></header>{role === 'agriculteur' ? <ReferenceFarmerActivityLive /> : <ReferenceActivity role={role} />}</section><section className="reference-panel"><header><div><h3>Actions rapides</h3><p>Accédez directement à vos fonctionnalités.</p></div></header><div className="reference-quick-actions">{(role === 'agriculteur' ? [['Publier une demande', 'rechercher'], ['Messagerie', 'messagerie'], ['Paiements', 'paiements'], ['Avis', 'avis']] : [['Notifications', 'notifications'], ['Profil', 'profil']]).map(([label, section]) => <button key={label} onClick={() => go(section)}><Plus size={15} /><span>{label}</span><ChevronRight size={14} /></button>)}</div></section></div>
  </div>;
}
const enterpriseOrders = [['#CMD-2025-1456', 'Koffi Agbodan', 'Tracteur MF 375', '8,500,000 FCFA', 'En attente', '01 Juin 2025'], ['#CMD-2025-1455', 'Jean Hounkpe', 'Motopompe Hyundai', '325,000 FCFA', 'Payée', '01 Juin 2025'], ['#CMD-2025-1454', 'Euloge Dossou', 'Engrais NPK 20-10-10', '45,000 FCFA', 'Expédiée', '31 Mai 2025'], ['#CMD-2025-1453', 'Mohamed Salami', 'Pulvérisateur 16L', '28,000 FCFA', 'Livrée', '30 Mai 2025'], ['#CMD-2025-1452', 'Arsène Zannou', 'Herse à disques', '1,250,000 FCFA', 'Annulée', '29 Mai 2025']];
function EnterpriseSpark({ color = '#106e3f', path = 'M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L60 8 L70 2 L80 6 L90 0 L100 4' }) { return <svg className="enterprise-home-spark" viewBox="0 0 100 20" preserveAspectRatio="none"><path d={path} stroke={color} /></svg>; }
function EnterpriseMetric({ icon, label, value, trend, tone, path, children }) { const navigate = useNavigate(); const target = /commande|vente/i.test(label) ? 'commandes' : /vue|catalogue/i.test(label) ? 'statistiques' : /devis/i.test(label) ? 'devis' : 'avis'; return <article className="enterprise-home-metric" role="button" tabIndex={0} onClick={() => navigate(`${paths.entreprise}/${target}`)} onKeyDown={event => event.key === 'Enter' && navigate(`${paths.entreprise}/${target}`)}><div className={`enterprise-home-metric-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong></div><span className="enterprise-home-trend">↗ {trend}</span>{children || <EnterpriseSpark color={tone === 'blue' ? '#147cff' : tone === 'yellow' ? '#f1ad00' : tone === 'purple' ? '#9a43ef' : '#106e3f'} path={path} />}</article>; }
export function EnterpriseDashboardHome({ user }) { const navigate = useNavigate(); const [period, setPeriod] = React.useState('30 derniers jours'); const products = [['Tracteur Massey Ferguson 375', '2,456', '15.2%', 'tractor3.png'], ['Motopompe Hyundai 3 pouces', '1,842', '11.3%', 'scene_intrants.png'], ['Engrais NPK 20-10-10 (50kg)', '1,256', '8.7%', 'product_maize.png'], ['Herse à disques 18 disques', '1,098', '7.9%', 'tractor4.png'], ['Pulvérisateur 16L', '987', '5.6%', 'scene_intrants.png']]; const notifications = [['Nouveau message', 'De Koffi Agbodan', 'Il y a 10 min', MessageCircle], ['Nouvelle demande de devis', 'Pour Motopompe Hyundai', 'Il y a 25 min', FileText], ['Nouvelle commande', 'Commande #CMD-2025-1456', 'Il y a 1 heure', ShoppingCart], ['Nouvel avis client', '(4.0)', 'Il y a 2 heures', Star]]; return <div className="enterprise-home-reference"><div className="enterprise-home-greeting"><h2>Bonjour, MTN Bénin SARL ! <span>👋</span></h2><p>Voici un aperçu des activités de votre entreprise.</p></div><div className="enterprise-home-metrics"><EnterpriseMetric icon={<ShoppingCart size={19} />} label="Ventes totales (mois)" value="24,750,000 FCFA" trend="18.6% vs mois dernier" tone="green" /><EnterpriseMetric icon={<Eye size={19} />} label="Vues catalogue" value="12,543" trend="12.4% vs mois dernier" tone="blue" path="M0 15 L15 18 L30 10 L45 14 L60 5 L75 8 L90 2 L100 5" /><EnterpriseMetric icon={<ShoppingCart size={19} />} label="Commandes" value="36" trend="9.7% vs mois dernier" tone="yellow" path="M0 18 L20 15 L40 16 L60 8 L80 10 L100 4" /><EnterpriseMetric icon={<FileText size={19} />} label="Devis en attente" value="7" trend="16.7% vs mois dernier" tone="purple" path="M0 20 L15 18 L30 19 L45 15 L60 16 L75 10 L90 12 L100 5" /><article className="enterprise-home-metric"><div className="enterprise-home-metric-icon green"><Star size={19} /></div><div><p>Note moyenne</p><strong>4.7 <small>/ 5</small></strong></div><span className="enterprise-home-stars">★★★★★</span><small className="enterprise-home-reviews">(128 avis)</small></article></div><div className="enterprise-home-middle"><section className="enterprise-home-sales"><header><div><h3>Statistiques des ventes</h3><strong>24,750,000 <small>FCFA</small></strong><p>Chiffre d’affaires</p><span>↗ <b>18.6%</b> par rapport aux 30 jours précédents</span></div><select value={period} onChange={event => setPeriod(event.target.value)}><option>30 derniers jours</option><option>Cette année</option></select></header><div className="enterprise-home-linechart"><svg viewBox="0 0 400 150" preserveAspectRatio="none"><path d="M0,130 L40,90 L80,110 L120,100 L160,60 L200,80 L240,50 L280,100 L320,40 L360,90 L400,20" fill="none" stroke="#106e3f" strokeWidth="2" /><path d="M0,150 L0,130 L40,90 L80,110 L120,100 L160,60 L200,80 L240,50 L280,100 L320,40 L360,90 L400,20 L400,150 Z" fill="#106e3f" fillOpacity=".1" /></svg><div>{['04 Mai', '08 Mai', '12 Mai', '16 Mai', '20 Mai', '24 Mai', '28 Mai', '01 Juin'].map(label => <small key={label}>{label}</small>)}</div></div><div className="enterprise-home-sales-kpis">{[['Ventes réussies', '32', '8.2%'], ['Ventes en attente', '4', '2.1%'], ['Annulées', '2', '-1.3%'], ['Panier moyen', '773,438 FCFA', '10.4%']].map(([label, value, trend]) => <div key={label}><small>{label}</small><b>{value}</b><span className={trend.startsWith('-') ? 'negative' : ''}>↗ {trend}</span></div>)}</div></section><section className="enterprise-home-products"><header><h3>Produits les plus consultés</h3><button onClick={() => navigate('/dashboard/entreprise/catalogue')}>Voir tout</button></header>{products.map(([name, views, trend, image]) => <div key={name}><img src={`${ASSET}${image}`} alt="" /><b>{name}</b><span><strong>{views}</strong><small>↗ {trend}</small></span></div>)}</section><section className="enterprise-home-notifications"><header><h3>Notifications récentes</h3><button onClick={() => navigate('/dashboard/entreprise/notifications')}>Voir tout</button></header>{notifications.map(([title, detail, time, Icon]) => <button key={title} onClick={() => notify(`${title} consulté.`)}><span><Icon size={15} /></span><div><b>{title}</b><small>{detail}</small><time>{time}</time></div><i /></button>)}</section></div><div className="enterprise-home-bottom"><section className="enterprise-home-orders"><header><h3>Commandes récentes</h3><button onClick={() => navigate('/dashboard/entreprise/commandes')}>Voir tout</button></header><div className="enterprise-home-order-head"><span>Commande</span><span>Client</span><span>Produit</span><span>Montant</span><span>Statut</span><span>Date</span></div>{enterpriseOrders.map(row => <button key={row[0]} onClick={() => navigate('/dashboard/entreprise/commandes')}><b>{row[0]}</b><span><i />{row[1]}</span><small>{row[2]}</small><strong>{row[3]}</strong><em className={`order-${row[4]}`}>{row[4]}</em><time>{row[5]}</time></button>)}</section><aside className="enterprise-home-side"><section className="enterprise-home-quick"><h3>Actions rapides</h3><div>{[['Ajouter un produit', 'produits', Plus], ['Voir catalogue', 'catalogue', Package], ['Demandes de devis', 'devis', FileText], ['Nouvelle annonce', 'produits', Megaphone], ['Rapport de ventes', 'rapports', BarChart3]].map(([label, path, Icon]) => <button key={label} onClick={() => navigate(`/dashboard/entreprise/${path}`)}><span><Icon size={17} /></span><b>{label}</b></button>)}</div></section><section className="enterprise-home-banner"><div><span>MTN</span><h3>Développez<br />votre activité</h3><p>Touchez plus d’agriculteurs et augmentez vos ventes</p><button onClick={() => notify('Booster mon entreprise ouvert.')}>Booster mon entreprise <ArrowRight size={14} /></button></div><img src={`${ASSET}scene_tractor.png`} alt="Tracteur agricole" /></section></aside></div></div>; }

function LegacyReferenceFarmerMessaging() {
  const [active, setActive] = React.useState('Mécano Pro SARL');
  const [message, setMessage] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const conversations = [['Mécano Pro SARL', 'Votre devis est prêt', '10 min', '+22996442108'], ['Agri Services Bénin', 'Merci pour votre commande', '35 min', '+22997123456'], ['Support AGRIMAC', 'Comment pouvons-nous vous aider ?', 'Hier', '']];
  const current = conversations.find(item => item[0] === active) || conversations[0];
  React.useEffect(() => { const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const call = () => current[3] ? window.location.assign(`tel:${current[3]}`) : notify(`Le numéro de ${active} n’est pas disponible.`, 'error');
  const sendMessage = () => { if (!message.trim()) return notify('écrivez un message avant de l’envoyer.'); notify('Message envoyé.'); setMessage(''); };
  return <main className="reference-messaging-page"><section className="messaging-conversations reference-panel"><header><div><h3>Conversations</h3><p>Messages non lus en priorité.</p></div><button onClick={() => notify('Nouvelle conversation ouverte.')}><MessageCircle size={15} /></button></header><label className="reference-search"><Search size={14} /><input placeholder="Rechercher une conversation..." /></label><div className="reference-conversation-list">{conversations.map(([name, text, time], index) => <button className={active === name ? 'active' : ''} key={name} onClick={() => setActive(name)}><span>{name[0]}</span><div><b>{name}</b><small>{text}</small></div><time>{time}</time>{index < 2 && <i />}</button>)}</div></section><section className="reference-chat reference-panel"><header><div><span className="reference-chat-avatar">{active[0]}</span><div><h3>{active}</h3><p>Conversation sécurisée · Intervention associée</p></div></div><div className="reference-chat-actions" ref={menuRef}><button onClick={call} aria-label="Appeler"><Phone size={15} /></button><button onClick={() => notify('Devis associé ouvert.')} aria-label="Ouvrir le devis"><FileText size={15} /></button><button onClick={() => setMenuOpen(value => !value)} aria-label="Ouvrir les options"><MoreHorizontal size={15} /></button>{menuOpen && <div className="reference-message-menu"><button onClick={() => { setMenuOpen(false); notify(`Profil de ${active} ouvert.`); }}>Voir le profil</button><button onClick={() => { setMenuOpen(false); notify('Conversation marquée comme lue.'); }}>Marquer comme lu</button><button onClick={() => { setMenuOpen(false); notify('Conversation archivée.'); }}>Archiver</button><button className="danger" onClick={() => { setMenuOpen(false); notify('Conversation supprimée.'); }}>Supprimer</button></div>}</div></header><div className="reference-chat-context"><Tractor size={16} /><span><b>Réparation Moissonneuse</b><small>Mécano Pro SARL · Devis reçu · 85 000 FCFA</small></span><button onClick={() => notify('Demande de r·paration ouverte.')}>Voir la demande <ChevronRight size={14} /></button></div><div className="reference-chat-messages"><p>Bonjour Koffi, votre devis pour la moissonneuse est prêt. Je peux intervenir demain · 09:00.</p><p className="mine">Merci, je consulte le devis.</p></div><div className="reference-chat-composer"><input value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} placeholder="·crire un message..." /><button onClick={sendMessage}><Send size={15} /></button></div></section></main>;
}
export function ReferenceEnterpriseMessaging() {
  const navigate = useNavigate();
  const initialItems = [{ name: 'Koffi Agbodan', text: 'Votre commande est confirmée', time: '10 min', unread: true, messages: [{ direction: 'received', text: 'Bonjour, pouvez-vous confirmer la date de livraison du tracteur ?', time: '09:12' }, { direction: 'sent', text: 'Bonjour Koffi, la livraison est confirmée pour vendredi matin.', time: '09:16' }, { direction: 'received', text: 'Parfait, merci pour votre réactivité.', time: '09:18' }] }, { name: 'Jean Hounkpe', text: 'Merci pour votre devis', time: '35 min', unread: true, messages: [] }, { name: 'Euloge Dossou', text: 'Pouvez-vous livrer demain ?', time: 'Hier', unread: false, messages: [] }, { name: 'Ferme Sèmè', text: 'La facture est disponible', time: 'Hier', unread: false, messages: [] }];
  const [active, setActive] = React.useState('Koffi Agbodan');
  const [message, setMessage] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState(initialItems);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  const current = items.find(item => item.name === active) || items[0];
  const filteredItems = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()) || item.text.toLowerCase().includes(query.toLowerCase()));
  React.useEffect(() => { const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const sendMessage = () => { const text = message.trim(); if (!text) return notify('écrivez un message avant de l’envoyer.'); const time = 'à l’instant'; setItems(list => list.map(item => item.name === active ? { ...item, text, time, unread: false, messages: [...item.messages, { direction: 'sent', text, time }] } : item)); setMessage(''); notify(`Message envoyé à ${active}.`); };
  const openNewMessage = () => openAction({ type: 'form', icon: '?', title: 'Nouveau message client', description: 'Choisissez un destinataire et envoyez un message depuis votre messagerie entreprise.', submitLabel: 'Envoyer', fields: [{ name: 'recipient', label: 'Destinataire', required: true }, { name: 'message', label: 'Message', multiline: true, required: true }], onSubmit: form => { const recipient = String(form.get('recipient') || '').trim(); const text = String(form.get('message') || '').trim(); if (!recipient || !text) return; setItems(list => [{ name: recipient, text, time: 'à l’instant', unread: false, messages: [{ direction: 'sent', text, time: 'à l’instant' }] }, ...list.filter(item => item.name !== recipient)]); setActive(recipient); notify(`Message envoyé à ${recipient}.`); } });
  const openProfile = () => openAction({ type: 'detail', icon: '?', title: `Profil de ${active}`, description: 'Informations du client associé à cette conversation.', fields: [{ label: 'Client', value: active }, { label: 'Statut', value: 'Client vérifié' }, { label: 'Conversation', value: 'Messagerie entreprise' }] });
  const openOptions = () => openAction({ type: 'detail', icon: '•••', title: `Options pour ${active}`, description: 'Actions disponibles pour cette conversation.', fields: [{ label: 'État', value: current.unread ? 'Non lue' : 'Lue' }, { label: 'Actions', value: 'Marquer comme lue · Archiver · Ouvrir le profil' }] });
  return <main className="reference-messaging-page"><section className="messaging-conversations reference-panel"><header><div><h3>Messages clients</h3><p>{items.length} conversations actives.</p></div><button onClick={openNewMessage} aria-label="Nouveau message"><MessageCircle size={15} /></button></header><label className="reference-search"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un client..." /></label><div className="reference-conversation-list">{filteredItems.map(item => <button className={active === item.name ? 'active' : ''} key={item.name} onClick={() => { setActive(item.name); setMenuOpen(false); setItems(list => list.map(value => value.name === item.name ? { ...value, unread: false } : value)); }}><span>{item.name[0]}</span><div><b>{item.name}</b><small>{item.text}</small></div><time>{item.time}</time>{item.unread && <i />}</button>)}</div></section><section className="reference-chat reference-panel"><header><div><span className="reference-chat-avatar">{current.name[0]}</span><div><h3>{current.name}</h3><p>Client vérifié · Commande associée</p></div></div><div className="reference-chat-actions" ref={menuRef}><button onClick={openProfile} aria-label="Ouvrir le profil client"><Users size={15} /></button><button onClick={() => navigate('/dashboard/entreprise/commandes')} aria-label="Ouvrir la commande associée"><ShoppingCart size={15} /></button><button onClick={() => setMenuOpen(value => !value)} aria-label="Ouvrir les options"><MoreHorizontal size={15} /></button>{menuOpen && <div className="reference-message-menu"><button onClick={() => { setMenuOpen(false); openProfile(); }}>Voir le profil</button><button onClick={() => { setMenuOpen(false); setItems(list => list.map(item => item.name === active ? { ...item, unread: false } : item)); notify('Conversation marquée comme lue.'); }}>Marquer comme lu</button><button onClick={() => { setMenuOpen(false); notify('Conversation archivée.'); }}>Archiver</button></div>}</div></header><div className="reference-chat-context"><Package size={16} /><span><b>Tracteur Massey Ferguson 375</b><small>Commande #CMD-2025-1456 · 8 500 000 FCFA</small></span><button onClick={() => navigate('/dashboard/entreprise/commandes')}>Voir la commande <ChevronRight size={13} /></button></div><div className="reference-chat-messages">{current.messages.length ? current.messages.map((item, index) => <div className={`reference-message ${item.direction}`} key={`${item.time}-${index}`}>{item.text}<small>{item.time}</small></div>) : <div className="reference-message received">Aucun message r·cent dans cette conversation.<small>Maintenant</small></div>}</div><div className="reference-chat-composer"><button onClick={() => openAction({ type: 'detail', icon: '?', title: 'Pi·ces jointes', description: 'Ajoutez un document · votre ·change client.', fields: [{ label: 'Formats', value: 'PDF, JPG, PNG' }, { label: 'Taille maximale', value: '10 Mo' }] })} aria-label="Ajouter une pi·ce jointe"><Paperclip size={17} /></button><input value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} placeholder="·crire une r·ponse au client..." /><button onClick={sendMessage} aria-label="Envoyer le message"><Send size={16} /></button></div></section></main>;
}

const adminWorkspaceData = {
  utilisateurs: { title: 'Utilisateurs', subtitle: 'Gérez les comptes et les rôles de la plateforme.', columns: ['Nom', 'Profil', 'Statut', 'Localisation'], rows: [['Koffi Agbodan', 'Agriculteur', 'Actif', 'Cotonou'], ['MTN Bénin SARL', 'Entreprise', 'À valider', 'Cotonou'], ['Arsène Zannou', 'Maintenancier', 'Actif', 'Parakou'], ['Euloge Dossou', 'Agriculteur', 'Actif', 'Porto-Novo']] },
  entreprises: { title: 'Entreprises', subtitle: 'Validez les entreprises et leurs documents professionnels.', columns: ['Entreprise', 'Type', 'Statut', 'Équipe'], rows: [['MTN Bénin SARL', 'Entreprise agricole', 'À valider', '24 employés'], ['Agri Services Pro', 'Équipements', 'À valider', '8 employés'], ['Farm Equipement', 'Machines agricoles', 'Validée', '12 employés']] },
  maintenanciers: { title: 'Maintenanciers', subtitle: 'Contrôlez les prestataires, compétences et certifications.', columns: ['Prestataire', 'Spécialité', 'Statut', 'Note'], rows: [['Mécano Pro SARL', 'Mécanique agricole', 'À valider', '4.6 / 5'], ['Atelier Agri Nord', 'Hydraulique', 'À valider', '4.8 / 5'], ['Service Tracteur BJ', 'Moteurs diesel', 'Validé', '4.5 / 5']] },
  agriculteurs: { title: 'Agriculteurs', subtitle: 'Suivez les exploitants inscrits et leur activité.', columns: ['Nom', 'Profil', 'Statut', 'Zone'], rows: [['Koffi Agbodan', 'Agriculteur', 'Actif', 'Cotonou'], ['Euloge Dossou', 'Agriculteur', 'Actif', 'Porto-Novo'], ['Jean Hounkpe', 'Agriculteur', 'Suspendu', 'Parakou']] },
  annonces: { title: 'Annonces & produits', subtitle: 'Modérez les produits, services et contenus publiés.', columns: ['Annonce', 'Catégorie', 'Statut', 'Performance'], rows: [['Massey Ferguson 375', 'Machine agricole', 'Publié', '2 456 vues'], ['Motopompe Hyundai', 'Équipement', 'À modérer', '3 842 vues'], ['Engrais NPK 20-10-10', 'Intrant agricole', 'Publié', '1 256 vues']] },
  categories: { title: 'Catégories', subtitle: 'Organisez le catalogue et les services de la plateforme.', columns: ['Catégorie', 'Annonces', 'Statut', 'Mise à jour'], rows: [['Machines agricoles', '42 annonces', 'Actif', 'Aujourd’hui'], ['Pièces détachées', '86 annonces', 'Actif', 'Aujourd’hui'], ['Services de maintenance', '31 annonces', 'Actif', 'Hier']] },
  signalements: { title: 'Signalements', subtitle: 'Traitez les alertes de contenu, comptes et transactions.', columns: ['Signalement', 'Type', 'Priorité', 'Date'], rows: [['Annonce tracteur douteuse', 'Contenu', 'À traiter', 'Aujourd’hui'], ['Profil incomplet', 'Compte', 'En cours', 'Hier'], ['Paiement contesté', 'Transaction', 'Résolu', '05 août 2026']] },
  journaux: { title: 'Journaux d’activités', subtitle: 'Consultez les événements sensibles et les actions administratives.', columns: ['Événement', 'Auteur', 'Domaine', 'Date'], rows: [['Compte entreprise validé', 'Administrateur', 'Sécurité', 'Il y a 10 min'], ['Annonce signalée', 'Modération', 'Contenu', 'Il y a 1 h'], ['Export utilisateurs', 'Administrateur', 'Données', 'Il y a 2 h']] },
};

export function ReferenceAdminWorkspace({ section }) { const data = adminWorkspaceData[section] || adminWorkspaceData.utilisateurs; const [query, setQuery] = React.useState(''); const [rows, setRows] = React.useState(data.rows); const [selected, setSelected] = React.useState(null); const filtered = rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase())); const exportRows = () => downloadMock(`admin-${section}`, `${data.columns.join('|')}\n${rows.map(row => row.join('|')).join('\n')}`); const updateStatus = (index, status) => { setRows(current => current.map((row, rowIndex) => rowIndex === index ? [...row.slice(0, -2), status, ...row.slice(-1)] : row)); notify(`${rows[index][0]} : statut ${status.toLowerCase()}.`); }; return <main className="reference-admin-page"><div className="reference-page-heading"><div><span className="reference-overline">ADMINISTRATION</span><h2>{data.title}</h2><p>{data.subtitle}</p></div><div><button className="reference-secondary" onClick={exportRows}><FileBarChart size={15} /> Exporter</button><button className="reference-primary" onClick={() => notify(`Formulaire de création ouvert pour ${data.title}.`)}>+ Ajouter</button></div></div><div className="reference-admin-summary"><b>{rows.length}<small>Éléments affichés</small></b><b>{rows.filter(row => /actif|validé|publié|résolu/i.test(row.join(' '))).length}<small>Conformes</small></b><b>{rows.filter(row => /attente|modérer|traiter|suspendu/i.test(row.join(' '))).length}<small>À traiter</small></b></div><section className="reference-panel"><header><div><h3>Gestion de {data.title.toLowerCase()}</h3><p>Recherche, validation, modération et historique.</p></div><span className="reference-admin-count">{filtered.length} résultat(s)</span></header><div className="reference-admin-toolbar"><label className="reference-search"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Rechercher dans ${data.title.toLowerCase()}...`} /></label><button className="reference-secondary" onClick={() => setQuery('')}>Réinitialiser</button></div><div className="reference-admin-table"><div className="reference-admin-table-head">{data.columns.map(column => <span key={column}>{column}</span>)}<span>Actions</span></div>{filtered.map(row => { const index = rows.indexOf(row); return <div className="reference-admin-table-row" key={row[0]}>{row.map((cell, cellIndex) => cellIndex === row.length - 2 ? <span className="reference-status" key={cell}>{cell}</span> : <span key={cell}>{cell}</span>)}<div><button onClick={() => setSelected(row)} aria-label="Voir le détail"><Eye size={14} /></button><button onClick={() => updateStatus(index, /attente|modérer|traiter|suspendu/i.test(row[row.length - 2]) ? 'Validé' : 'Archivé')} aria-label="Changer le statut"><Check size={14} /></button></div></div>})}</div></section>{selected && <div className="reference-admin-modal-backdrop" onClick={() => setSelected(null)}><section className="reference-admin-modal" onClick={event => event.stopPropagation()}><header><div><span className="reference-overline">DÉTAIL</span><h3>{selected[0]}</h3></div><button onClick={() => setSelected(null)}><X size={17} /></button></header>{selected.map((cell, index) => <p key={`${cell}-${index}`}><b>{data.columns[index]}</b><span>{cell}</span></p>)}<button className="reference-primary" onClick={() => { setSelected(null); notify('Modification enregistrée.'); }}>Enregistrer</button></section></div>}</main>; }

function MaintainerDashboardHome({ user }) { const navigate = useNavigate(); const requests = [['Réparation tracteur John Deere 5090', '2.4 km · Calavi', 'Haute', 'scene_tractor.png'], ['Entretien motoculteur Honda F720', '4.7 km · Godomey', 'Moyenne', 'hero_farmer.png'], ['Réparation pompe à eau', '6.1 km · Cotonou', 'Basse', 'scene_intrants.png'], ['Entretien générateur 5KVA', '12.8 km · Akassato', 'Moyenne', 'scene_intrants.png']]; return <div className="maintainer-home-reference"><div className="maintainer-home-heading"><div><span className="reference-overline">TABLEAU DE BORD</span><h2>Vos interventions en un coup d’œil</h2><p>Voici un aperçu de vos interventions et demandes.</p></div><button className="reference-primary" onClick={() => navigate('/dashboard/maintenancier/devis')}>+ Nouveau devis</button></div><div className="maintainer-home-kpis">{[['12', 'Demandes en attente', 'Nouvelles demandes', ClipboardList, 'emerald'], ['8', 'Devis envoyés', 'En attente de réponse', FileText, 'amber'], ['5', 'Interventions planifiées', 'Cette semaine', CalendarDays, 'blue'], ['28', 'Interventions terminées', 'Ce mois-ci', Check, 'green'], ['4.7 / 5', 'Note moyenne', '128 avis reçus', Star, 'purple']].map(([value,label,detail,Icon,tone]) => <button className="maintainer-home-kpi" key={label} onClick={() => notify(`${label} ouvert.`)}><span className={tone}><Icon size={18} /></span><div><strong>{value}</strong><b>{label}</b><small>{detail}</small></div><ArrowRight size={13} /></button>)}</div><div className="maintainer-home-grid"><section className="maintainer-home-map reference-panel"><header><div><h3>Demandes proches de votre zone</h3><p>Abomey-Calavi, Sô-Ava et Cotonou.</p></div><button onClick={() => navigate('/dashboard/maintenancier/demandes')}>Voir les demandes</button></header><ReferenceMap role="maintenancier" /><div className="maintainer-map-legend"><span><i className="high" /> Haute priorité</span><span><i className="medium" /> Moyenne</span><span><i className="low" /> Basse</span></div></section><section className="maintainer-home-requests reference-panel"><header><div><h3>Demandes en attente</h3><p>Priorité et distance actualisées.</p></div><button onClick={() => navigate('/dashboard/maintenancier/demandes')}>Voir tout</button></header>{requests.map(([title, detail, priority, image]) => <button key={title} onClick={() => navigate('/dashboard/maintenancier/demandes')}><img src={`${ASSET}${image}`} alt="" /><span><b>{title}</b><small>{detail}</small></span><em className={priority.toLowerCase()}>{priority}</em><ChevronRight size={14} /></button>)}</section><section className="maintainer-home-notifications reference-panel"><header><div><h3>Notifications récentes</h3><p>Les dernières alertes de votre activité.</p></div><button onClick={() => navigate('/dashboard/maintenancier/notifications')}>Voir tout</button></header><ReferenceNotifications role="maintenancier" /></section><section className="maintainer-home-agenda reference-panel"><header><div><h3>Mon agenda</h3><p>Vos prochaines interventions.</p></div><button onClick={() => navigate('/dashboard/maintenancier/calendrier')}>Ouvrir l’agenda</button></header>{[['09:00', 'Réparation tracteur 5090', 'Calavi'], ['14:00', 'Entretien motoculteur F720', 'Godomey'], ['09:30', 'Réparation pompe à eau', 'Hévié']].map(row => <button key={row[1]} onClick={() => notify(`Intervention : ${row[1]}`)}><time>{row[0]}</time><span><b>{row[1]}</b><small>{row[2]}</small></span><em>Planifié</em></button>)}<div className="maintainer-performance"><b>Mes performances</b><span>85% des interventions terminées à temps</span><i><em /></i><button onClick={() => navigate('/dashboard/maintenancier/statistiques')}>Voir les statistiques <ArrowRight size={12} /></button></div></section></div></div>; }

function MaintainerDashboardReplica() { const navigate = useNavigate(); const [period, setPeriod] = React.useState('30 derniers jours'); const requests = [['Réparation tracteur John Deere 5090', 'Koffi Agbodan', 'Calavi, Abomey-Calavi', '2.4 km', 'Haute', 'scene_tractor.png'], ['Entretien motoculteur Honda F720', 'Ferme Sèmè', 'Godomey, Abomey-Calavi', '4.7 km', 'Moyenne', 'hero_farmer.png'], ['Réparation pompe à eau', 'Jean Hounkpe', 'Hévié, Abomey-Calavi', '6.1 km', 'Basse', 'scene_intrants.png'], ['Entretien générateur 5KVA', 'AgriPlus', 'Akassato, Cotonou', '12.8 km', 'Moyenne', 'scene_intrants.png']]; const agenda = [['16 Mai', 'Réparation tracteur 5090', 'Calavi, Abomey-Calavi', '09:00'], ['16 Mai', 'Entretien motoculteur F720', 'Godomey, Abomey-Calavi', '14:00'], ['17 Mai', 'Réparation pompe à eau', 'Hévié, Abomey-Calavi', '09:30'], ['18 Mai', 'Entretien générateur', 'Akassato, Cotonou', '11:00']]; const notifications = [['Nouveau message', 'De MTN Bénin SARL', 'Il y a 10 min', MessageCircle, 'emerald'], ['Nouveau devis accepté', 'Par Jean Hounkpe', 'Il y a 30 min', FileText, 'blue'], ['Intervention planifiée', 'Demain à 09:00', 'Il y a 1 h', CalendarDays, 'amber'], ['Nouvel avis reçu', '★★★★★ (5.0)', 'Il y a 2 h', Star, 'purple'], ['Intervention terminée', 'Hévié, Abomey-Calavi', 'Il y a 3 h', Check, 'green']]; return <div className="maintainer-replica"><div className="maintainer-replica-heading"><div><span className="reference-overline">TABLEAU DE BORD</span><h2>Vos interventions en un coup d’œil</h2><p>Voici un aperçu de vos interventions et demandes.</p></div><div className="maintainer-replica-actions"><select value={period} onChange={event => setPeriod(event.target.value)}><option>30 derniers jours</option><option>Cette semaine</option><option>Cette année</option></select><button className="reference-primary" onClick={() => navigate('/dashboard/maintenancier/devis')}><Plus size={15} /> Nouveau devis</button></div></div><div className="maintainer-replica-kpis">{[[Wrench, '12', 'Demandes en attente', 'Nouvelles demandes', 'emerald', 'demandes'], [FileText, '8', 'Devis envoyés', 'En attente de réponse', 'amber', 'devis'], [CalendarDays, '5', 'Interventions planifiées', 'Cette semaine', 'blue', 'interventions'], [Check, '28', 'Interventions terminées', period === 'Cette année' ? 'Cette année' : 'Ce mois-ci', 'green', 'historique'], [Star, '4.7 / 5', 'Note moyenne', '128 avis reçus', 'purple', 'avis']].map(([Icon, value, label, detail, tone, target]) => <button key={label} className="maintainer-replica-kpi" onClick={() => navigate(`/dashboard/maintenancier/${target}`)}><span className={`maintainer-replica-kpi-icon ${tone}`}><Icon size={19} /></span><div><strong>{value}</strong><b>{label}</b><small>{detail}</small></div><em>Voir {label.toLowerCase()} <ArrowRight size={11} /></em></button>)}</div><div className="maintainer-replica-middle"><section className="maintainer-replica-panel maintainer-replica-map-panel"><header><div><h3><MapPin size={16} /> Demandes proches de votre zone</h3><p>Géolocalisation intelligente</p></div><button onClick={() => navigate('/dashboard/maintenancier/demandes')}>Voir sur la carte</button></header><div className="maintainer-replica-map"><span className="replica-map-road road-one" /><span className="replica-map-road road-two" /><b className="replica-city city-calavi">Abomey-Calavi</b><b className="replica-city city-sava">Sô-Ava</b><b className="replica-city city-cotonou">Cotonou</b><button className="replica-pin pin-one" onClick={() => notify('2 demandes dans la zone Abomey-Calavi.')}>2</button><button className="replica-pin pin-two" onClick={() => notify('3 demandes dans la zone Sô-Ava.')}>3</button><button className="replica-pin pin-three" onClick={() => notify('3 demandes dans la zone Cotonou.')}>3</button><span className="replica-current-location" /></div><div className="maintainer-replica-map-legend"><span><i className="very-close" /> Très proche (0-5 km)</span><span><i className="close-zone" /> Proche (5-15 km)</span><span><i className="far-zone" /> Moyen (15+ km)</span></div></section><section className="maintainer-replica-panel maintainer-replica-requests"><header><h3><Wrench size={15} /> Demandes en attente</h3><button onClick={() => navigate('/dashboard/maintenancier/demandes')}>Voir tout</button></header>{requests.map(([title, client, location, distance, priority, image]) => <button className="maintainer-replica-request" key={title} onClick={() => notify(`${title} ouvert.`)}><img src={`${ASSET}${image}`} alt="" /><span><b>{title}</b><small>{location}</small><em>{client} · {distance}</em></span><i className={priority.toLowerCase()}>{priority}</i></button>)}</section><section className="maintainer-replica-panel maintainer-replica-notifications"><header><h3><Bell size={15} /> Notifications récentes</h3><button onClick={() => navigate('/dashboard/maintenancier/notifications')}>Voir tout</button></header>{notifications.map(([title, detail, time, Icon, tone]) => <button key={title} onClick={() => notify(`${title} consulté.`)}><span className={`replica-notification-icon ${tone}`}><Icon size={15} /></span><span><b>{title}</b><small>{detail}</small><em>{time}</em></span><i /></button>)}</section></div><div className="maintainer-replica-bottom"><section className="maintainer-replica-panel replica-agenda"><header><h3><CalendarDays size={15} /> Mon agenda</h3><button onClick={() => navigate('/dashboard/maintenancier/calendrier')}>Voir tout</button></header>{agenda.map(([date, title, location, time]) => <button key={title} onClick={() => notify(`Rendez-vous ${title} ouvert.`)}><time>{date}</time><span><b>{title}</b><small>{location}</small></span><i>Planifié</i><MoreHorizontal size={14} /></button>)}</section><section className="maintainer-replica-panel replica-performance"><header><h3><BarChart3 size={15} /> Mes performances</h3><select defaultValue="Ce mois-ci"><option>Ce mois-ci</option><option>Cette année</option></select></header><div className="replica-performance-content"><div className="replica-ring"><strong>85%</strong><small>Taux de complétion</small></div><div>{[['Interventions terminées', '28', 'green'], ['Interventions en cours', '5', 'blue'], ['Devis acceptés', '15', 'amber'], ['Taux de satisfaction', '4.7 / 5', 'purple']].map(([label, value, tone]) => <p key={label}><i className={tone} /> <span>{label}</span><b>{value}</b></p>)}</div></div><button className="replica-panel-link" onClick={() => navigate('/dashboard/maintenancier/statistiques')}>Voir toutes mes statistiques <ArrowRight size={12} /></button></section><section className="maintainer-replica-panel replica-zones"><header><h3><MapPin size={15} /> Mes zones d’intervention</h3><button onClick={() => navigate('/dashboard/maintenancier/disponibilites')}>Gérer</button></header>{[['Abomey-Calavi', 'Actif'], ['Cotonou', 'Actif'], ['Ouidah', 'Actif'], ['Porto-Novo', 'Inactif']].map(([zone, status]) => <button key={zone} onClick={() => notify(`${zone} : ${status}.`)}><MapPin size={14} /><span>{zone}</span><i className={status === 'Actif' ? 'active' : ''}>{status}</i></button>)}<button className="replica-add-zone" onClick={() => navigate('/dashboard/maintenancier/disponibilites')}><Plus size={13} /> Ajouter une zone</button></section></div><section className="maintainer-replica-support"><span><ShieldCheck size={28} /></span><div><b>Besoin d’assistance ou d’outils professionnels ?</b><small>Accédez à nos guides de réparation, outils techniques et support pour mieux servir vos clients.</small></div><button onClick={() => notify('Assistance vocale AGRIMAC activée.')}><CircleHelp size={15} /> Assistance vocale <ArrowRight size={12} /></button></section></div>; }

function ReferenceMap({ role }) { return <RealAgrimacMap className="reference-dashboard-map" />; }

function FarmerDashboardReplica() { const navigate = useNavigate(); const [period, setPeriod] = React.useState('Ce mois-ci'); const providers = [['Agri Services Bénin', 'Vente & location', '1.2 km', '4.8', 'producer_avatar_5.png'], ['Mécano Pro SARL', 'Réparation', '1.8 km', '4.6', 'maintenancier.png'], ['Farm Equipement', 'Pièces détachées', '2.3 km', '4.5', 'entreprise.png']]; const notifications = [['Nouveau message', 'Agri Services Bénin', 'Il y a 10 min', MessageCircle, 'green'], ['Devis reçu de Mécano Pro SARL', 'Montant : 85 000 FCFA', 'Il y a 35 min', FileText, 'blue'], ['Paiement confirmé à Farm Equipement', 'Votre paiement est confirmé.', 'Il y a 1 h', Check, 'emerald'], ['Intervention planifiée', 'Demain à 09:00', 'Il y a 2 heures', Wrench, 'orange']]; const requests = [['Location tracteur 90 CV', 'Agri Services Bénin', 'En attente', 'Aujourd’hui'], ['Réparation moissonneuse', 'Mécano Pro SARL', 'Devis reçu', 'Hier'], ['Intervention irrigation', 'Farm Equipement', 'En cours', '12 juin']]; return <div className="farmer-replica"><div className="farmer-replica-heading"><div><span className="reference-overline">TABLEAU DE BORD</span><h2>Votre activité en un coup d’œil</h2><p>Bienvenue sur AGRIMAC, votre écosystème agricole.</p></div><div className="farmer-replica-actions"><select value={period} onChange={event => setPeriod(event.target.value)}><option>Ce mois-ci</option><option>Cette semaine</option><option>Cette année</option></select><button className="reference-primary" onClick={() => navigate('/dashboard/agriculteur/rechercher')}><Plus size={15} /> Nouvelle demande</button></div></div><div className="farmer-replica-kpis">{[[Tractor, '12', 'Demandes envoyées', 'Ce mois-ci', 'green'], [MessageCircle, '8', 'Messages non lus', 'Nouveaux messages', 'blue'], [WalletCards, '245 000', 'Total dépensé', 'FCFA · Ce mois-ci', 'purple'], [Star, '4.6 / 5', 'Ma note moyenne', 'Basée sur 18 avis', 'lime'], [Activity, '28°C', 'Météo à Cotonou', 'Ensoleillé', 'yellow']].map(([Icon, value, label, detail, tone]) => <button className="farmer-replica-kpi" key={label} onClick={() => notify(`${label} ouvert.`)}><span className={`farmer-replica-kpi-icon ${tone}`}><Icon size={18} /></span><div><strong>{value}</strong><b>{label}</b><small>{detail}</small></div>{label !== 'Météo à Cotonou' && <svg viewBox="0 0 80 20"><path d="M0 16 C14 14 18 5 29 13 S45 18 53 7 S67 10 80 3" /></svg>}</button>)}</div><div className="farmer-replica-main"><section className="farmer-replica-panel farmer-provider-panel"><header><div><h3><MapPin size={16} /> Trouver des prestataires proches de vous</h3><p>Géolocalisation intelligente</p></div><button onClick={() => navigate('/dashboard/agriculteur/rechercher')}>Voir sur la carte</button></header><div className="farmer-provider-content"><div className="farmer-replica-map"><span className="farmer-map-road road-a" /><span className="farmer-map-road road-b" /><span className="farmer-map-road road-c" /><b className="farmer-map-label label-cotonou">Cotonou</b><b className="farmer-map-label label-calavi">Abomey-Calavi</b><button className="farmer-map-pin map-pin-a">1</button><button className="farmer-map-pin map-pin-b">2</button><button className="farmer-map-pin map-pin-c">3</button><span className="farmer-current-location" /><button className="farmer-map-position" onClick={() => notify('Position centrée sur Cotonou.') }><MapPin size={13} /> Ma position</button></div><div className="farmer-provider-list"><header><b>Prestataires à proximité</b><button onClick={() => navigate('/dashboard/agriculteur/rechercher')}>Voir tout</button></header>{providers.map(([name, type, distance, rating, image]) => <button key={name} onClick={() => notify(`${name} ouvert.`)}><img src={`${ASSET}${image}`} alt="" /><span><b>{name}</b><small>{type}</small><em>★ {rating}</em></span><strong>{distance}</strong></button>)}</div></div><button className="farmer-provider-map-action" onClick={() => navigate('/dashboard/agriculteur/rechercher')}><MapPin size={14} /> Voir sur la carte</button></section><section className="farmer-replica-panel farmer-notification-panel"><header><h3><Bell size={16} /> Notifications récentes</h3><button onClick={() => navigate('/dashboard/agriculteur/notifications')}>Voir tout</button></header>{notifications.map(([title, detail, time, Icon, tone]) => <button key={title} onClick={() => notify(`${title} consulté.`)}><span className={`farmer-notification-icon ${tone}`}><Icon size={15} /></span><span><b>{title}</b><small>{detail}</small><em>{time}</em></span><i /></button>)}</section></div><section className="farmer-replica-panel farmer-actions-panel"><header><h3><Activity size={16} /> Actions rapides</h3></header><div>{[['Acheter une machine', Package, 'rechercher'], ['Louer un équipement', Tractor, 'rechercher'], ['Demander un devis', FileText, 'demandes'], ['Trouver un réparateur', Wrench, 'rechercher'], ['Payer', WalletCards, 'paiements'], ['Voir mes favoris', Star, 'favoris']].map(([label, Icon, target]) => <button key={label} onClick={() => navigate(`/dashboard/agriculteur/${target}`)}><span><Icon size={18} /></span><b>{label}</b><ArrowRight size={12} /></button>)}</div></section><section className="farmer-replica-panel farmer-requests-panel"><header><h3><ClipboardList size={16} /> Mes demandes récentes</h3><button onClick={() => navigate('/dashboard/agriculteur/demandes')}>Voir tout</button></header>{requests.map(([title, provider, status, date]) => <button key={title} onClick={() => navigate('/dashboard/agriculteur/demandes')}><span className="farmer-request-icon"><FileText size={14} /></span><span><b>{title}</b><small>{provider}</small></span><i>{status}</i><time>{date}</time></button>)}</section></div>; }
function ReferenceChart({ role, period, onPeriodChange }) { const chartPeriod = period || '30 jours'; const multiplier = chartPeriod === 'Cette semaine' ? 0.72 : chartPeriod === 'Cette année' ? 1.28 : 1; const source = role === 'administrateur' ? [42, 58, 49, 73, 66, 88, 76, 95] : [38, 55, 47, 70, 63, 84, 72, 91]; const values = source.map(value => Math.min(96, Math.round(value * multiplier))); const labels = chartPeriod === 'Cette semaine' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', 'Auj.'] : chartPeriod === 'Cette année' ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'] : ['04 Mai', '08 Mai', '12 Mai', '16 Mai', '20 Mai', '24 Mai', '28 Mai', '01 Juin']; return <div className="reference-chart"><div className="reference-chart-legend"><span><i /> {role === 'administrateur' ? 'Inscriptions' : 'Ventes'}</span><span><i className="blue" /> {role === 'administrateur' ? 'Annonces publiées' : 'Commandes'}</span><select value={chartPeriod} onChange={event => onPeriodChange?.(event.target.value)} aria-label="Période du graphique"><option>30 jours</option><option>Cette semaine</option><option>Cette année</option></select></div><div className="reference-chart-bars">{values.map((height, index) => <div key={index}><b style={{ height: `${height}%` }} /><i style={{ height: `${Math.max(24, height - 18)}%` }} /><small>{labels[index]}</small></div>)}</div><div className="reference-chart-summary"><b>{role === 'administrateur' ? '1 245' : '24 750 000 FCFA'}<small>Total · {chartPeriod}</small></b><b>+18.6%<small>Progression</small></b><b>{role === 'administrateur' ? '2 156' : '36'}<small>Transactions</small></b></div></div>; }
function ReferenceNotifications({ role }) { const rows = role === 'entreprise' ? [['Nouveau message', 'Koffi Agbodan vous a écrit.', 'Il y a 10 min', 'messagerie'], ['Nouvelle demande de devis', 'Une demande attend votre réponse.', 'Il y a 35 min', 'devis'], ['Nouvelle commande', 'Commande #CMD-2025-1456 reçue.', 'Il y a 1 h', 'commandes'], ['Nouvel avis client', 'Vous avez reçu une note de 5/5.', 'Hier', 'avis']] : role === 'maintenancier' ? [['Nouveau message', 'De MTN Bénin SARL', 'Il y a 10 min', 'messagerie'], ['Nouveau devis accepté', 'Par Jean Hounkpe', 'Il y a 30 min', 'devis'], ['Intervention planifiée', 'Demain à 09:00', 'Il y a 1 h', 'interventions'], ['Nouvel avis reçu', '★★★★★ (5.0)', 'Il y a 2 h', 'avis']] : role === 'administrateur' ? [['Validation requise', 'MTN Bénin SARL attend une validation.', 'Il y a 10 min', 'entreprises'], ['Nouveau signalement', 'Une annonce nécessite une modération.', 'Il y a 35 min', 'signalements'], ['Export terminé', 'Le rapport utilisateurs est disponible.', 'Il y a 1 h', 'rapports'], ['Sécurité système', 'Aucune anomalie détectée.', 'Hier', 'journaux']] : [['Nouveau message', 'Agri Services Bénin vous a écrit.', 'Il y a 10 min', 'messagerie'], ['Nouveau devis reçu', 'Mécano Pro SARL · 85 000 FCFA', 'Il y a 35 min', 'demandes'], ['Paiement confirmé', 'Votre paiement est confirmé.', 'Il y a 1 h', 'paiements'], ['Intervention planifiée', 'Demain à 09:00', 'Hier', 'demandes']]; const paths = { agriculteur: '/dashboard/agriculteur', entreprise: '/dashboard/entreprise', maintenancier: '/dashboard/maintenancier', administrateur: '/dashboard/administrateur' }; const navigate = useNavigate(); return <div className="reference-notifications">{rows.map(([title, text, time, destination], index) => <button key={title} onClick={() => navigate(`${paths[role]}/${destination}`)}><span><Bell size={15} /></span><div><b>{title}</b><small>{text}</small></div><time>{time}</time>{index < 2 && <i />}</button>)}</div>; }
function ReferenceActivity({ role }) { const navigate = useNavigate(); const rows = role === 'entreprise' ? [['#CMD-2025-1456', 'Koffi Agbodan', 'Tracteur MF 375', '8 500 000 FCFA', 'En attente'], ['#CMD-2025-1455', 'Jean Hounkpe', 'Motopompe Hyundai', '325 000 FCFA', 'Payée'], ['#CMD-2025-1454', 'Euloge Dossou', 'Engrais NPK', '45 000 FCFA', 'Expédiée']] : role === 'administrateur' ? [['Koffi Agbodan', 'Agriculteur', 'Actif', 'Cotonou'], ['MTN Bénin SARL', 'Entreprise', 'À valider', 'Cotonou'], ['Arsène Zannou', 'Maintenancier', 'Actif', 'Parakou']] : role === 'maintenancier' ? [['Réparation tracteur 5090', 'Koffi Agbodan', 'Calavi', 'Demain 09:00'], ['Entretien motoculteur F720', 'Ferme Sèmè', 'Godomey', 'Aujourd’hui 14:00'], ['Réparation pompe à eau', 'Jean Hounkpe', 'Hévié', 'Demain 09:30']] : [['Location tracteur 90 CV', 'Agri Services Bénin', 'En attente', 'Aujourd’hui'], ['Réparation moissonneuse', 'Mécano Pro SARL', 'Devis reçu', 'Hier'], ['Intervention irrigation', 'Farm Equipement', 'En cours', '12 juin']]; const destination = role === 'entreprise' ? 'commandes' : role === 'administrateur' ? 'utilisateurs' : role === 'maintenancier' ? 'interventions' : 'demandes'; return <div className="reference-activity">{rows.map(row => <button key={row[0]} onClick={() => navigate(`${paths[role]}/${destination}`)} aria-label={`Ouvrir ${row[0]}`}>{row.map((cell, index) => index === 0 ? <b key={cell}>{cell}</b> : index === row.length - 2 ? <span className="reference-status" key={cell}>{cell}</span> : <small key={cell}>{cell}</small>)}<ChevronRight size={14} /></button>)}</div>; }

export function ReferenceFarmerMessaging() {
  const [active, setActive] = React.useState('Mécano Pro SARL');
  const [message, setMessage] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [items, setItems] = React.useState([{ name: 'Mécano Pro SARL', text: 'Votre devis est prêt', time: '10 min', phone: '+22996442108', unread: true, messages: [{ direction: 'received', text: 'Bonjour Koffi, votre devis pour la moissonneuse est prêt. Je peux intervenir demain à 09:00.', time: '09:00' }, { direction: 'sent', text: 'Merci, je consulte le devis.', time: '09:05' }] }, { name: 'Agri Services Bénin', text: 'Merci pour votre commande', time: '35 min', phone: '+22997123456', unread: true, messages: [{ direction: 'received', text: 'Votre commande est confirmée.', time: '08:42' }] }, { name: 'Support AGRIMAC', text: 'Comment pouvons-nous vous aider ?', time: 'Hier', phone: '', unread: false, messages: [] }]);
  const menuRef = React.useRef(null);
  const current = items.find(item => item.name === active) || items[0];
  React.useEffect(() => { const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const call = () => current.phone ? window.location.assign(`tel:${current.phone}`) : notify(`Le numéro de ${active} n’est pas disponible.`, 'error');
  const sendMessage = () => { const text = message.trim(); if (!text) return notify('Écrivez un message avant de l’envoyer.'); setItems(list => list.map(item => item.name === active ? { ...item, text, unread: false, time: 'À l’instant', messages: [...(item.messages || []), { direction: 'sent', text, time: 'À l’instant' }] } : item)); setMessage(''); notify('Message envoyé.'); };
  const markRead = () => { setItems(list => list.map(item => item.name === active ? { ...item, unread: !item.unread } : item)); setMenuOpen(false); };
  const removeConversation = notice => { const next = items.find(item => item.name !== active); setItems(list => list.filter(item => item.name !== active)); setActive(next?.name || ''); setMenuOpen(false); notify(notice); };
  return <main className="reference-messaging-page"><section className="messaging-conversations reference-panel"><header><div><h3>Conversations</h3><p>Messages non lus en priorité.</p></div><button onClick={() => openAction({ type: 'form', icon: '?', title: 'Nouvelle conversation', description: 'écrivez à un prestataire AGRIMAC.', submitLabel: 'Envoyer', fields: [{ name: 'recipient', label: 'Destinataire', required: true }, { name: 'message', label: 'Message', multiline: true, required: true }] })} aria-label="Nouvelle conversation"><MessageCircle size={15} /></button></header><label className="reference-search"><Search size={14} /><input placeholder="Rechercher une conversation..." /></label><div className="reference-conversation-list">{items.map(item => <button className={active === item.name ? 'active' : ''} key={item.name} onClick={() => { setActive(item.name); setItems(list => list.map(value => value.name === item.name ? { ...value, unread: false } : value)); }}><span>{item.name[0]}</span><div><b>{item.name}</b><small>{item.text}</small></div><time>{item.time}</time>{item.unread && <i />}</button>)}</div></section>{current && <section className="reference-chat reference-panel"><header><div><span className="reference-chat-avatar">{active[0]}</span><div><h3>{active}</h3><p>Conversation sécurisée · Intervention associée</p></div></div><div className="reference-chat-actions" ref={menuRef}><button onClick={call} aria-label="Appeler"><Phone size={15} /></button><button onClick={() => openAction({ type: 'detail', icon: '?', title: 'Devis associé · DEV-089', description: 'Devis lié à la réparation de la moissonneuse.', fields: [{ label: 'Prestataire', value: active }, { label: 'Montant', value: '85 000 FCFA' }, { label: 'Statut', value: 'En attente' }] })} aria-label="Ouvrir le devis"><FileText size={15} /></button><button onClick={() => setMenuOpen(value => !value)} aria-label="Ouvrir les options"><MoreHorizontal size={15} /></button>{menuOpen && <div className="reference-message-menu"><button onClick={() => { setMenuOpen(false); openAction({ type: 'detail', icon: '?', title: `Profil · ${active}`, description: 'Informations du contact sélectionné.', fields: [{ label: 'Prestataire', value: active }, { label: 'T·l·phone', value: current.phone || 'Non disponible' }, { label: 'Statut', value: 'Contact AGRIMAC' }] }); }}>Voir le profil</button><button onClick={markRead}>Marquer comme {current.unread ? 'lu' : 'non lu'}</button><button onClick={() => removeConversation('Conversation archivée.')}>Archiver</button><button className="danger" onClick={() => removeConversation('Conversation supprimée.')}>Supprimer</button></div>}</div></header><div className="reference-chat-context"><Tractor size={16} /><span><b>Réparation Moissonneuse</b><small>Mécano Pro SARL · Devis reçu · 85 000 FCFA</small></span><button onClick={() => openAction({ type: 'detail', icon: '?', title: 'Réparation Moissonneuse', description: 'Demande associée · cette conversation.', fields: [{ label: 'Prestataire', value: 'Mécano Pro SARL' }, { label: 'Statut', value: 'Devis reçu' }, { label: 'Montant', value: '85 000 FCFA' }] })}>Voir la demande <ChevronRight size={14} /></button></div><div className="reference-chat-messages"><p>Bonjour Koffi, votre devis pour la moissonneuse est prêt. Je peux intervenir demain · 09:00.</p><p className="mine">Merci, je consulte le devis.</p></div><div className="reference-chat-composer"><input value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => event.key === 'Enter' && sendMessage()} placeholder="·crire un message..." /><button onClick={sendMessage} aria-label="Envoyer le message"><Send size={15} /></button></div></section>}</main>;
}
