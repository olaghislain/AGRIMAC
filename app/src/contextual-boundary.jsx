import React, { useEffect, useRef } from 'react';
import { downloadMock, openAction } from './ui';

function textOf(element) { return element?.innerText?.trim().replace(/\s+/g, ' ') || ''; }
function fieldsFrom(element, labels = []) { const text = textOf(element); const parts = text.split('·').map(value => value.trim()).filter(Boolean); return parts.slice(0, 6).map((value, index) => ({ label: labels[index] || `Information ${index + 1}`, value })); }

export function ContextualBoundary({ role, title, children }) {
  const root = useRef(null);
  useEffect(() => {
    const handle = event => {
      const button = event.target.closest('button');
      if (!button || !root.current?.contains(button) || button.dataset.actionHandled || button.type === 'submit') return;
      const label = textOf(button).toLowerCase();
      if (!label || /grille|toutes|machines|services|réparateurs|réinitialiser|simplifié|avancé|étoile/i.test(label)) return;
      if (/carte/i.test(label) && role === 'agriculteur') { event.preventDefault(); event.stopPropagation(); openAction({ type: 'detail', icon: '⌖', title: 'Carte des résultats', description: 'Machines, services et prestataires proches de votre position.', fields: [{ label: 'Zone', value: 'Cotonou · Abomey-Calavi · Parakou' }, { label: 'Résultats', value: '8 éléments disponibles' }] }); return; }
      const card = button.closest('article,.feature-result-card,.favorite-card,.notification-reference-card,.feature-notification-feed > article,.data-table > div,.rich-table-row,.enterprise-documents > button,.enterprise-setting-row');
      const selected = textOf(card || button.parentElement);
      const itemTitle = selected.split('·')[0].trim() || title;
      if (role === 'agriculteur' && /publier une demande/i.test(label)) { event.preventDefault(); event.stopPropagation(); window.dispatchEvent(new CustomEvent('agrimac:open-publish-request')); return; }
       if (role === 'agriculteur' && /nouvelle demande/i.test(label)) {
        event.preventDefault(); event.stopPropagation(); openAction({ type: 'form', icon: '+', title: label.includes('publier') ? 'Publier une demande' : 'Nouvelle demande', description: 'Cr�ez une demande AGRIMAC avec son besoin, sa localisation et son niveau d�urgence.', submitLabel: 'Publier', fields: [{ name: 'kind', label: 'Type de demande', required: true }, { name: 'title', label: 'Titre du besoin', required: true }, { name: 'description', label: 'Description', multiline: true, required: true }, { name: 'equipment', label: 'Machine ou �quipement concern�' }, { name: 'location', label: 'Localisation', required: true }, { name: 'date', label: 'Date souhait�e', type: 'date' }, { name: 'urgency', label: 'Urgence' }, { name: 'budget', label: 'Budget indicatif XOF', type: 'number' }, { name: 'photo', label: 'Photos ou pi�ces jointes', type: 'file', accept: 'image/*,.pdf' }] }); return;
      }
      if (role === 'agriculteur' && /voir le détail|voir détails|voir$/i.test(label)) { event.preventDefault(); event.stopPropagation(); openAction({ type: 'detail', icon: '⌕', title: itemTitle, description: `Détails de l’élément sélectionné dans ${title}.`, fields: fieldsFrom(card, ['Élément', 'Prestataire', 'Montant', 'Statut', 'Date']) }); return; }
      if (role === 'agriculteur' && /réserver|contacter/i.test(label)) { event.preventDefault(); event.stopPropagation(); openAction({ type: label.includes('réserver') ? 'form' : 'form', icon: label.includes('réserver') ? '◷' : '✉', title: label.includes('réserver') ? `Réserver ${itemTitle}` : `Contacter ${itemTitle}`, description: label.includes('réserver') ? 'Choisissez la date et confirmez votre réservation.' : 'Rédigez un message au prestataire sélectionné.', submitLabel: label.includes('réserver') ? 'Confirmer la réservation' : 'Envoyer', fields: label.includes('réserver') ? [{ name: 'date', label: 'Date souhaitée', type: 'date', required: true }, { name: 'duration', label: 'Durée', required: true }, { name: 'message', label: 'Message', multiline: true }] : [{ name: 'message', label: 'Message', multiline: true, required: true }] }); return; }
      if (role === 'agriculteur' && /consulter|noter|ajouter une photo|ajuster|informations personnelles|mot de passe|authentification|sélecteur de photo|sélecteur de localisation/i.test(label)) { event.preventDefault(); event.stopPropagation(); const isFile = /photo/i.test(label); const isPassword = /mot de passe|authentification/i.test(label); openAction({ type: isFile || isPassword ? 'form' : 'detail', icon: isFile ? '↑' : isPassword ? '🔒' : '⌕', title: label, description: `Action contextualisée pour ${itemTitle}.`, submitLabel: isFile ? 'Choisir' : isPassword ? 'Enregistrer' : undefined, fields: isFile ? [{ name: 'file', label: 'Photo', type: 'file', required: true }] : isPassword ? [{ name: 'current', label: 'Mot de passe actuel', type: 'password', required: true }, { name: 'next', label: 'Nouveau mot de passe', type: 'password', required: true }] : fieldsFrom(card, ['Notification', 'Détail', 'Date']) }); return; }
      if (role === 'agriculteur' && /accepter|payer|refuser|demander un devis|réparation/i.test(label)) {
        event.preventDefault();
        const isPay = /payer/i.test(label);
        const isReject = /refuser/i.test(label);
        openAction({ type: isReject ? 'confirm' : 'form', icon: isPay ? '₣' : isReject ? '×' : '✉', title: `${label.charAt(0).toUpperCase()}${label.slice(1)} · ${itemTitle}`, description: isPay ? `Paiement lié à ${itemTitle}. Vérifiez le montant et le moyen de paiement.` : isReject ? `Confirmez le refus de ${itemTitle}.` : `Action appliquée à ${itemTitle}.`, submitLabel: isReject ? 'Confirmer le refus' : isPay ? 'Confirmer le paiement' : 'Envoyer', fields: isReject ? [{ label: 'Élément', value: itemTitle }, { label: 'Motif', value: 'À renseigner dans la confirmation' }] : isPay ? [{ name: 'amount', label: 'Montant XOF', type: 'number', required: true }, { name: 'operator', label: 'Moyen de paiement', required: true }, { name: 'phone', label: 'Numéro', required: true }] : [{ name: 'message', label: 'Message ou précision', multiline: true, required: true }] });
        return;
      }
      if (role === 'entreprise' && /aperçu/i.test(label)) { event.preventDefault(); event.stopPropagation(); openAction({ type: 'detail', icon: '◉', title: `Aperçu · ${itemTitle}`, description: 'Aperçu du rapport ou contenu sélectionné.', fields: fieldsFrom(card, ['Rapport', 'Format', 'Période', 'Description']) }); return; }
      if (role === 'entreprise' && /documents|rccm|attestation|rib/i.test(label)) { event.preventDefault(); event.stopPropagation(); openAction({ type: 'detail', icon: '▤', title: itemTitle, description: 'Document officiel associé à votre entreprise.', fields: fieldsFrom(card, ['Document', 'Mise à jour', 'Statut']) }); return; }
      if (role === 'entreprise' && /mot de passe|informations du compte|sécurité/i.test(label)) { event.preventDefault(); event.stopPropagation(); openAction({ type: 'form', icon: '🔒', title: itemTitle, description: 'Mettez à jour les informations de sécurité de votre compte.', submitLabel: 'Enregistrer', fields: [{ name: 'value', label: 'Nouvelle valeur', required: true }, { name: 'note', label: 'Note', multiline: true }] }); return; }
      if (role === 'entreprise' && /export csv/i.test(label)) { event.preventDefault(); event.stopPropagation(); downloadMock('export-statistiques-entreprise', `Action|${label}
Page|${title}
Donnée|Export contextualisé`); return; }
    };
    root.current?.addEventListener('click', handle);
    return () => root.current?.removeEventListener('click', handle);
  }, [role, title]);
  const directAction = event => {
    const button = event.target.closest('button');
    if (!button || button.dataset.actionHandled || button.type === 'submit') return;
    const label = textOf(button).toLowerCase();
    const card = button.closest('article,.feature-result-card,.favorite-card,.notification-reference-card');
    const itemTitle = textOf(card || button.parentElement).split('·')[0].trim() || title;
    if (role === 'agriculteur' && /publier une demande/i.test(label)) { event.preventDefault(); event.stopPropagation(); window.dispatchEvent(new CustomEvent('agrimac:open-publish-request')); return; }
       if (role === 'agriculteur' && /nouvelle demande/i.test(label)) {
      event.preventDefault();
      openAction({ type: 'form', icon: '+', title: label.includes('publier') ? 'Publier une demande' : 'Nouvelle demande', description: 'Cr�ez une demande AGRIMAC avec son besoin, sa localisation et son niveau d�urgence.', submitLabel: 'Publier', fields: [{ name: 'kind', label: 'Type de demande', required: true }, { name: 'title', label: 'Titre du besoin', required: true }, { name: 'description', label: 'Description', multiline: true, required: true }, { name: 'location', label: 'Localisation', required: true }, { name: 'urgency', label: 'Urgence' }, { name: 'budget', label: 'Budget indicatif XOF', type: 'number' }, { name: 'photo', label: 'Photos ou pi�ces jointes', type: 'file', accept: 'image/*,.pdf' }] });
    } else if (role === 'agriculteur' && /voir le détail|voir détails/i.test(label)) {
      event.preventDefault();
      openAction({ type: 'detail', icon: '⌕', title: itemTitle, description: `Détails de ${itemTitle}.`, fields: fieldsFrom(card, ['Élément', 'Prestataire', 'Montant', 'Statut', 'Date']) });
    }
  };
  return <div ref={root} onClick={directAction} className="contextual-action-boundary">{children}</div>;
}



