import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CircleAlert, ChevronLeft, ChevronRight, LoaderCircle, MapPin, RefreshCw } from 'lucide-react';
import { resources } from './api/resources';
import './maintainer-calendar-connected.css';

function safeText(value, fallback = '') { return typeof value === 'string' ? value : value == null ? fallback : String(value); }
function dateOf(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
function weekDays(reference) { const start = new Date(reference); const day = start.getDay(); const mondayOffset = day === 0 ? -6 : 1 - day; start.setDate(start.getDate() + mondayOffset); return Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; }); }

export function MaintainerCalendarConnected() {
  const [items, setItems] = useState([]);
  const [reference, setReference] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const days = useMemo(() => weekDays(reference), [reference]);
  const load = async () => { setLoading(true); setError(''); try { const data = await resources.maintainer.interventions(); setItems(Array.isArray(data) ? data : data?.items || []); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de charger le calendrier.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const selectedItems = items.filter(item => { const date = dateOf(item.scheduledAt); return date && date.toDateString() === selectedDate.toDateString(); });
  const monthLabel = reference.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  if (loading) return <CalendarState label="Chargement du calendrier réel..." />;
  if (error) return <CalendarState label={error} error onRetry={load} />;
  return <main className="feature-page maintainer-action-page maintainer-calendar-connected"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Calendrier</h2><p>Les interventions planifiées depuis votre compte.</p></div><button className="feature-secondary" onClick={load}><RefreshCw size={13} /> Actualiser</button></div><section className="feature-panel"><header className="calendar-connected-header"><div><h3><CalendarDays size={17} /> {monthLabel}</h3><p>{items.length ? `${items.length} intervention(s) réelle(s).` : 'Aucune intervention enregistrée.'}</p></div><div className="calendar-month-actions"><button onClick={() => setReference(value => new Date(value.getFullYear(), value.getMonth() - 1, 1))} aria-label="Mois précédent"><ChevronLeft size={15} /></button><button onClick={() => setReference(value => new Date(value.getFullYear(), value.getMonth() + 1, 1))} aria-label="Mois suivant"><ChevronRight size={15} /></button></div></header><div className="calendar-connected-days">{days.map(day => <button className={day.toDateString() === selectedDate.toDateString() ? 'active' : ''} key={day.toISOString()} onClick={() => setSelectedDate(day)}><b>{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</b><strong>{day.getDate()}</strong><small>{items.some(item => dateOf(item.scheduledAt)?.toDateString() === day.toDateString()) ? 'Mission' : 'Vide'}</small></button>)}</div><div className="calendar-connected-events">{selectedItems.length ? selectedItems.map(item => <article key={item.id}><time>{dateOf(item.scheduledAt)?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || '--:--'}</time><div><b>{safeText(item.title, 'Intervention sans titre')}</b><small><MapPin size={11} /> {safeText(item.location, 'Lieu non renseigné')}</small></div><span>{safeText(item.status, 'Statut indisponible')}</span></article>) : <div className="calendar-empty"><CalendarDays size={25} /><b>{items.length ? 'Aucune intervention ce jour' : 'Calendrier vide'}</b><small>{items.length ? 'Sélectionnez un autre jour pour consulter vos interventions.' : 'Aucun endpoint de création d’événement calendrier n’est disponible. Les interventions apparaîtront ici lorsqu’elles seront planifiées via leur module.'}</small></div>}</div></section></main>;
}
function CalendarState({ label, error = false, onRetry }) { return <main className="feature-page maintainer-action-page maintainer-calendar-connected"><div className={`calendar-state ${error ? 'error' : ''}`}><CircleAlert size={22} />{label}{onRetry && <button className="feature-secondary" onClick={onRetry}>Réessayer</button>}{!error && <LoaderCircle size={20} className="calendar-spin" />}</div></main>; }
