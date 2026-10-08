import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCircle2, ChevronRight, LockKeyhole, MapPin, PenLine, Settings2, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from './api/client';
import { notify } from './ui';
import './maintainer-account-connected.css';

const EMPTY_PROFILE = { displayName: '', phone: '', email: '', city: '', region: '', skills: '' };
const EMPTY_PREFERENCES = { language: 'Français', displayMode: 'Simplifié', pushEnabled: true, emailEnabled: false, profilePublic: true, urgentEnabled: true };

function text(value) { return typeof value === 'string' ? value : value == null ? '' : String(value); }
function initials(value) { return text(value).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'M'; }
function errorMessage(reason) { return reason instanceof Error ? reason.message : 'Une erreur API est survenue.'; }

export function MaintainerAccountConnected({ section }) {
  return section === 'profil' ? <ConnectedProfile /> : <ConnectedSettings />;
}

function ConnectedProfile() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photoNotice, setPhotoNotice] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [user, technician] = await Promise.all([api.get('/users/me'), api.get('/maintainers/me/profile')]);
      if (!user?.roles?.includes('MAINTENANCIER')) throw new Error('Le compte connecté n’est pas un compte maintenancier.');
      const next = { displayName: text(technician?.displayName), phone: text(user.phone), email: text(user.email), city: text(technician?.city), region: text(technician?.region), skills: text(technician?.skills) };
      setProfile(next);
      setDraft(next);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const save = async event => {
    event?.preventDefault();
    if (!draft.displayName.trim()) { notify('Le nom professionnel est obligatoire.', 'error'); return; }
    setSaving(true);
    try {
      const saved = await api.patch('/maintainers/me/profile', { displayName: draft.displayName.trim(), city: draft.city.trim(), region: draft.region.trim(), skills: draft.skills.trim() });
      const next = { ...draft, displayName: text(saved?.displayName) || draft.displayName.trim(), city: text(saved?.city), region: text(saved?.region), skills: text(saved?.skills) };
      setProfile(next); setDraft(next); notify('Profil maintenancier enregistré.');
    } catch (reason) { notify(errorMessage(reason), 'error'); } finally { setSaving(false); }
  };

  if (loading) return <AccountState label="Chargement du profil maintenancier..." />;
  if (error) return <AccountError title="Profil indisponible" message={error} onRetry={load} />;
  return <main className="premium-page connected-account-page">
    <div className="premium-page-heading connected-profile-heading"><div className="connected-profile-identity"><div className="connected-avatar" aria-hidden="true">{initials(profile?.displayName)}</div><div><span className="premium-eyebrow">MAINTENANCIER</span><h2>{text(profile?.displayName) || 'Profil maintenancier'}</h2><span className="connected-badge"><CheckCircle2 size={13} /> Compte maintenancier</span></div></div><button className="premium-button primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement...' : <><Check size={14} /> Enregistrer les modifications</>}</button></div>
    <form onSubmit={save} className="connected-profile-layout">
      <section className="premium-section connected-personal-card"><header className="premium-section-head"><div><h3><UserRound size={17} /> Informations personnelles</h3><p>Les informations professionnelles de votre compte connecté.</p></div></header><div className="connected-form-grid"><ConnectedField label="Nom professionnel" required><input value={draft.displayName} onChange={event => update('displayName', event.target.value)} maxLength={180} required /></ConnectedField><ConnectedField label="Téléphone"><div className="connected-readonly-field"><span>+229</span><input value={text(draft.phone).replace(/^\+229\s?/, '')} readOnly aria-describedby="phone-help" /></div><small id="phone-help" className="connected-help">Le téléphone est vérifié et ne peut pas être modifié ici.</small></ConnectedField><ConnectedField label="E-mail"><input type="email" value={draft.email} readOnly /></ConnectedField><ConnectedField label="Compétences métier" className="span-two"><textarea value={draft.skills} onChange={event => update('skills', event.target.value)} placeholder="Décrivez vos compétences" /></ConnectedField></div><div className="connected-photo-row"><div className="connected-avatar small" aria-hidden="true">{initials(profile?.displayName)}</div><div><b>Photo de profil</b><small>{photoNotice ? 'Photo non modifiable : aucun champ avatar ni association média n’existe dans le backend.' : 'Aucune photo enregistrée dans le compte.'}</small></div><button type="button" className="premium-button secondary" onClick={() => setPhotoNotice(true)}><PenLine size={13} /> Modifier la photo</button></div></section>
      <div className="connected-profile-side"><section className="premium-section connected-location-card"><header className="premium-section-head"><div><h3><MapPin size={17} /> Localisation</h3><p>Zone de rattachement du profil.</p></div></header><div className="connected-form-stack"><ConnectedField label="Ville"><input value={draft.city} onChange={event => update('city', event.target.value)} maxLength={120} /></ConnectedField><ConnectedField label="Région"><input value={draft.region} onChange={event => update('region', event.target.value)} maxLength={120} /></ConnectedField></div></section><section className="premium-section connected-capability-card"><header className="premium-section-head"><div><h3><Settings2 size={17} /> Compétences</h3><p>Les compétences affichées aux clients.</p></div></header><p className="connected-copy">{text(draft.skills) || 'Aucune compétence renseignée.'}</p><span className="connected-note">Les zones et disponibilités sont gérées dans leur module dédié.</span></section></div>
    </form>
  </main>;
}

