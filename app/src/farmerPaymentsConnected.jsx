import React, { useEffect, useState } from 'react';
import { Check, Download, FileText, LoaderCircle, Plus, WalletCards } from 'lucide-react';
import { resources } from './api/resources';
import { notify } from './ui';

const labels = { MTN_MOMO: 'MTN Mobile Money', MOOV_MONEY: 'Moov Money', FLOOZ: 'Flooz', CELTIS_SBIN: 'Celtis / SBIN' };

export function FarmerPaymentsConnected() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('MTN_MOMO');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [paymentData, invoiceData] = await Promise.all([resources.payments.list(), resources.payments.invoices()]);
      setPayments(Array.isArray(paymentData) ? paymentData : paymentData.items || []);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : invoiceData.items || []);
    } catch (reason) { setError(reason.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const initialize = async event => {
    event.preventDefault(); setSaving(true);
    try { const result = await resources.payments.initialize({ amountXof: Number(amount), provider }, `frontend-${Date.now()}-${Math.random()}`); setPayments(items => [result, ...items]); setOpen(false); setAmount(''); notify(result.status === 'FAILED' ? 'Le paiement a échoué.' : 'Paiement initialisé.'); }
    catch (reason) { notify(reason.message, 'error'); }
    finally { setSaving(false); }
  };
  const downloadInvoice = async id => { try { const result = await resources.payments.invoicePdf(id); const url = URL.createObjectURL(result.blob); const link = document.createElement('a'); link.href = url; link.download = result.filename; link.click(); URL.revokeObjectURL(url); } catch (reason) { notify(reason.message, 'error'); } };
  return <main className="feature-page farmer-context-page farmer-connected-payments"><div className="feature-heading"><div><span className="reference-overline">AGRICULTEUR · PAIEMENTS</span><h2>Paiements & Transactions</h2><p>Gérez vos fonds, transactions et factures.</p></div><div className="feature-heading-actions"><button className="feature-secondary" onClick={load}>Actualiser</button><button className="feature-primary" onClick={() => setOpen(true)}><Plus size={14} /> Nouveau paiement</button></div></div>{loading ? <div className="feature-loading"><LoaderCircle className="spin" size={20} /> Chargement...</div> : error ? <div className="feature-error-state"><b>Impossible de charger les paiements</b><small>{error}</small><button className="feature-secondary" onClick={load}>Réessayer</button></div> : <><div className="payment-maquette-grid"><section className="feature-balance-card payment-maquette-balance"><div className="payment-balance-top"><span>Transactions confirmées</span><span className="feature-status">{payments.length}</span></div><div className="payment-balance-value"><strong>{payments.filter(item => item.status === 'SUCCESS').reduce((sum, item) => sum + (item.amountXof || 0), 0).toLocaleString('fr-FR')}</strong><b>FCFA</b></div><small>Données retournées par AGRIMAC</small><div className="payment-maquette-actions"><button onClick={() => setOpen(true)}><WalletCards size={19} /><span>Payer</span></button><button onClick={() => setOpen(true)}><Plus size={19} /><span>Recharger</span></button><button onClick={() => document.getElementById('farmer-invoices')?.scrollIntoView({ behavior: 'smooth' })}><FileText size={19} /><span>Factures</span></button></div></section><section className="feature-panel payment-expense-panel"><header><div><h3>Factures disponibles</h3><p>Documents confirmés par le backend.</p></div></header>{invoices.length ? invoices.slice(0, 4).map(invoice => <div className="connected-invoice-row" key={invoice.id}><span><b>{invoice.invoiceNumber}</b><small>{invoice.description}</small></span><strong>{Number(invoice.amountXof).toLocaleString('fr-FR')} FCFA</strong><button onClick={() => downloadInvoice(invoice.id)}>PDF</button></div>) : <div className="feature-empty"><FileText size={20} /><small>Aucune facture disponible.</small></div>}</section></div><section className="feature-panel payment-history-panel"><header><div><h3>Historique des transactions</h3><p>{payments.length} opération(s) retournée(s) par le backend.</p></div></header><div className="payment-maquette-table">{payments.length ? payments.map(payment => <div className="payment-maquette-table-row" key={payment.id}><span>{new Date(payment.createdAt).toLocaleDateString('fr-FR')}</span><span className="payment-description"><b>{payment.reference}</b><small>{labels[payment.provider] || payment.provider}</small></span><span>{payment.request?.title || 'Paiement AGRIMAC'}</span><i className={payment.status === 'SUCCESS' ? 'success' : ''}>{payment.status}</i><strong>{Number(payment.amountXof).toLocaleString('fr-FR')} FCFA</strong><button onClick={() => notify(`Transaction ${payment.reference}`)}><FileText size={15} /></button></div>) : <div className="feature-empty"><WalletCards size={22} /><b>Aucune transaction</b><small>Vos paiements apparaîtront ici.</small></div>}</div></section><section id="farmer-invoices" className="feature-panel connected-invoices-panel"><header><div><h3>Factures</h3><p>Documents liés à vos paiements.</p></div></header>{invoices.map(invoice => <div className="connected-invoice-row" key={invoice.id}><span><b>{invoice.invoiceNumber}</b><small>{new Date(invoice.issuedAt).toLocaleDateString('fr-FR')} · {labels[invoice.provider] || invoice.provider}</small></span><strong>{Number(invoice.amountXof).toLocaleString('fr-FR')} {invoice.currency}</strong><button onClick={() => downloadInvoice(invoice.id)}><Download size={14} /> Télécharger PDF</button></div>)}</section></>}{open && <div className="connected-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}><section className="connected-request-modal" role="dialog" aria-modal="true"><header><div><span className="reference-overline">PAIEMENT</span><h3>Nouveau paiement</h3><p>Le backend retournera le statut de l’opération.</p></div></header><form onSubmit={initialize}><label>Montant (FCFA)<input type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)} required /></label><label>Moyen de paiement<select value={provider} onChange={event => setProvider(event.target.value)}><option value="MTN_MOMO">MTN Mobile Money</option><option value="MOOV_MONEY">Moov Money</option><option value="FLOOZ">Flooz</option><option value="CELTIS_SBIN">Celtis / SBIN</option></select></label><footer><button type="button" className="feature-secondary" onClick={() => setOpen(false)}>Annuler</button><button className="feature-primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={14} /> : <Check size={14} />} {saving ? 'Traitement...' : 'Continuer'}</button></footer></form></section></div>}</main>;
}
