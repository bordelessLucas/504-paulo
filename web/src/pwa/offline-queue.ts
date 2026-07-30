const QUEUE_KEY = 'vertek.offline.queue.v1';

export type OfflineQueueItem = {
  id: string;
  createdAt: string;
  label: string;
  payload: Record<string, unknown>;
};

function readQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: OfflineQueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function getOfflineQueue(): OfflineQueueItem[] {
  return readQueue();
}

export function enqueueOfflineAction(label: string, payload: Record<string, unknown> = {}) {
  const items = readQueue();
  items.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    label,
    payload,
  });
  writeQueue(items);
  return items.length;
}

export function clearOfflineQueue() {
  writeQueue([]);
}

export function removeOfflineQueueItem(id: string) {
  writeQueue(readQueue().filter((item) => item.id !== id));
}
