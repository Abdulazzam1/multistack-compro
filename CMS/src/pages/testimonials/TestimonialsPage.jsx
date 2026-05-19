import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import api from '@/services/api';
import { getErrorMsg } from '@/utils/helpers';

const EMPTY = { client_name:'', client_title:'', client_company:'', content:'', rating:5, is_active:true };

export default function TestimonialsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-testimonials'],
    queryFn: () => api.get('/testimonials').then(r => r.data.data),
  });
  const items = data || [];

  const openNew  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (t) => { setForm({ client_name:t.client_name||'', client_title:t.client_title||'', client_company:t.client_company||'', content:t.content||'', rating:t.rating||5, is_active:t.is_active!==false }); setEditId(t.id); setModal(true); };

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.content.trim()) return alert('Nama klien dan testimoni wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/testimonials/${editId}`, form);
      else await api.post('/testimonials', form);
      qc.invalidateQueries(['cms-testimonials']);
      setModal(null);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Hapus testimoni dari "${t.client_name}"?`)) return;
    try { await api.delete(`/testimonials/${t.id}`); qc.invalidateQueries(['cms-testimonials']); } catch (err) { alert(getErrorMsg(err)); }
  };

  const Stars = ({ rating }) => (
    <span style={{ color:'var(--red)', fontSize:'0.85rem' }}>{Array.from({length:5}).map((_,i)=>i<rating?'★':'☆').join('')}</span>
  );

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">TESTIMONI</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah Testimoni</button>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, width:'100%', maxWidth:540, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem' }}>{editId ? 'Edit Testimoni' : 'Tambah Testimoni'}</h2>
              <button style={{ background:'none', border:'none', color:'var(--white70)', cursor:'pointer' }} onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div><label className="form-label">Nama Klien *</label><input className="form-input" value={form.client_name} onChange={e=>setForm(f=>({...f,client_name:e.target.value}))} /></div>
                <div><label className="form-label">Jabatan</label><input className="form-input" value={form.client_title} onChange={e=>setForm(f=>({...f,client_title:e.target.value}))} placeholder="Facility Manager" /></div>
              </div>
              <div><label className="form-label">Perusahaan</label><input className="form-input" value={form.client_company} onChange={e=>setForm(f=>({...f,client_company:e.target.value}))} /></div>
              <div><label className="form-label">Isi Testimoni *</label><textarea className="form-input" rows={4} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} /></div>
              <div>
                <label className="form-label">Rating</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f=>({...f,rating:n}))} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color: n <= form.rating ? 'var(--red)' : 'var(--white40)', transition:'color 0.2s' }}>★</button>
                  ))}
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.85rem', color:'var(--white70)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} style={{ accentColor:'var(--red)', width:16, height:16 }} /><span>Aktif (tampil di website)</span>
              </label>
            </div>
            <div style={{ padding:'1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(null)} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
        {isLoading ? [1,2,3].map(i=><div key={i} style={{ height:180, background:'var(--bg2)', borderRadius:8, animation:'pulse 1.5s ease infinite' }}/>) :
          items.map(t => (
            <div key={t.id} className="card" style={{ padding:'1.5rem', position:'relative' }}>
              <div style={{ position:'absolute', top:'1rem', right:'1rem', display:'flex', gap:'0.35rem' }}>
                <button onClick={() => openEdit(t)} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}><Pencil size={13}/></button>
                <button onClick={() => handleDelete(t)} className="btn btn-danger btn-sm" style={{ padding:'0.25rem' }}><Trash2 size={13}/></button>
              </div>
              <Stars rating={t.rating} />
              <p style={{ fontSize:'0.85rem', color:'var(--white70)', margin:'0.75rem 0', lineHeight:1.7, fontStyle:'italic' }}>"{t.content}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'auto' }}>
                <div style={{ width:36, height:36, background:'var(--red)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:'0.9rem', color:'#fff', flexShrink:0 }}>
                  {t.client_name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.82rem' }}>{t.client_name}</p>
                  <p style={{ fontSize:'0.72rem', color:'var(--white70)' }}>{t.client_title}{t.client_company ? ` — ${t.client_company}` : ''}</p>
                </div>
              </div>
              {!t.is_active && <span className="badge badge-gray" style={{ position:'absolute', bottom:'1rem', right:'1rem' }}>Nonaktif</span>}
            </div>
          ))}
      </div>
      {!isLoading && items.length === 0 && <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada testimoni.</div>}
    </div>
  );
}
