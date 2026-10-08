import React, { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, Clock3, FileText, LoaderCircle, RefreshCw, Star, Wrench } from 'lucide-react';
import { resources } from './api/resources';
import './maintainer-stats-connected.css';

export function MaintainerStatsConnected() {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setStats(await resources.maintainer.statistics()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de charger les statistiques.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <StatsState label="Chargement des statistiques réelles..." />;
  if (error) return <StatsState label={error} error onRetry={load} />;
  const value = (number, suffix = '') => Number.isFinite(Number(number)) ? `${Number(number).toLocaleString('fr-FR')}${suffix}` : '—';
  return <main className="feature-page maintainer-action-page maintainer-stats-connected"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Mes statistiques</h2><p>Indicateurs agrégés réellement disponibles pour votre compte.</p></div><button className="feature-secondary" disabled title="Aucun endpoint d’export statistique n’est disponible">Export indisponible</button></div><div className="maintainer-stats-grid"><Stat icon={<Wrench size={18} />} label="Interventions" value={value(stats.interventions)} detail="Total retourné par l’API" /><Stat icon={<CheckCircle2 size={18} />} label="Terminées" value={value(stats.completed)} detail="Historique confirmé" /><Stat icon={<FileText size={18} />} label="Devis envoyés" value={value(stats.quotes)} detail="Total retourné par l’API" /><Stat icon={<Star size={18} />} label="Satisfaction" value={value(stats.satisfaction, ' / 5')} detail={`${value(stats.reviewCount)} avis reçus`} /><Stat icon={<BarChart3 size={18} />} label="Revenus terminés" value={value(stats.revenueXof, ' FCFA')} detail="Somme backend" /></div><section className="feature-panel stats-no-series"><header><div><h3><CalendarDays size={17} /> Évolution temporelle</h3><p>Aucune série temporelle n’est fournie par l’API actuelle.</p></div></header><div><Clock3 size={25} /><b>Historique graphique indisponible</b><small>Les points du graphique ne sont pas inventés. Utilisez les indicateurs agrégés ci-dessus.</small></div></section></main>;
}
function Stat({ icon, label, value, detail }) { return <article className="maintainer-stat-card"><span>{icon}</span><small>{label}</small><strong>{value}</strong><p>{detail}</p></article>; }
function StatsState({ label, error = false, onRetry }) { return <main className="feature-page maintainer-action-page maintainer-stats-connected"><div className={`stats-state ${error ? 'error' : ''}`}>{error ? <AlertCircle size={24} /> : <LoaderCircle size={22} className="stats-spin" />}<b>{label}</b>{onRetry && <button className="feature-secondary" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button>}</div></main>; }
