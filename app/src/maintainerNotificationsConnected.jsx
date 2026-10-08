import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, FileText, LoaderCircle, MessageCircle, MoreHorizontal, RefreshCw, Trash2, WalletCards, Wrench, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resources } from './api/resources';
import { notify } from './ui';
import './maintainer-notifications-connected.css';

const TYPE_OPTIONS = [
  ['ALL', 'Toutes'], ['NEW_MESSAGE', 'Messages'], ['NEW_REQUEST', 'Demandes'], ['NEARBY_REQUEST', 'Demandes proches'],
  ['QUOTE_RECEIVED', 'Devis reçus'], ['QUOTE_ACCEPTED', 'Devis acceptés'], ['INTERVENTION_SCHEDULED', 'Interventions'],
];

function objectData(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function text(value, fallback = '') { return typeof value === 'string' ? value : value == null ? fallback : String(value); }
function dateValue(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
function dateLabel(value) { const date = dateValue(value); return date ? date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date indisponible'; }
function groupLabel(value) { const date = dateValue(value); if (!date) return 'Date indisponible'; const now = new Date(); const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1); if (date.toDateString() === now.toDateString()) return "Aujourd’hui"; if (date.toDateString() === yesterday.toDateString()) return 'Hier'; return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
function typeLabel(type) { return TYPE_OPTIONS.find(option => option[0] === type)?.[1] || (text(type, 'Notification').replaceAll('_', ' ').toLowerCase()); }
function iconFor(type) { if (type === 'NEW_MESSAGE') return MessageCircle; if (type?.includes('QUOTE')) return FileText; if (type?.includes('INTERVENTION')) return CalendarDays; if (type?.includes('PAYMENT')) return WalletCards; if (type?.includes('REQUEST')) return Wrench; return Bell; }
function toneFor(type) { if (type === 'NEW_MESSAGE') return 'blue'; if (type?.includes('QUOTE')) return 'purple'; if (type?.includes('INTERVENTION')) return 'amber'; if (type?.includes('PAYMENT')) return 'lime'; return 'green'; }
function referenceFor(item) { const data = objectData(item?.data); if (item?.type === 'NEW_MESSAGE' && data.conversationId) return { label: 'Ouvrir la conversation', path: `/dashboard/maintenancier/messagerie?conversationId=${encodeURIComponent(String(data.conversationId))}` }; if ((item?.type === 'NEW_REQUEST' || item?.type === 'NEARBY_REQUEST') && data.requestId) return { label: 'Ouvrir la demande', path: `/dashboard/maintenancier/demandes?requestId=${encodeURIComponent(String(data.requestId))}` }; if (item?.type?.includes('QUOTE') && (data.quoteId || data.requestId)) return { label: 'Ouvrir le devis', path: `/dashboard/maintenancier/devis?${data.quoteId ? 'quoteId' : 'requestId'}=${encodeURIComponent(String(data.quoteId || data.requestId))}` }; if (item?.type?.includes('INTERVENTION') && data.interventionId) return { label: 'Ouvrir l’intervention', path: `/dashboard/maintenancier/interventions?interventionId=${encodeURIComponent(String(data.interventionId))}` }; if (item?.type?.includes('PAYMENT') && (data.paymentId || data.invoiceId)) return { label: 'Ouvrir le paiement', path: `/dashboard/maintenancier/paiements?${data.paymentId ? 'paymentId' : 'invoiceId'}=${encodeURIComponent(String(data.paymentId || data.invoiceId))}` }; return null; }

export function MaintainerNotificationsConnected() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [selected, setSelected] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const load = async ({ append = false } = {}) => {
    const nextSkip = append ? skip : 0;
    if (append) setLoadingMore(true); else setLoading(true);
    setError('');
    try {
      const query = { limit: 25, skip: nextSkip };
      if (filter !== 'ALL') query.type = filter;
      if (unreadOnly) query.unreadOnly = 'true';
      const result = await resources.notifications.list(query);
      const nextItems = Array.isArray(result?.items) ? result.items : [];
      setItems(current => append ? [...current, ...nextItems] : nextItems);
      setTotal(Number.isFinite(Number(result?.total)) ? Number(result.total) : nextItems.length);
      setUnread(Number.isFinite(Number(result?.unread)) ? Number(result.unread) : 0);
      setSkip(nextSkip + nextItems.length);
      setHasMore(nextSkip + nextItems.length < (Number(result?.total) || 0));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Impossible de charger les notifications.');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  };

  useEffect(() => { load(); }, [filter, unreadOnly]);
  useEffect(() => { const close = () => setMenuId(null); document.addEventListener('click', close); return () => document.removeEventListener('click', close); }, []);

  const groups = useMemo(() => items.reduce((result, item) => { const key = groupLabel(item?.createdAt); const group = result.find(entry => entry.label === key); if (group) group.items.push(item); else result.push({ label: key, items: [item] }); return result; }, []), [items]);
  const markRead = async item => {
    if (!item?.id || item.readAt || actionId) return;
    setActionId(item.id);
    try {
      await resources.notifications.read(item.id);
      setItems(current => current.map(row => row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row));
      setUnread(current => Math.max(0, current - 1));
      window.dispatchEvent(new CustomEvent('agrimac:notifications-updated'));
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'La notification n’a pas pu être marquée comme lue.', 'error'); } finally { setActionId(''); }
  };
  const open = async item => { await markRead(item); const reference = referenceFor(item); if (reference) navigate(reference.path); else setSelected(item); };
  const markAllRead = async () => {
    if (!unread || actionId) return;
    setActionId('all');
    try { await resources.notifications.readAll(); setItems(current => current.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); setUnread(0); window.dispatchEvent(new CustomEvent('agrimac:notifications-updated')); notify('Toutes les notifications sont marquées comme lues.'); } catch (reason) { notify(reason instanceof Error ? reason.message : 'Les notifications n’ont pas pu être marquées comme lues.', 'error'); } finally { setActionId(''); }
  };
  const remove = async item => {
    setActionId(item.id);
    try { await resources.notifications.remove(item.id); setItems(current => current.filter(row => row.id !== item.id)); setTotal(current => Math.max(0, current - 1)); if (!item.readAt) setUnread(current => Math.max(0, current - 1)); setMenuId(null); setSelected(current => current?.id === item.id ? null : current); window.dispatchEvent(new CustomEvent('agrimac:notifications-updated')); notify('Notification supprimée.'); } catch (reason) { notify(reason instanceof Error ? reason.message : 'La notification n’a pas pu être supprimée.', 'error'); } finally { setActionId(''); }
  };

  return <main className="feature-page maintainer-action-page maintainer-notifications-connected"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Centre de notifications</h2><p>Les alertes persistées liées à vos demandes, devis et interventions.</p></div><div className="maintainer-notification-heading-actions"><button className="feature-secondary" onClick={() => load()} disabled={loading}><RefreshCw size={13} /> Actualiser</button><button className="feature-primary" onClick={markAllRead} disabled={!unread || Boolean(actionId)}><Check size={14} /> Tout marquer comme lu</button></div></div><section className="feature-panel maintainer-notification-panel"><header><div><h3>Notifications récentes</h3><p>{unread} non lue(s) sur {total} notification(s).</p></div><div className="maintainer-notification-filters"><label><ChevronDown size={13} /><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filtrer par type">{TYPE_OPTIONS.map(option => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</select></label><button className={`notification-filter-toggle ${unreadOnly ? 'active' : ''}`} onClick={() => setUnreadOnly(value => !value)} aria-pressed={unreadOnly}>Non lues</button></div></header>{loading ? <NotificationLoading /> : error ? <NotificationError message={error} onRetry={() => load()} /> : !items.length ? <NotificationEmpty filtered={Boolean(filter !== 'ALL' || unreadOnly)} onReset={() => { setFilter('ALL'); setUnreadOnly(false); }} /> : <div className="maintainer-notification-groups">{groups.map(group => <section key={group.label}><h4><span />{group.label}</h4><div className="maintainer-notification-list">{group.items.map(item => <NotificationCard key={item.id} item={item} actionId={actionId} menuId={menuId} onOpen={open} onMenu={(event) => { event.stopPropagation(); setMenuId(current => current === item.id ? null : item.id); }} onRemove={remove} />)}</div></section>)}</div>}{hasMore && !loading && <button className="notification-load-more" onClick={() => load({ append: true })} disabled={loadingMore}>{loadingMore ? <LoaderCircle size={14} className="notification-spin" /> : <ChevronDown size={14} />} {loadingMore ? 'Chargement...' : 'Charger plus'}</button>}</section>{selected && <NotificationDetail item={selected} onClose={() => setSelected(null)} />}</main>;
}

function NotificationCard({ item, actionId, menuId, onOpen, onMenu, onRemove }) { const Icon = iconFor(item?.type); const reference = referenceFor(item); return <article className={`maintainer-notification-card ${item?.readAt ? 'read' : 'unread'}`} onClick={() => onOpen(item)}><span className={`maintainer-notification-icon ${toneFor(item?.type)}`}><Icon size={17} /></span><div className="maintainer-notification-content"><div className="maintainer-notification-card-head"><b>{text(item?.title, 'Notification')}</b><time>{dateLabel(item?.createdAt)}</time></div><p>{text(item?.body, 'Contenu indisponible.')}</p><div className="maintainer-notification-card-footer"><span>{typeLabel(item?.type)}</span>{reference && <button type="button" onClick={event => { event.stopPropagation(); onOpen(item); }}>{reference.label} <ArrowRight size={12} /></button>}</div></div>{!item?.readAt && <i className="notification-unread-dot" />}{actionId === item?.id && <LoaderCircle size={15} className="notification-card-loader notification-spin" />}<div className="notification-card-menu"><button type="button" aria-label="Options de la notification" onClick={onMenu}><MoreHorizontal size={17} /></button>{menuId === item?.id && <div className="notification-popover" onClick={event => event.stopPropagation()}><button type="button" onClick={() => onOpen(item)}>{item?.readAt ? 'Ouvrir' : 'Marquer comme lue'} <Check size={13} /></button><button type="button" onClick={() => onRemove(item)} disabled={actionId === item?.id}><Trash2 size={13} /> Supprimer</button></div>}</div></article>; }
function NotificationDetail({ item, onClose }) { const Icon = iconFor(item?.type); return <div className="notification-detail-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="notification-detail" role="dialog" aria-modal="true"><header><span className={`maintainer-notification-icon ${toneFor(item?.type)}`}><Icon size={18} /></span><button onClick={onClose} aria-label="Fermer"><X size={17} /></button></header><span className="reference-overline">{typeLabel(item?.type)}</span><h3>{text(item?.title, 'Notification')}</h3><p>{text(item?.body, 'Contenu indisponible.')}</p><time>{dateLabel(item?.createdAt)}</time><small>Cette notification ne contient aucune référence de ressource exploitable pour une navigation directe.</small></section></div>; }
function NotificationLoading() { return <div className="notification-state"><LoaderCircle size={22} className="notification-spin" /> Chargement des notifications...</div>; }
function NotificationError({ message, onRetry }) { return <div className="notification-state notification-error"><AlertCircle size={24} /><b>Notifications indisponibles</b><small>{message}</small><button className="feature-secondary" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button></div>; }
function NotificationEmpty({ filtered, onReset }) { return <div className="notification-state"><Bell size={25} /><b>{filtered ? 'Aucune notification correspondante' : 'Aucune notification'}</b><small>{filtered ? 'Aucune notification ne correspond à vos filtres.' : 'Les nouvelles alertes de votre compte apparaîtront ici.'}</small>{filtered && <button className="feature-secondary" onClick={onReset}>Réinitialiser les filtres</button>}</div>; }
