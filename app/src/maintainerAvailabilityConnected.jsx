import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, CircleAlert, Clock3, Edit3, LoaderCircle, MapPin, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { RealAgrimacMap } from './RealAgrimacMap';
import { resources } from './api/resources';
import { notify } from './ui';
import './maintainer-availability-connected.css';

const DAYS = [
  { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' }, { value: 5, label: 'Ven' }, { value: 6, label: 'Sam' }, { value: 0, label: 'Dim' },
];
const DEFAULT_START = '08:00';
const DEFAULT_END = '17:00';

function rows(data) { return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []; }
function safeText(value, fallback = '') { return typeof value === 'string' ? value : value == null ? fallback : String(value); }
function safeNumber(value, fallback = 0) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
function statusLabel(status) { return status === 'AVAILABLE' ? 'Disponible' : status === 'UNAVAILABLE' ? 'Indisponible' : 'Non configuré'; }
function dayLabel(day) { return DAYS.find(item => item.value === day)?.label || `Jour ${day}`; }
function validTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }

export function MaintainerAvailabilityConnected() {
  const [zones, setZones] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoneModal, setZoneModal] = useState(null);
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingDay, setSavingDay] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [mapNotice, setMapNotice] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [zoneData, availabilityData] = await Promise.all([resources.maintainer.zones(), resources.maintainer.availability()]);
      setZones(rows(zoneData));
      setAvailability(rows(availabilityData));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Impossible de charger les zones et disponibilités.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredZones = useMemo(() => zones.filter(zone => `${safeText(zone.name)} ${safeText(zone.city)} ${safeText(zone.region)}`.toLowerCase().includes(query.toLowerCase())), [zones, query]);
  const activeZones = zones.filter(zone => zone.active === true);
  const maxRadius = zones.reduce((max, zone) => Math.max(max, safeNumber(zone.radiusKm)), 0);

  const openCreateZone = () => setZoneModal({ mode: 'create', form: { name: '', city: '', region: '', radiusKm: '15', active: true } });
  const openEditZone = zone => setZoneModal({ mode: 'edit', zoneId: zone.id, form: { name: safeText(zone.name), city: safeText(zone.city), region: safeText(zone.region), radiusKm: String(safeNumber(zone.radiusKm, 15)), active: zone.active !== false } });
  const saveZone = async event => {
    event.preventDefault();
    const form = zoneModal.form;
    const name = form.name.trim();
    const radiusKm = Number(form.radiusKm);
    if (!name) return notify('Le nom de la zone est obligatoire.', 'error');
    if (!Number.isInteger(radiusKm) || radiusKm < 1 || radiusKm > 200) return notify('Le rayon doit être un nombre entier entre 1 et 200 km.', 'error');
    const duplicate = zones.some(zone => zone.id !== zoneModal.zoneId && safeText(zone.name).trim().toLowerCase() === name.toLowerCase() && safeText(zone.city).trim().toLowerCase() === form.city.trim().toLowerCase());
    if (duplicate) return notify('Cette zone existe déjà pour cette ville.', 'error');
    const body = { name, city: form.city.trim() || undefined, region: form.region.trim() || undefined, radiusKm, active: Boolean(form.active) };
    setSaving(true);
    try {
      const saved = zoneModal.mode === 'create' ? await resources.maintainer.createZone(body) : await resources.maintainer.updateZone(zoneModal.zoneId, body);
      setZones(current => zoneModal.mode === 'create' ? [saved, ...current] : current.map(zone => zone.id === saved.id ? saved : zone));
      setZoneModal(null);
      notify(zoneModal.mode === 'create' ? 'Zone ajoutée.' : 'Zone modifiée.');
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'La zone n’a pas pu être enregistrée.', 'error'); } finally { setSaving(false); }
  };

  const removeZone = async zone => {
    if (!window.confirm(`Supprimer la zone « ${safeText(zone.name, 'cette zone')} » ?`)) return;
    setDeletingId(zone.id);
    try {
      await resources.maintainer.deleteZone(zone.id);
      setZones(current => current.filter(item => item.id !== zone.id));
      notify('Zone supprimée.');
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'La zone n’a pas pu être supprimée.', 'error'); } finally { setDeletingId(null); }
  };

  const availabilityFor = day => availability.find(item => item.dayOfWeek === day);
  const openAvailability = day => {
    const current = availabilityFor(day);
    setAvailabilityModal({ day, form: { startTime: safeText(current?.startTime, DEFAULT_START), endTime: safeText(current?.endTime, DEFAULT_END), status: current?.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE' } });
  };
  const saveAvailability = async event => {
    event.preventDefault();
    const form = availabilityModal.form;
    if (!validTime(form.startTime) || !validTime(form.endTime)) return notify('Saisissez des horaires au format HH:MM.', 'error');
    if (form.startTime >= form.endTime) return notify('L’heure de fin doit être postérieure à l’heure de début.', 'error');
    setSaving(true);
    try {
      const saved = await resources.maintainer.updateAvailability({ dayOfWeek: availabilityModal.day, startTime: form.startTime, endTime: form.endTime, status: form.status });
      setAvailability(current => [...current.filter(item => item.dayOfWeek !== saved.dayOfWeek), saved].sort((a, b) => safeNumber(a.dayOfWeek) - safeNumber(b.dayOfWeek)));
      setAvailabilityModal(null);
      notify(`Disponibilité du ${dayLabel(saved.dayOfWeek)} enregistrée.`);
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'La disponibilité n’a pas pu être enregistrée.', 'error'); } finally { setSaving(false); }
  };

  const toggleAvailability = async day => {
    const current = availabilityFor(day);
    const nextStatus = current?.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    const startTime = safeText(current?.startTime, DEFAULT_START);
    const endTime = safeText(current?.endTime, DEFAULT_END);
    setSavingDay(day);
    try {
      const saved = await resources.maintainer.updateAvailability({ dayOfWeek: day, startTime, endTime, status: nextStatus });
      setAvailability(items => [...items.filter(item => item.dayOfWeek !== day), saved].sort((a, b) => safeNumber(a.dayOfWeek) - safeNumber(b.dayOfWeek)));
      notify(`${dayLabel(day)} : ${statusLabel(saved.status)}.`);
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'La disponibilité n’a pas pu être modifiée.', 'error'); } finally { setSavingDay(null); }
  };

  if (loading) return <AvailabilityState label="Chargement des zones et disponibilités..." />;
  if (error) return <AvailabilityError message={error} onRetry={load} />;

  return <main className="feature-page maintainer-action-page availability-connected-page">
    <div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Disponibilités &amp; Zones</h2><p>Gérez vos zones d’intervention et configurez vos horaires.</p></div><div className="availability-heading-actions"><button className="feature-secondary" onClick={() => { setQuery(''); load(); }} disabled={loading}><RefreshCw size={13} /> Actualiser</button><button className="feature-primary" onClick={openCreateZone}><Plus size={14} /> Ajouter une zone</button></div></div>
    <div className="availability-top-grid"><section className="feature-panel availability-map-panel"><header><div><h3><MapPin size={17} /> Zones actives</h3><p>{activeZones.length} zone(s) active(s) enregistrée(s).</p></div><span className="feature-status">{activeZones.length ? 'Données backend' : 'Aucune zone'}</span></header><div className="availability-map-wrap"><RealAgrimacMap className="availability-real-map" /><div className="availability-map-notice"><CircleAlert size={13} /><span>{mapNotice ? 'Les zones backend ne contiennent pas de coordonnées géographiques.' : 'La carte AGRIMAC est disponible. Les zones ne possèdent pas encore de coordonnées GPS.'}</span><button onClick={() => setMapNotice(value => !value)}>{mapNotice ? 'Masquer' : 'Détails'}</button></div></div><div className="availability-stats"><AvailabilityStat label="Zones actives" value={String(activeZones.length)} /><AvailabilityStat label="Rayon maximal" value={maxRadius ? `${maxRadius} km` : 'Non disponible'} /><AvailabilityStat label="Coordonnées GPS" value="Non disponibles" /></div></section>
      <div className="availability-side"><section className="feature-panel availability-schedule-panel"><header><div><h3><CalendarDays size={17} /> Horaires de disponibilité</h3><p>Chaque modification est enregistrée immédiatement.</p></div><button className="availability-icon-button" onClick={() => openAvailability(1)} aria-label="Modifier les disponibilités"><Edit3 size={16} /></button></header><div className="availability-schedule-list">{DAYS.map(day => { const item = availabilityFor(day.value); const available = item?.status === 'AVAILABLE'; return <div className={`availability-day-row ${!item ? 'not-configured' : ''}`} key={day.value}><b>{day.label}</b><button className="availability-time" onClick={() => openAvailability(day.value)}>{item ? `${safeText(item.startTime, '--:--')} - ${safeText(item.endTime, '--:--')}` : 'Non configuré'}</button><button className={`availability-switch ${available ? 'on' : ''}`} onClick={() => toggleAvailability(day.value)} disabled={savingDay === day.value} aria-pressed={available} aria-label={`${day.label} : ${statusLabel(item?.status)}`}>{savingDay === day.value ? <LoaderCircle size={12} className="availability-spin" /> : <span />}</button></div>; })}</div></section><section className="availability-vehicle-card"><div><span className="availability-vehicle-icon"><Clock3 size={17} /></span><b>Véhicule actuel</b><small>Aucune donnée de flotte disponible.</small><strong>Endpoint manquant</strong></div><button onClick={() => notify('ACTION : gérer la flotte. ENDPOINT MANQUANT : véhicule maintenancier. DONNÉES NÉCESSAIRES : véhicule assigné. RAISON : aucun module flotte disponible.', 'error')}>Gérer la flotte <RefreshCw size={14} /></button></section></div></div>
    <section className="feature-panel availability-zones-panel"><header><div><h3>Détails des zones d’intervention</h3><p>Les communes couvertes par votre compte maintenancier.</p></div><div className="availability-zone-tools"><label><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une zone..." /></label><button className="feature-secondary" onClick={openCreateZone}><Plus size={13} /> Ajouter</button></div></header>{filteredZones.length ? <div className="availability-zone-table"><div className="availability-zone-table-head"><span>Localité</span><span>Statut</span><span>Rayon</span><span>Actions</span></div>{filteredZones.map(zone => <div className={`availability-zone-row ${zone.active === false ? 'inactive' : ''}`} key={zone.id}><div className="availability-zone-name"><span><MapPin size={15} /></span><div><b>{safeText(zone.name, 'Zone sans nom')}</b><small>{safeText(zone.city) || 'Ville non renseignée'}{zone.region ? ` · ${zone.region}` : ''}</small></div></div><span className={`availability-badge ${zone.active === false ? 'muted' : ''}`}>{zone.active === false ? 'Inactive' : 'Active'}</span><span className="availability-radius">{safeNumber(zone.radiusKm) ? `${safeNumber(zone.radiusKm)} km` : 'Non disponible'}</span><div className="availability-row-actions"><button onClick={() => openEditZone(zone)} aria-label={`Modifier ${safeText(zone.name, 'la zone')}`}><Edit3 size={15} /></button><button className="danger" onClick={() => removeZone(zone)} disabled={deletingId === zone.id} aria-label={`Supprimer ${safeText(zone.name, 'la zone')}`}>{deletingId === zone.id ? <LoaderCircle size={15} className="availability-spin" /> : <Trash2 size={15} />}</button></div></div>)}</div> : <div className="availability-empty"><MapPin size={23} /><b>{query ? 'Aucune zone correspondante' : 'Aucune zone enregistrée'}</b><small>{query ? 'Modifiez votre recherche.' : 'Ajoutez votre première zone d’intervention.'}</small>{query ? <button onClick={() => setQuery('')}>Réinitialiser la recherche</button> : <button onClick={openCreateZone}>Ajouter une zone</button>}</div>}</section>
    {zoneModal && <ZoneModal modal={zoneModal} saving={saving} onChange={form => setZoneModal(current => ({ ...current, form }))} onClose={() => setZoneModal(null)} onSubmit={saveZone} />}
    {availabilityModal && <AvailabilityModal modal={availabilityModal} saving={saving} onChange={form => setAvailabilityModal(current => ({ ...current, form }))} onClose={() => setAvailabilityModal(null)} onSubmit={saveAvailability} />}
  </main>;
}

