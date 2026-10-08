import React, { useRef, useState } from 'react';
import { FileText, Image, Paperclip } from 'lucide-react';

export function MessageAttachmentButtons({ onSelect, className = '' }) {
  const imageInput = useRef(null);
  const documentInput = useRef(null);
  const [selected, setSelected] = useState(null);
  const choose = file => { if (!file) return; setSelected(file); onSelect?.(file); };
  return <div className={`message-attachment-actions ${className}`}><button type="button" onClick={() => imageInput.current?.click()} aria-label="Ajouter une photo" title="Photo"><Image size={16} /></button><button type="button" onClick={() => documentInput.current?.click()} aria-label="Ajouter un document" title="Document"><Paperclip size={16} /></button><input ref={imageInput} hidden type="file" accept="image/*" onChange={event => choose(event.target.files?.[0])} /><input ref={documentInput} hidden type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={event => choose(event.target.files?.[0])} />{selected && <span className="message-attachment-name" title={selected.name}><FileText size={12} /> {selected.name}</span>}</div>;
}
