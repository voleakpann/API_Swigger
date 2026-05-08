'use client';

import { useEffect, useState } from 'react';
import { api, type Item } from '@/lib/api';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      setItems(await api.listItems());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      await api.createItem({
        name: name.trim(),
        description: description.trim() || undefined,
        price: price.trim() || undefined,
      });
      setName('');
      setDescription('');
      setPrice('');
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm(`Delete item #${id}?`)) return;
    try {
      await api.deleteItem(id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-white">Items</h1>
        <p className="text-sm text-slate-400 mt-1">
          {loading ? 'Loading…' : `${items.length} item(s)`}
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-white font-semibold">Create item</h2>
        <form
          onSubmit={onCreate}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]"
        >
          <input
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            required
            maxLength={100}
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          <input
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 px-4 py-2 text-sm font-medium text-black"
          >
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </form>
      </section>

      {err && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {err}
        </div>
      )}

      <section className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 w-16">ID</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2 w-24">Price</th>
              <th className="text-right px-4 py-2 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No items yet — create one above.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-400">{it.id}</td>
                <td className="px-4 py-3 text-white">{it.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  {it.description ?? <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {it.price ?? <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(it.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
