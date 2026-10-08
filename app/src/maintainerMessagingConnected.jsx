import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, Check, CheckCheck, CircleAlert, FileText, Image, LoaderCircle, MapPin, MessageCircle, MoreHorizontal, Paperclip, Phone, Plus, RefreshCw, Search, Send, UserRound, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import { resources } from './api/resources';
import { getAccessToken } from './api/client';
import { notify } from './ui';
import './maintainer-messaging-connected.css';

function safeText(value, fallback = '') { return typeof value === 'string' ? value : value == null ? fallback : String(value); }
function rows(data) { return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []; }
function currentUser() { try { return JSON.parse(localStorage.getItem('agrimacUser') || '{}'); } catch { return {}; } }
function userIdFromStorage() { const user = currentUser(); return safeText(user.id || user.userId); }
function participantOf(conversation, userId) { return conversation?.participants?.find(item => item.userId !== userId) || conversation?.participants?.[0] || null; }
function participantName(conversation, userId) { const participant = participantOf(conversation, userId); const user = participant?.user || {}; const profile = user.companyProfile || user.farmerProfile || user.technicianProfile; return safeText(profile?.legalName || profile?.displayName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || user.phone, 'Contact AGRIMAC'); }
function participantPhone(conversation, userId) { return safeText(participantOf(conversation, userId)?.user?.phone); }
function initials(name) { return safeText(name, 'C').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(item => item[0]).join('').toUpperCase() || 'C'; }
function messageTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date indisponible' : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
function messageDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date indisponible' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); }
function messageText(message) { return safeText(message?.body, message?.attachments?.length ? 'Pièce jointe' : 'Message sans contenu'); }

