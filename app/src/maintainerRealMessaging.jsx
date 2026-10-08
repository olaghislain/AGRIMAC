import React, { useEffect, useRef, useState } from 'react';
import { FileText, MoreHorizontal, Phone, Plus, Search, Send, UserRound } from 'lucide-react';
import { notify, openAction } from './ui';
import { MessageAttachmentButtons } from './MessageAttachmentButtons';

const seed = {
  'MTN Bénin SARL': { phone: '+22997001122', unread: true, messages: ['Bonjour, pouvez-vous confirmer votre arrivée demain à 09:00 ?', 'Oui, je confirme l’intervention.'] },
  'Jean Hounkpe': { phone: '+22996221844', unread: true, messages: ['Le diagnostic de la pompe est-il terminé ?'] },
  'Koffi Agbodan': { phone: '+22997123456', unread: false, messages: ['Merci pour votre devis.'] },
  'Ferme Sèmè': { phone: '+22995441032', unread: false, messages: ['Nous souhaitons planifier une intervention.'] },
};

export function MaintainerMessagingRealPage() {
  const [active, setActive] = useState('MTN Bénin SARL');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [messages, setMessages] = useState(seed);
  const menuRef = useRef(null);
  const current = messages[active];
  const names = Object.keys(messages).filter(name => name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selectConversation = name => {
    setActive(name);
    setMenu(false);
    setMessages(items => ({ ...items, [name]: { ...items[name], unread: false } }));
  };
  const call = () => current.phone ? window.location.assign(`tel:${current.phone}`) : notify('Aucun numéro disponible pour ce contact.', 'error');
  const send = () => {
    const text = draft.trim();
    if (!text) return notify('Écrivez un message ou choisissez une pièce jointe avant de l’envoyer.');
    setMessages(items => ({ ...items, [active]: { ...items[active], unread: false, messages: [...items[active].messages, text] } }));
    setDraft('');
    notify(`Message envoyé à ${active}.`);
  };
  const newMessage = () => openAction({ type: 'form', icon: '✉', title: 'Nouveau message', description: 'Choisissez un client et rédigez votre message.', submitLabel: 'Envoyer', fields: [{ name: 'recipient', label: 'Destinataire', required: true }, { name: 'message', label: 'Message', multiline: true, required: true }] });
  const profile = () => openAction({ type: 'detail', icon: '◉', title: `Profil · ${active}`, description: 'Informations du contact associé à votre intervention.', fields: [{ label: 'Contact', value: active }, { label: 'Téléphone', value: current.phone || 'Non disponible' }, { label: 'Statut', value: 'Contact vérifié AGRIMAC' }] });
  const quote = () => openAction({ type: 'detail', icon: '▤', title: 'Devis associé · DEV-089', description: 'Détail du devis lié à cette conversation.', fields: [{ label: 'Client', value: active }, { label: 'Intervention', value: 'Réparation tracteur 5090' }, { label: 'Montant', value: '85 000 FCFA' }, { label: 'Statut', value: 'En attente de réponse' }] });
  const archive = () => { setMessages(items => Object.fromEntries(Object.entries(items).filter(([name]) => name !== active))); setActive(names.find(name => name !== active) || ''); setMenu(false); notify('Conversation archivée.'); };
  const menuAction = action => { setMenu(false); notify(action); };

  return <main className="feature-page maintainer-action-page"><div className="feature-heading"><div><span className="reference-overline">MAINTENANCIER</span><h2>Messagerie</h2><p>Échangez avec vos clients et suivez vos interventions.</p></div><button className="feature-primary" onClick={newMessage}><Plus size={14} /> Nouveau message</button></div><div className="maintainer-message-layout"><section className="feature-panel"><header><h3>Conversations</h3><p>{Object.keys(messages).length} conversations.</p></header><label className="feature-toolbar"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une conversation..." /></label><div className="maintainer-conversations">{names.map(name => <button className={active === name ? 'active' : ''} key={name} onClick={() => selectConversation(name)}><span className="feature-avatar">{name[0]}</span><span><b>{name}</b><small>{messages[name].messages.at(-1)}</small></span>{messages[name].unread && <i />}</button>)}</div></section><section className="feature-panel maintainer-chat-panel"><header className="maintainer-chat-header"><div><span className="feature-avatar">{active[0]}</span><div><h3>{active}</h3><p>Conversation sécurisée · Intervention associée</p></div></div><div className="maintainer-chat-header-actions" ref={menuRef}><button className="farmer-message-icon" onClick={call} aria-label={`Appeler ${active}`} title="Appeler"><Phone size={15} /></button><button className="farmer-message-icon" onClick={quote} aria-label="Voir le devis" title="Devis"><FileText size={15} /></button><button className="farmer-message-icon" onClick={profile} aria-label="Voir le profil" title="Profil"><UserRound size={15} /></button><button className="farmer-message-icon" onClick={() => setMenu(value => !value)} aria-label="Options" title="Options"><MoreHorizontal size={15} /></button>{menu && <div className="maintainer-message-menu"><button onClick={() => menuAction('Conversation marquée comme lue.')}>Marquer comme lu</button><button onClick={() => menuAction('Conversation archivée.')}>Archiver</button><button onClick={archive}>Supprimer la conversation</button></div>}</div></header><div className="maintainer-chat-messages">{current?.messages.length ? current.messages.map((text, index) => <div className={index % 2 ? 'sent' : 'received'} key={`${text}-${index}`}>{text}<small>09:{15 + index}</small></div>) : <div className="reference-message-empty"><Send size={18} /><b>Aucun message</b><small>Écrivez votre premier message ci-dessous.</small></div>}</div><div className="farmer-message-composer"><MessageAttachmentButtons onSelect={file => setDraft(value => value || `Pièce jointe : ${file.name}`)} /><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => event.key === 'Enter' && send()} placeholder="Écrire un message..." /><button onClick={send} aria-label="Envoyer"><Send size={15} /></button></div></section></div></main>;
}