function AvailabilityStat({ label, value }) { return <div><small>{label}</small><b>{value}</b></div>; }
function ZoneModal({ modal, saving, onChange, onClose, onSubmit }) { const update = patch => onChange({ ...modal.form, ...patch }); return <Modal title={modal.mode === 'create' ? 'Ajouter une zone' : 'Modifier la zone'} onClose={onClose}><form onSubmit={onSubmit} className="availability-modal-form"><Field label="Nom de la zone" required><input value={modal.form.name} onChange={event => update({ name: event.target.value })} maxLength={120} required autoFocus /></Field><div className="availability-modal-grid"><Field label="Ville"><input value={modal.form.city} onChange={event => update({ city: event.target.value })} maxLength={120} /></Field><Field label="Région"><input value={modal.form.region} onChange={event => update({ region: event.target.value })} maxLength={120} /></Field></div><Field label="Rayon d’intervention (km)" required><input type="number" min="1" max="200" step="1" value={modal.form.radiusKm} onChange={event => update({ radiusKm: event.target.value })} required /></Field><label className="availability-checkbox"><input type="checkbox" checked={modal.form.active} onChange={event => update({ active: event.target.checked })} /> Zone active</label><ModalActions saving={saving} onClose={onClose} submitLabel={modal.mode === 'create' ? 'Ajouter la zone' : 'Enregistrer'} /></form></Modal>; }
function AvailabilityModal({ modal, saving, onChange, onClose, onSubmit }) { const update = patch => onChange({ ...modal.form, ...patch }); return <Modal title={`Disponibilités du ${dayLabel(modal.day)}`} onClose={onClose}><form onSubmit={onSubmit} className="availability-modal-form"><div className="availability-modal-grid"><Field label="Début" required><input type="time" value={modal.form.startTime} onChange={event => update({ startTime: event.target.value })} required /></Field><Field label="Fin" required><input type="time" value={modal.form.endTime} onChange={event => update({ endTime: event.target.value })} required /></Field></div><label className="availability-checkbox"><input type="checkbox" checked={modal.form.status === 'AVAILABLE'} onChange={event => update({ status: event.target.checked ? 'AVAILABLE' : 'UNAVAILABLE' })} /> Disponible ce jour</label><p className="availability-modal-help">Le créneau est sauvegardé avec le statut sélectionné dans le backend.</p><ModalActions saving={saving} onClose={onClose} submitLabel="Enregistrer" /></form></Modal>; }
function Field({ label, required, children }) { return <label className="availability-field"><span>{label}{required && <i>*</i>}</span>{children}</label>; }
function Modal({ title, onClose, children }) { return <div className="availability-modal-backdrop" role="dialog" aria-modal="true" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="availability-modal"><header><div><span className="reference-overline">MAINTENANCIER</span><h3>{title}</h3></div><button type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></button></header>{children}</section></div>; }
function ModalActions({ saving, onClose, submitLabel }) { return <div className="availability-modal-actions"><button type="button" className="feature-secondary" onClick={onClose}>Annuler</button><button type="submit" className="feature-primary" disabled={saving}>{saving ? <><LoaderCircle size={14} className="availability-spin" /> Enregistrement...</> : <><Check size={14} /> {submitLabel}</>}</button></div>; }
function AvailabilityState({ label }) { return <main className="feature-page maintainer-action-page availability-connected-page"><div className="availability-state"><LoaderCircle size={22} className="availability-spin" />{label}</div></main>; }
function AvailabilityError({ message, onRetry }) { return <main className="feature-page maintainer-action-page availability-connected-page"><div className="availability-state availability-error"><CircleAlert size={24} /><b>Zones et disponibilités indisponibles</b><small>{message}</small><button className="feature-secondary" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button></div></main>; }
