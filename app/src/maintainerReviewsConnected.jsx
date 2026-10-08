import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Filter, LoaderCircle, MessageCircle, MoreHorizontal, RefreshCw, Search, Star, X } from 'lucide-react';
import { api } from './api/client';
import { notify } from './ui';
import './maintainer-reviews-connected.css';

const PAGE_SIZE = 5;
const FILTERS = [['ALL', 'Tous les avis'], ['5', '5 étoiles'], ['4', '4 étoiles'], ['3', '3 étoiles'], ['2', '2 étoiles'], ['1', '1 étoile'], ['UNANSWERED', 'Sans réponse']];

function safeText(value, fallback = '') { return typeof value === 'string' ? value : value == null ? fallback : String(value); }
function rows(data) { return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []; }
function validDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
function dateLabel(value) { const date = validDate(value); return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date indisponible'; }
function authorLabel(review) { const author = review?.author || {}; return safeText(author.displayName || author.name || author.legalName || author.phone || author.id, 'Client non renseigné'); }
function ratingValue(review) { const value = Number(review?.rating); return Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0; }
function average(reviews) { return reviews.length ? reviews.reduce((sum, review) => sum + ratingValue(review), 0) / reviews.length : 0; }
function roleIsMaintainer(user) { return Array.isArray(user?.roles) && user.roles.some(role => safeText(role?.code || role) === 'MAINTENANCIER'); }

export function MaintainerReviewsConnected() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyNotice, setReplyNotice] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const user = await api.get('/users/me');
      if (!user?.id || !roleIsMaintainer(user)) throw new Error('Le compte connecté n’est pas un compte maintenancier valide.');
      const data = await api.get(`/reviews?targetUserId=${encodeURIComponent(user.id)}`);
      setReviews(rows(data)); setPage(1);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de charger les avis reçus.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => reviews.filter(review => {
    const rating = ratingValue(review);
    const matchesFilter = filter === 'ALL' || (filter === 'UNANSWERED' ? !review?.response && !review?.reply : String(rating) === filter);
    const haystack = `${authorLabel(review)} ${safeText(review.comment)} ${safeText(review.serviceId)} ${safeText(review.productId)}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [reviews, filter, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const avg = average(reviews);
  const distribution = [5, 4, 3, 2, 1].map(rating => ({ rating, count: reviews.filter(review => ratingValue(review) === rating).length }));
  const answered = reviews.filter(review => review?.response || review?.reply).length;

  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  const changeFilter = value => { setFilter(value); setPage(1); };
  const changeQuery = value => { setQuery(value); setPage(1); };

  if (loading) return <ReviewsState label="Chargement de vos avis reçus..." />;
  if (error) return <ReviewsError message={error} onRetry={load} />;
  return <main className="feature-page maintainer-action-page maintainer-reviews-connected"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Avis &amp; évaluations</h2><p>Consultez les retours réellement associés à votre compte maintenancier.</p></div><button className="feature-secondary" onClick={load}><RefreshCw size={14} /> Actualiser</button></div><section className="review-stat-grid"><ReviewStat icon={<Star size={19} />} tone="yellow" label="Note moyenne reçue" value={avg ? avg.toFixed(1) : '0.0'} suffix="/ 5" detail={`${reviews.length} avis réel(s)`} /><ReviewStat icon={<CheckCircle2 size={19} />} tone="green" label="Avis reçus" value={String(reviews.length)} detail="Depuis le backend AGRIMAC" /><ReviewStat icon={<MessageCircle size={19} />} tone="blue" label="Réponses" value={String(answered)} detail={reviews.length ? `${reviews.length - answered} sans réponse` : 'Aucun avis'} /></section><div className="review-main-grid"><section className="feature-panel review-list-panel"><header><div><h3><span className="review-title-mark" /> Historique des avis</h3><p>{filtered.length} avis affiché(s) sur {reviews.length}.</p></div><div className="review-tools"><label className="review-search"><Search size={14} /><input value={query} onChange={event => changeQuery(event.target.value)} placeholder="Rechercher un client ou commentaire..." /></label><label className="review-filter"><Filter size={13} /><select value={filter} onChange={event => changeFilter(event.target.value)} aria-label="Filtrer les avis">{FILTERS.map(option => <option key={option[0]} value={option[0]}>{option[1]}</option>)}</select></label></div></header>{visible.length ? <div className="review-list">{visible.map(review => <ReviewCard key={review.id} review={review} onDetail={() => setSelected(review)} onReply={() => setReplyNotice(review)} />)}</div> : <ReviewsEmpty filtered={Boolean(query || filter !== 'ALL')} onReset={() => { setQuery(''); setFilter('ALL'); }} />}{filtered.length > PAGE_SIZE && <footer className="review-pagination"><span>Page {page} sur {pageCount}</span><div><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} aria-label="Page précédente"><ChevronLeft size={15} /></button><button onClick={() => setPage(value => Math.min(pageCount, value + 1))} disabled={page === pageCount} aria-label="Page suivante"><ChevronRight size={15} /></button></div></footer>}</section><aside className="review-distribution-column"><section className="feature-panel review-distribution"><header><div><h3>Répartition des notes</h3><p>Calculée à partir des avis reçus.</p></div></header><div className="review-bars">{distribution.map(item => <div className="review-bar-row" key={item.rating}><span>{item.rating} <Star size={11} fill="currentColor" /></span><div><i style={{ width: reviews.length ? `${item.count / reviews.length * 100}%` : '0%' }} /></div><b>{item.count}</b></div>)}</div></section><section className="review-info-card"><span><AlertCircle size={18} /></span><div><b>Répondre aux clients</b><p>Le backend actuel ne fournit pas d’endpoint de réponse aux avis. Aucun commentaire ne sera simulé.</p><button onClick={() => setReplyNotice({})}>Voir le détail technique <MoreHorizontal size={13} /></button></div></section></aside></div>{selected && <ReviewDetail review={selected} onClose={() => setSelected(null)} onReply={() => { setSelected(null); setReplyNotice(selected); }} />}{replyNotice && <ReplyUnavailable review={replyNotice} onClose={() => setReplyNotice(null)} />}</main>;
}

function ReviewStat({ icon, tone, label, value, suffix = '', detail }) { return <article className={`review-stat-card ${tone}`}><span>{icon}</span><small>{label}</small><strong>{value} <em>{suffix}</em></strong><p>{detail}</p></article>; }
function Stars({ value }) { return <span className="review-stars" aria-label={`${value} sur 5`}><>{[1, 2, 3, 4, 5].map(item => <Star key={item} size={13} fill={item <= value ? 'currentColor' : 'none'} />)}</></span>; }
function ReviewCard({ review, onDetail, onReply }) { const rating = ratingValue(review); const comment = safeText(review?.comment); const hasReply = Boolean(review?.response || review?.reply); return <article className="review-card"><div className="review-card-top"><div className="review-author-avatar">{authorLabel(review).slice(0, 2).toUpperCase()}</div><div className="review-author"><b>{authorLabel(review)}</b><small><CalendarDays size={11} /> {dateLabel(review?.createdAt)}</small></div><Stars value={rating} /><button className="review-more" onClick={onDetail} aria-label="Consulter l’avis"><MoreHorizontal size={16} /></button></div><div className="review-card-meta"><span>Avis reçu</span><span>Intervention non fournie par l’API</span></div><p className={comment ? '' : 'review-no-comment'}>{comment || 'Aucun commentaire associé à cet avis.'}</p>{hasReply && <div className="review-existing-reply"><b>Réponse du Maintenancier</b><p>{safeText(review.response || review.reply)}</p></div>}<footer><button onClick={onDetail}>Consulter le détail <ChevronRight size={13} /></button><button onClick={onReply}>{hasReply ? 'Modifier la réponse' : 'Répondre'} <MessageCircle size={13} /></button></footer></article>; }
function ReviewDetail({ review, onClose, onReply }) { const rating = ratingValue(review); return <div className="review-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="review-modal" role="dialog" aria-modal="true"><header><div className="review-author-avatar">{authorLabel(review).slice(0, 2).toUpperCase()}</div><button onClick={onClose} aria-label="Fermer"><X size={17} /></button></header><span className="reference-overline">DÉTAIL DE L’AVIS</span><h3>{authorLabel(review)}</h3><div className="review-modal-rating"><Stars value={rating} /><b>{rating || 'Non disponible'} / 5</b></div><dl><div><dt>Identifiant</dt><dd>{safeText(review?.id, 'Non disponible')}</dd></div><div><dt>Date</dt><dd>{dateLabel(review?.createdAt)}</dd></div><div><dt>Intervention</dt><dd>Non fournie par l’API</dd></div><div><dt>Commentaire</dt><dd>{safeText(review?.comment, 'Aucun commentaire')}</dd></div></dl><footer><button className="feature-secondary" onClick={onClose}>Fermer</button><button className="feature-primary" onClick={onReply}>Répondre <MessageCircle size={14} /></button></footer></section></div>; }
function ReplyUnavailable({ review, onClose }) { return <div className="review-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="review-modal reply-unavailable" role="dialog" aria-modal="true"><header><span><AlertCircle size={20} /></span><button onClick={onClose} aria-label="Fermer"><X size={17} /></button></header><span className="reference-overline">ACTION : RÉPONDRE À UN AVIS</span><h3>{review?.id ? `Avis ${review.id}` : 'Répondre à un avis'}</h3><p>Cette action n’est pas envoyée car aucun endpoint backend ne permet de créer ou modifier une réponse.</p><dl><div><dt>ENDPOINT MANQUANT</dt><dd>POST/PATCH réponse d’avis</dd></div><div><dt>DONNÉES NÉCESSAIRES</dt><dd>reviewId, maintainerId, body, createdAt</dd></div><div><dt>RAISON</dt><dd>Le modèle Review ne contient aucun champ de réponse et le contrôleur n’expose aucune route correspondante.</dd></div></dl><button className="feature-secondary" onClick={onClose}>Fermer</button></section></div>; }
function ReviewsEmpty({ filtered, onReset }) { return <div className="review-empty"><MessageCircle size={25} /><b>{filtered ? 'Aucun avis correspondant' : 'Aucun avis reçu'}</b><small>{filtered ? 'Aucun avis ne correspond à vos critères.' : 'Les avis réellement associés à votre compte apparaîtront ici.'}</small>{filtered && <button onClick={onReset}>Réinitialiser les filtres</button>}</div>; }
function ReviewsState({ label }) { return <main className="feature-page maintainer-action-page maintainer-reviews-connected"><div className="reviews-state"><LoaderCircle size={22} className="reviews-spin" />{label}</div></main>; }
function ReviewsError({ message, onRetry }) { return <main className="feature-page maintainer-action-page maintainer-reviews-connected"><div className="reviews-state reviews-error"><AlertCircle size={24} /><b>Avis indisponibles</b><small>{message}</small><button className="feature-secondary" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button></div></main>; }