export function MaintainerMessagingConnected() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = userIdFromStorage();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationDetail, setConversationDetail] = useState(null);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [socketState, setSocketState] = useState('connecting');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [newConversationForm, setNewConversationForm] = useState({ participantId: '', message: '' });
  const [savingConversation, setSavingConversation] = useState(false);
  const socketRef = useRef(null);
  const activeIdRef = useRef(null);
  const activeConversationRef = useRef(null);

  const loadConversations = async (selectFirst = false) => {
    setLoading(true); setError('');
    try {
      const result = await resources.conversations.list({ limit: 50, skip: 0 });
      const next = rows(result);
      setConversations(next);
      const requestedId = new URLSearchParams(location.search).get('conversationId');
      const requested = next.find(item => item.id === requestedId);
      if (requested) setActive(requested);
      else if (selectFirst && next[0]) setActive(next[0]);
      else if (activeIdRef.current) setActive(next.find(item => item.id === activeIdRef.current) || null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Impossible de charger les conversations.'); } finally { setLoading(false); }
  };

  const loadMessages = async conversation => {
    if (!conversation?.id) { setMessages([]); setConversationDetail(null); return; }
    setMessagesLoading(true); setMenuOpen(false);
    try {
      const [messageResult, detail] = await Promise.all([resources.conversations.messages(conversation.id, { limit: 100, skip: 0 }), resources.conversations.get(conversation.id)]);
      setMessages(rows(messageResult)); setConversationDetail(detail);
      await resources.conversations.read(conversation.id);
      setConversations(current => current.map(item => item.id === conversation.id ? { ...item, unread: false } : item));
      socketRef.current?.emit('conversation:join', { conversationId: conversation.id });
    } catch (reason) { notify(reason instanceof Error ? reason.message : 'Impossible de charger les messages.', 'error'); } finally { setMessagesLoading(false); }
  };

  useEffect(() => { loadConversations(true); }, []);
  useEffect(() => { activeIdRef.current = active?.id || null; activeConversationRef.current = active || null; loadMessages(active); }, [active?.id]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setSocketState('offline'); return undefined; }
    const socket = io(`${import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:3000'}/messaging`, { auth: { token }, reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000 });
    socketRef.current = socket;
    const onConnect = () => setSocketState('connected');
    const onDisconnect = () => setSocketState('offline');
    const onConnectError = () => setSocketState('error');
    const onReady = () => setSocketState('connected');
    const onMessage = message => {
      if (!message?.conversationId) return;
      if (message.conversationId === activeIdRef.current) {
        setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message]);
        resources.conversations.read(message.conversationId).catch(() => undefined);
      }
      loadConversations(false);
    };
    const onConversationUpdated = event => { if (event?.conversationId) loadConversations(false); };
    const onRead = event => { if (event?.conversationId === activeIdRef.current) setMessages(current => current.map(item => item.senderId !== userId ? { ...item, status: 'READ', readAt: event.readAt } : item)); };
    const onError = event => { setSocketState('error'); notify(safeText(event?.message, 'Erreur Socket.IO.'), 'error'); };
    socket.on('connect', onConnect); socket.on('disconnect', onDisconnect); socket.on('connect_error', onConnectError); socket.on('messaging:ready', onReady); socket.on('message:new', onMessage); socket.on('conversation:updated', onConversationUpdated); socket.on('conversation:read', onRead); socket.on('messaging:error', onError);
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); socket.off('connect_error', onConnectError); socket.off('messaging:ready', onReady); socket.off('message:new', onMessage); socket.off('conversation:updated', onConversationUpdated); socket.off('conversation:read', onRead); socket.off('messaging:error', onError); socket.disconnect(); socketRef.current = null; };
  }, [userId]);

  const visible = useMemo(() => conversations.filter(item => `${participantName(item, userId)} ${messageText(item.messages?.[0])}`.toLowerCase().includes(query.toLowerCase())), [conversations, query, userId]);
  const activeParticipant = participantOf(conversationDetail || active, userId);
  const activeName = participantName(conversationDetail || active, userId);
  const phone = participantPhone(conversationDetail || active, userId);

  const chooseFile = file => { if (!file) return; if (file.size > 10 * 1024 * 1024) { notify('La taille maximale est de 10 Mo.', 'error'); return; } setAttachment(file); };
  const uploadAttachment = async file => { const form = new FormData(); form.append('file', file); form.append('purpose', 'MESSAGE_ATTACHMENT'); return resources.uploads.create(form); };
  const send = async event => {
    event?.preventDefault();
    if (!active?.id || sending || uploading) return;
    const body = draft.trim();
    if (!body && !attachment) { notify('Écrivez un message ou choisissez une pièce jointe.', 'error'); return; }
    setSending(true);
    try {
      let attachmentDto;
      if (attachment) { setUploading(true); const uploaded = await uploadAttachment(attachment); attachmentDto = [{ storageKey: uploaded.storageKey, originalName: uploaded.originalName, mimeType: uploaded.mimeType, sizeBytes: uploaded.sizeBytes }]; setUploading(false); }
      const payload = { conversationId: active.id, body: body || undefined, attachments: attachmentDto };
      const socket = socketRef.current;
      const result = socket?.connected ? await new Promise((resolve, reject) => { socket.timeout(12000).emit('message:send', payload, (transportError, response) => { if (transportError) reject(new Error('Le délai Socket.IO est dépassé.')); else if (response?.data) resolve(response.data); else reject(new Error(response?.message || 'Envoi Socket.IO refusé.')); }); }) : await resources.conversations.send(active.id, { body: body || undefined, attachments: attachmentDto });
      setMessages(current => current.some(item => item.id === result.id) ? current : [...current, result]); setDraft(''); setAttachment(null); await loadConversations(false);
    } catch (reason) { setUploading(false); notify(reason instanceof Error ? reason.message : 'Le message n’a pas pu être envoyé.', 'error'); } finally { setSending(false); }
  };

  const archive = async () => { if (!active?.id) return; try { await resources.conversations.archive(active.id); setConversations(current => current.filter(item => item.id !== active.id)); setActive(null); setMessages([]); notify('Conversation archivée.'); } catch (reason) { notify(reason instanceof Error ? reason.message : 'La conversation n’a pas pu être archivée.', 'error'); } finally { setMenuOpen(false); } };
  const remove = async () => { if (!active?.id || !window.confirm('Supprimer cette conversation pour votre compte ?')) return; try { await resources.conversations.remove(active.id); setConversations(current => current.filter(item => item.id !== active.id)); setActive(null); setMessages([]); notify('Conversation supprimée.'); } catch (reason) { notify(reason instanceof Error ? reason.message : 'La conversation n’a pas pu être supprimée.', 'error'); } finally { setMenuOpen(false); } };
  const createConversation = async event => { event.preventDefault(); const participantId = newConversationForm.participantId.trim(); const message = newConversationForm.message.trim(); if (!participantId) return notify('L’identifiant UUID du participant est obligatoire.', 'error'); setSavingConversation(true); try { const created = await resources.conversations.create({ participantIds: [participantId], initialMessage: message || undefined }); setConversations(current => [created, ...current.filter(item => item.id !== created.id)]); setActive(created); setNewConversationOpen(false); setNewConversationForm({ participantId: '', message: '' }); notify('Conversation créée.'); } catch (reason) { notify(reason instanceof Error ? reason.message : 'La conversation n’a pas pu être créée.', 'error'); } finally { setSavingConversation(false); } };
  const showContext = () => { if (conversationDetail?.requestId) navigate(`/dashboard/maintenancier/demandes?requestId=${conversationDetail.requestId}`); else if (conversationDetail?.quoteId) navigate(`/dashboard/maintenancier/devis?quoteId=${conversationDetail.quoteId}`); else notify('Aucune demande ou devis lié à cette conversation.', 'error'); };

  if (loading) return <MessagingState label="Chargement des conversations..." />;
  if (error) return <MessagingError message={error} onRetry={() => loadConversations(true)} />;
  return <main className="feature-page maintainer-action-page maintainer-messaging-connected"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Messagerie</h2><p>Échangez avec vos clients et suivez vos interventions.</p></div><div className="maintainer-messaging-heading-actions"><span className={`messaging-socket-status ${socketState}`}><i /> {socketState === 'connected' ? 'Temps réel connecté' : socketState === 'connecting' ? 'Connexion...' : 'Temps réel indisponible'}</span><button className="feature-primary" onClick={() => setNewConversationOpen(true)}><Plus size={14} /> Nouveau message</button></div></div><div className="maintainer-message-layout"><section className="feature-panel messaging-conversations-panel"><header><div><h3><MessageCircle size={17} /> Conversations</h3><p>{conversations.length} conversation(s) réelle(s).</p></div><button className="messaging-header-icon" onClick={() => loadConversations(false)} aria-label="Actualiser les conversations"><RefreshCw size={15} /></button></header><label className="feature-toolbar messaging-search"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un message, un prestataire..." /></label>{visible.length ? <div className="maintainer-conversations">{visible.map(item => <ConversationRow key={item.id} item={item} userId={userId} active={active?.id === item.id} onClick={() => setActive(item)} />)}</div> : <div className="messaging-empty"><MessageCircle size={23} /><b>{query ? 'Aucun résultat' : 'Aucune conversation'}</b><small>{query ? 'Modifiez votre recherche.' : 'Les conversations de votre compte apparaîtront ici.'}</small></div>}</section><section className="feature-panel maintainer-chat-panel">{active ? <><header className="maintainer-chat-header"><div className="messaging-participant-heading"><span className="feature-avatar">{initials(activeName)}</span><div><h3>{activeName}</h3><p><i className="messaging-online-dot" />{socketState === 'connected' ? 'Messagerie sécurisée · temps réel' : 'Messagerie sécurisée'}</p></div></div><div className="maintainer-chat-header-actions"><button className="farmer-message-icon" onClick={() => phone ? window.location.assign(`tel:${phone}`) : notify('Aucun numéro réel n’est disponible pour ce contact.', 'error')} aria-label={`Appeler ${activeName}`}><Phone size={15} /></button><button className="farmer-message-icon" onClick={showContext} aria-label="Voir le contexte lié"><FileText size={15} /></button><button className="farmer-message-icon" onClick={() => setProfileOpen(true)} aria-label="Voir le profil du participant"><UserRound size={15} /></button><button className="farmer-message-icon" onClick={() => setMenuOpen(value => !value)} aria-label="Options de la conversation"><MoreHorizontal size={15} /></button>{menuOpen && <div className="maintainer-message-menu"><button onClick={() => { resources.conversations.read(active.id).then(() => notify('Conversation marquée comme lue.')).catch(reason => notify(reason.message, 'error')); setMenuOpen(false); }}><CheckCheck size={13} /> Marquer comme lue</button><button onClick={archive}><Archive size={13} /> Archiver</button><button className="danger" onClick={remove}><X size={13} /> Supprimer</button></div>}</div></header><div className="messaging-context-banner"><div><span><MapPin size={14} /></span><p>Conversation {conversationDetail?.requestId || conversationDetail?.quoteId ? 'liée à une ressource AGRIMAC.' : 'sans ressource liée.'}</p></div>{(conversationDetail?.requestId || conversationDetail?.quoteId) && <button onClick={showContext}>Voir les détails <ArrowRightIcon /></button>}</div><div className="maintainer-chat-messages">{messagesLoading ? <MessagingState label="Chargement des messages..." compact /> : messages.length ? <MessageList messages={messages} userId={userId} participantName={activeName} /> : <div className="messaging-empty"><MessageCircle size={23} /><b>Aucun message</b><small>Commencez l’échange avec ce participant.</small></div>}</div><form className="maintainer-message-composer" onSubmit={send}><div className="message-attachment-actions"><label title="Ajouter une image"><Image size={16} /><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => chooseFile(event.target.files?.[0])} /></label><label title="Ajouter un document"><Paperclip size={16} /><input hidden type="file" accept="application/pdf,.doc,.docx" onChange={event => chooseFile(event.target.files?.[0])} /></label>{attachment && <span title={attachment.name}><FileText size={12} /> {attachment.name}</span>}</div><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(event); } }} placeholder="Écrivez votre message..." rows="1" disabled={sending} /><button type="button" className="message-call-composer" onClick={() => notify('La dictée vocale n’est pas implémentée par le backend de messagerie.', 'error')} aria-label="Dictée vocale"><MessageCircle size={15} /></button><button className="message-send-button" disabled={sending || uploading || (!draft.trim() && !attachment)} aria-label="Envoyer le message">{sending || uploading ? <LoaderCircle size={16} className="messaging-spin" /> : <Send size={16} />}</button></form></> : <div className="messaging-no-selection"><MessageCircle size={30} /><b>Sélectionnez une conversation</b><small>Les messages du participant sélectionné apparaîtront ici.</small></div>}</section></div>{profileOpen && <ParticipantProfile participant={activeParticipant} name={activeName} onClose={() => setProfileOpen(false)} />}{newConversationOpen && <NewConversationModal form={newConversationForm} saving={savingConversation} onChange={setNewConversationForm} onSubmit={createConversation} onClose={() => setNewConversationOpen(false)} />}</main>;
}

