import { useEffect, useMemo, useState } from 'react'
import { Image, Plus, Tag, Users, Heart, Search } from 'lucide-react'

function classNames(...c) {
  return c.filter(Boolean).join(' ')
}

function App() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ author_name: '', message: '', photo_url: '', tags: '' })
  const [activeTag, setActiveTag] = useState('')

  const backendBase = useMemo(() => {
    const envUrl = import.meta.env.VITE_BACKEND_URL
    if (envUrl && typeof envUrl === 'string' && envUrl.length > 0) return envUrl
    try {
      // Fallback: replace 3000 with 8000 (works in this environment)
      return window.location.origin.replace('3000', '8000')
    } catch {
      return ''
    }
  }, [])

  async function fetchMemories(tag) {
    if (!backendBase) {
      setError('Backend URL is missing. Set VITE_BACKEND_URL to your backend URL.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const url = new URL('/api/memories', backendBase)
      if (tag) url.searchParams.set('tag', tag)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setMemories(data)
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allTags = useMemo(() => {
    const s = new Set()
    memories.forEach(m => (m.tags || []).forEach(t => s.add(t)))
    return Array.from(s)
  }, [memories])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.author_name || !form.message) return
    const payload = {
      author_name: form.author_name.trim(),
      message: form.message.trim(),
      photo_url: form.photo_url.trim() || undefined,
      tags: form.tags
        ? form.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : undefined,
    }
    try {
      setLoading(true)
      setError('')
      const res = await fetch(new URL('/api/memories', backendBase).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Gagal menyimpan kenangan')
      setForm({ author_name: '', message: '', photo_url: '', tags: '' })
      fetchMemories(activeTag)
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-violet-50 to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/60 border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 grid place-items-center text-white shadow">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Memory Lane</h1>
              <p className="text-xs text-gray-500">Tempat cerita kita disimpan selamanya</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">Untuk kita dan sahabat-sahabat tersayang</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Intro */}
        <section className="mb-8">
          <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tulis kenangan baru</h2>
            <p className="text-sm text-gray-600 mb-4">Cerita kecil, foto, atau pesan hangat — semua akan tetap ada di sini.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Namamu</label>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={e => setForm({ ...form, author_name: e.target.value })}
                  placeholder="mis. Adit, Rani, dll"
                  className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Image className="h-4 w-4"/>Foto (opsional)</label>
                <input
                  type="url"
                  value={form.photo_url}
                  onChange={e => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="Tempel URL gambar"
                  className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Ceritamu</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tulis momen yang ingin diingat..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  required
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Tag className="h-4 w-4"/>Tag (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="contoh: sekolah, liburan, lucu"
                  className="w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Search className="h-4 w-4"/>
                  <span>Filter dengan tag untuk menemukan momen tertentu</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={classNames(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white shadow',
                    loading ? 'bg-violet-300' : 'bg-violet-600 hover:bg-violet-700'
                  )}
                >
                  <Plus className="h-4 w-4"/>
                  Simpan Kenangan
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Tags */}
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setActiveTag(''); fetchMemories('') }}
              className={classNames(
                'px-3 py-1.5 rounded-full text-sm border',
                activeTag === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gray-100'
              )}
            >
              Semua
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTag(t); fetchMemories(t) }}
                className={classNames(
                  'px-3 py-1.5 rounded-full text-sm border flex items-center gap-1.5',
                  activeTag === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-violet-50'
                )}
              >
                <Tag className="h-3.5 w-3.5" /> {t}
              </button>
            ))}
          </div>
        </section>

        {/* Memories grid */}
        <section>
          {loading ? (
            <p className="text-gray-500">Memuat...</p>
          ) : memories.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed bg-white/60">
              <p className="text-gray-600">Belum ada kenangan. Mulai dengan menulis cerita pertamamu di atas.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {memories.map(mem => (
                <li key={mem.id} className="group rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                  {mem.photo_url ? (
                    <div className="relative aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mem.photo_url} alt="memory" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-violet-100 to-pink-100 grid place-items-center text-violet-500">
                      <Image className="h-8 w-8 opacity-70" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">oleh <span className="font-medium text-gray-700">{mem.author_name}</span></p>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{mem.message}</p>
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mem.tags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                            <Tag className="h-3 w-3"/> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
          Dibuat dengan penuh kasih. Semoga cerita-cerita ini tetap hidup selamanya.
        </div>
      </footer>
    </div>
  )
}

export default App