function ConnectedSettings() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const load = async () => { setLoading(true); setError(''); try { const data = await api.get('/users/me/preferences'); setPreferences({ ...EMPTY_PREFERENCES, ...data }); } catch (reason) { setError(errorMessage(reason)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const payload = value => ({ language: value.language, displayMode: value.displayMode, pushEnabled: Boolean(value.pushEnabled), emailEnabled: Boolean(value.emailEnabled), profilePublic: Boolean(value.profilePublic), urgentEnabled: Boolean(value.urgentEnabled) });
  const save = async () => { setSaving(true); try { const saved = await api.patch('/users/me/preferences', payload(preferences)); setPreferences({ ...EMPTY_PREFERENCES, ...saved }); notify('Paramètres maintenancier enregistrés.'); } catch (reason) { notify(errorMessage(reason), 'error'); } finally { setSaving(false); } };
  const change = async (key, value) => { const previous = preferences; setPreferences(current => ({ ...current, [key]: value })); setSavingKey(key); try { const saved = await api.patch('/users/me/preferences', { [key]: value }); setPreferences(current => ({ ...current, ...saved })); } catch (reason) { setPreferences(previous); notify(errorMessage(reason), 'error'); } finally { setSavingKey(''); } };
  if (loading) return <AccountState label="Chargement des paramètres..." />;
  if (error) return <AccountError title="Paramètres indisponibles" message={error} onRetry={load} />;
  return <main className="premium-page connected-account-page"><div className="premium-page-heading"><div><span className="premium-eyebrow">MAINTENANCIER</span><h2>Paramètres</h2><p>Configurez les préférences persistées de votre compte AGRIMAC.</p></div><button className="premium-button primary" onClick={save} disabled={saving || Boolean(savingKey)}>{saving ? 'Enregistrement...' : <><Check size={14} /> Enregistrer</>}</button></div>
    <section className="connected-settings-section"><h3 className="connected-section-title"><ShieldCheck size={18} /> Compte et sécurité</h3><div className="connected-security-grid"><SecurityCard icon={<UserRound size={18} />} title="Informations personnelles" detail="Gérez votre nom professionnel, votre téléphone et votre adresse e-mail." action="Modifier" onClick={() => navigate('/dashboard/maintenancier/profil')} /><SecurityCard icon={<LockKeyhole size={18} />} title="Mot de passe & authentification" detail="Réinitialisez votre mot de passe via le parcours sécurisé avec vérification OTP. La 2FA n’est pas disponible." action="Réinitialiser via OTP" onClick={() => navigate('/mot-de-passe-oublie')} /></div></section>
    <section className="connected-settings-section"><h3 className="connected-section-title"><SlidersHorizontal size={18} /> Préférences & affichage</h3><div className="premium-section connected-preferences-card"><PreferenceSelect label="Langue de l’interface" detail="Langue principale de votre tableau de bord et de vos communications." value={preferences.language} options={['Français', 'Fon', 'English']} disabled={Boolean(savingKey)} onChange={value => change('language', value)} /><PreferenceSelect label="Mode d’utilisation" detail="Basculez entre le mode simplifié et le mode avancé." value={preferences.displayMode} options={['Simplifié', 'Avancé']} disabled={Boolean(savingKey)} onChange={value => change('displayMode', value)} segmented /></div></section>
    <div className="connected-settings-lower"><section><h3 className="connected-section-title"><Bell size={18} /> Notifications</h3><div className="premium-section connected-notifications-card"><PreferenceToggle label="Notifications push" detail="Alertes immédiates sur cet appareil." value={preferences.pushEnabled} busy={savingKey === 'pushEnabled'} onChange={value => change('pushEnabled', value)} /><PreferenceToggle label="Notifications par e-mail" detail="Rapports et alertes importantes par courriel." value={preferences.emailEnabled} busy={savingKey === 'emailEnabled'} onChange={value => change('emailEnabled', value)} /><PreferenceToggle label="Demandes urgentes" detail="Nouvelles demandes de réparation dans vos zones." value={preferences.urgentEnabled} busy={savingKey === 'urgentEnabled'} onChange={value => change('urgentEnabled', value)} /></div></section><section><h3 className="connected-section-title"><ShieldCheck size={18} /> Confidentialité</h3><div className="premium-section connected-privacy-card"><p>Contrôlez la visibilité de votre profil maintenancier auprès des clients AGRIMAC.</p><PreferenceToggle label="Profil public visible" detail="Ce réglage est persisté par le backend." value={preferences.profilePublic} busy={savingKey === 'profilePublic'} onChange={value => change('profilePublic', value)} /><button type="button" className="premium-button secondary connected-wide-action" onClick={() => setPrivacyOpen(value => !value)}>{privacyOpen ? 'Fermer les autorisations' : 'Gérer les autorisations'} <ChevronRight size={14} /></button>{privacyOpen && <div className="connected-permission-note">Le partage de données agronomiques n’est pas un paramètre maintenancier exposé par l’API. Il reste inchangé.</div>}</div></section></div>
  </main>;
}

function ConnectedField({ label, required = false, className = '', children }) { return <label className={`connected-field ${className}`}><span>{label}{required && <i>*</i>}</span>{children}</label>; }
function SecurityCard({ icon, title, detail, action, onClick }) { return <article className="connected-security-card"><span className="connected-security-icon">{icon}</span><h4>{title}</h4><p>{detail}</p><button type="button" onClick={onClick}>{action}</button></article>; }
function PreferenceSelect({ label, detail, value, options, onChange, disabled, segmented = false }) { return <div className="connected-preference-row"><div><b>{label}</b><small>{detail}</small></div>{segmented ? <div className="connected-segmented">{options.map(option => <button type="button" className={value === option ? 'active' : ''} key={option} onClick={() => onChange(option)} disabled={disabled}>{option}</button>)}</div> : <select value={value} onChange={event => onChange(event.target.value)} disabled={disabled}>{options.map(option => <option key={option}>{option}</option>)}</select>}</div>; }
function PreferenceToggle({ label, detail, value, onChange, busy }) { return <div className="connected-preference-row connected-toggle-row"><div><b>{label}</b><small>{detail}</small></div><button type="button" className={`connected-switch ${value ? 'on' : ''}`} onClick={() => onChange(!value)} disabled={busy} aria-pressed={value} aria-label={`${label} : ${value ? 'activé' : 'désactivé'}`}><span /></button></div>; }
function AccountState({ label }) { return <main className="premium-page connected-account-page"><div className="connected-state"><span className="connected-loader" />{label}</div></main>; }
function AccountError({ title, message, onRetry }) { return <main className="premium-page connected-account-page"><div className="connected-state connected-error"><b>{title}</b><small>{message}</small><button className="premium-button secondary" onClick={onRetry}>Réessayer</button></div></main>; }