function ConversationRow({ item, userId, active, onClick }) { const name = participantName(item, userId); const latest = item.messages?.[0]; return <button className={`maintainer-conversation-row ${active ? 'active' : ''}`} onClick={onClick}><span className="feature-avatar">{initials(name)}</span><span><b>{name}</b><small>{messageText(latest)}</small><em>{latest?.createdAt ? messageTime(latest.createdAt) : 'Aucun message'}</em></span>{item.unread && <i aria-label="Non lu" />}</button>; }
function MessageList({ messages, userId, participantName: name }) { return <div className="messaging-message-list">{messages.map((message, index) => { const own = message.senderId === userId; return <React.Fragment key={message.id || `${message.createdAt}-${index}`}><div className={`messaging-date-separator ${index && new Date(messages[index - 1]?.createdAt).toDateString() === new Date(message.createdAt).toDateString() ? 'hidden' : ''}`}>{messageDate(message.createdAt)}</div><div className={`messaging-bubble-row ${own ? 'own' : ''}`}><div className="messaging-bubble"><p>{messageText(message)}</p>{message.attachments?.length > 0 && <div className="messaging-attachments">{message.attachments.map(file => <span key={file.id || file.storageKey}><FileText size={13} /> {safeText(file.originalName, 'Pièce jointe')}<small>Disponibilité du téléchargement non exposée par l’API</small></span>)}</div>}<time>{messageTime(message.createdAt)} {own && <CheckCheck size={12} className={message.status === 'READ' ? 'message-read' : ''} />}</time></div></div></React.Fragment>; })}</div>; }
function ParticipantProfile({ participant, name, onClose }) { const user = participant?.user || {}; const profile = user.companyProfile || user.farmerProfile || user.technicianProfile; return <div className="messaging-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="messaging-modal" role="dialog" aria-modal="true"><header><div className="feature-avatar">{initials(name)}</div><button onClick={onClose} aria-label="Fermer"><X size={17} /></button></header><span className="reference-overline">PARTICIPANT</span><h3>{name}</h3><dl><div><dt>Téléphone</dt><dd>{safeText(user.phone, 'Non disponible')}</dd></div><div><dt>Identifiant</dt><dd>{safeText(participant?.userId, 'Non disponible')}</dd></div>{profile?.city && <div><dt>Ville</dt><dd>{profile.city}</dd></div>}{profile?.region && <div><dt>Région</dt><dd>{profile.region}</dd></div>}</dl><small>Seules les informations réellement renvoyées par l’API sont affichées.</small></section></div>; }
function NewConversationModal({ form, saving, onChange, onSubmit, onClose }) { return <div className="messaging-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><form className="messaging-modal" onSubmit={onSubmit}><header><div><span className="reference-overline">MESSAGERIE</span><h3>Nouvelle conversation</h3></div><button type="button" onClick={onClose} aria-label="Fermer"><X size={17} /></button></header><label>Identifiant UUID du participant<input value={form.participantId} onChange={event => onChange({ ...form, participantId: event.target.value })} required placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx" /></label><label>Message initial<textarea value={form.message} onChange={event => onChange({ ...form, message: event.target.value })} rows="4" placeholder="Écrivez un message..." /></label><p className="messaging-modal-note">Aucun endpoint de recherche de contacts n’est disponible. L’identifiant réel du participant est requis.</p><footer><button type="button" className="feature-secondary" onClick={onClose}>Annuler</button><button className="feature-primary" disabled={saving}>{saving ? <><LoaderCircle size={14} className="messaging-spin" /> Création...</> : <><Send size={14} /> Créer</>}</button></footer></form></div>; }
function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }
function MessagingState({ label, compact = false }) { return <div className={`messaging-state ${compact ? 'compact' : ''}`}><LoaderCircle size={20} className="messaging-spin" />{label}</div>; }
function MessagingError({ message, onRetry }) { return <main className="feature-page maintainer-action-page maintainer-messaging-connected"><div className="messaging-state messaging-error"><CircleAlert size={24} /><b>Messagerie indisponible</b><small>{message}</small><button className="feature-secondary" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button></div></main>; }
