import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';

export function notify(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('agrimac:toast', { detail: { message, type } }));
}

export function openAction(action) {
  window.dispatchEvent(new CustomEvent('agrimac:action', { detail: action }));
}

export function downloadMock(filename, content = 'AGRIMAC - Export') {
  const documentPdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const rows = String(content).split('\n').filter(Boolean);
  documentPdf.setFillColor(16, 110, 63);
  documentPdf.rect(0, 0, 210, 28, 'F');
  documentPdf.setTextColor(255, 255, 255);
  documentPdf.setFont('helvetica', 'bold');
  documentPdf.setFontSize(18);
  documentPdf.text('AGRIMAC', 16, 13);
  documentPdf.setFont('helvetica', 'normal');
  documentPdf.setFontSize(9);
  documentPdf.text('Plateforme agricole du Benin', 16, 20);
  documentPdf.setTextColor(27, 28, 28);
  documentPdf.setFontSize(13);
  documentPdf.setFont('helvetica', 'bold');
  documentPdf.text(filename.replace(/\.(csv|xlsx|txt)$/i, ''), 16, 42);
  documentPdf.setFont('helvetica', 'normal');
  documentPdf.setFontSize(9);
  documentPdf.setTextColor(105, 117, 109);
  documentPdf.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, 16, 49);
  let y = 62;
  rows.forEach((row, index) => {
    if (y > 275) { documentPdf.addPage(); y = 20; }
    if (index === 0) {
      documentPdf.setFillColor(232, 243, 238);
      documentPdf.rect(14, y - 6, 182, 9, 'F');
      documentPdf.setTextColor(16, 110, 63);
      documentPdf.setFont('helvetica', 'bold');
    } else {
      documentPdf.setTextColor(52, 66, 57);
      documentPdf.setFont('helvetica', 'normal');
    }
    const columns = row.split('|');
    documentPdf.text(columns.slice(0, 5).join('    ').slice(0, 105), 18, y);
    documentPdf.setDrawColor(225, 235, 227);
    documentPdf.line(14, y + 4, 196, y + 4);
    y += 12;
  });
  const pages = documentPdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    documentPdf.setPage(page);
    documentPdf.setFont('helvetica', 'normal');
    documentPdf.setFontSize(8);
    documentPdf.setTextColor(130, 142, 133);
    documentPdf.text(`AGRIMAC - Page ${page}/${pages}`, 16, 289);
    documentPdf.text('Document mocke pret pour raccordement backend', 196, 289, { align: 'right' });
  }
  documentPdf.save(filename.replace(/\.(csv|xlsx|txt)$/i, '') + '.pdf');
  notify(`${filename.replace(/\.(csv|xlsx|txt)$/i, '')}.pdf a �t� t�l�charg�.`);
}

export function ToastHost() {
  const [toasts, setToasts] = useState([]);
  const [action, setAction] = useState(null);
  useEffect(() => {
    const onToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, ...event.detail }]);
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
    };
    window.addEventListener('agrimac:toast', onToast);
    return () => window.removeEventListener('agrimac:toast', onToast);
  }, []);
  useEffect(() => {
    const onAction = event => setAction(event.detail);
    window.addEventListener('agrimac:action', onAction);
    return () => window.removeEventListener('agrimac:action', onAction);
  }, []);
  const closeAction = () => setAction(null);
  const fields = action?.fields || [];
  const submit = event => { event.preventDefault(); action?.onSubmit?.(new FormData(event.currentTarget)); closeAction(); };
  return <><div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`toast ${toast.type}`} key={toast.id}><span>{toast.type === 'error' ? '!' : '?'}</span><p>{toast.message}</p><button data-action-handled="true" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Fermer">�</button></div>)}</div>{action && <div className="agrimac-context-overlay" onMouseDown={event => event.target === event.currentTarget && closeAction()}><section className={`agrimac-context-modal ${action.type === 'form' ? 'agrimac-context-form-modal' : ''}`} role="dialog" aria-modal="true"><button className="agrimac-context-close" onClick={closeAction} aria-label="Fermer">�</button><div className="agrimac-context-heading"><span className="agrimac-context-icon">{action.icon || '?'}</span><div><h3>{action.title}</h3><p>{action.description}</p></div></div>{action.type === 'detail' && <dl className="agrimac-action-fields">{fields.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>}{action.type === 'confirm' && <p className="agrimac-action-warning">Cette action modifiera l��tat de l��l�ment s�lectionn�.</p>}{action.type === 'form' && <form className="agrimac-inline-action-form" onSubmit={submit}><div className="agrimac-form-intro"><span>FORMULAIRE AGRIMAC</span><b>Les informations avec une �toile sont obligatoires.</b></div><div className="agrimac-form-fields">{fields.map(field => <label className={`agrimac-form-field ${field.multiline || field.type === 'file' ? 'is-wide' : ''} ${field.type === 'file' ? 'is-upload' : ''}`} key={field.name}><span>{field.label}{field.required && <i>*</i>}</span>{field.multiline ? <textarea name={field.name} defaultValue={field.value || ''} required={field.required} placeholder="D�crivez pr�cis�ment votre besoin..." /> : field.type === 'file' ? <><input className="agrimac-file-input" name={field.name} type="file" accept={field.accept || '*/*'} required={field.required} /><small>Formats accept�s : images ou PDF. Taille maximale recommand�e : 10 Mo.</small></> : <input name={field.name} defaultValue={field.value || ''} type={field.type || 'text'} required={field.required} placeholder={field.type === 'number' ? 'Ex : 85000' : field.type === 'date' ? '' : 'Saisissez une information'} />}</label>)}</div><footer><button type="button" className="secondary-action" onClick={closeAction}>Annuler</button><button className="primary-action">{action.submitLabel || 'Enregistrer'}</button></footer></form>}{action.type !== 'form' && <footer><button className="secondary-action" onClick={closeAction}>Fermer</button>{action.onConfirm && <button className="primary-action" onClick={() => { action.onConfirm(); closeAction(); }}>{action.submitLabel || 'Confirmer'}</button>}</footer>}</section></div>}</>;
}
