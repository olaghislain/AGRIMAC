import { useEffect, useState } from 'react';
import { resources } from './resources';

export function useNotifications() {
  const [state, setState] = useState({ items: [], unread: 0, loading: true, error: null });
  const reload = async () => { try { const data = await resources.notifications.list({ limit: 20, skip: 0 }); setState({ items: data.items || [], unread: data.unread || 0, loading: false, error: null }); } catch (error) { setState(current => ({ ...current, loading: false, error })); } };
  useEffect(() => { reload(); const handleUpdate = () => reload(); window.addEventListener('agrimac:notifications-updated', handleUpdate); return () => window.removeEventListener('agrimac:notifications-updated', handleUpdate); }, []);
  return { ...state, reload, markRead: async id => { await resources.notifications.read(id); await reload(); }, markAllRead: async () => { await resources.notifications.readAll(); await reload(); } };
}
