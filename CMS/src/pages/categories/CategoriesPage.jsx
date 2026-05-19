import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import api from '@/services/api';
import { getErrorMsg } from '@/utils/helpers';

const EMPTY = { name:'', slug:'', description:'', icon:'', sort_order:0, type:'product', is_active:true };
const TYPE_OPTS = [{ value:'product', label:'Produk' },{ value:'portfolio', label:'Portfolio' },{ value:'news', label:'Berita' }];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });
  const categories = data || [];

  const openNew  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({ name:c.name||'', slug:c.slug||'', description:c.description||'', icon:c.icon||'', sort_order:c.sort_order||0, type:c.type||'product', is_active:c.is_active!==false }); setEditId(c.id); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Nama kategori wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/categories/${editId}`, form);
      else await api.post('/categories', form);
      qc.invalidateQueries(['cms-categories']);
      setModal(null);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Hapus kategori "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c.id}`); qc.invalidateQueries(['cms-categories']); } catch (err) { alert(getErrorMsg(err)); }
  };

  const TYPE_COLORS = { product:'badge-yellow', portfolio:'badge-green', news:'badge-gray' };

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">KATEGORI</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah Kategori</button>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, width:'100%', maxWidth:500, padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem' }}>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button style={{ background:'none', border:'none', color:'var(--white70)', cursor:'pointer' }} onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div><label className="form-label">Nama Kategori *</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                <div><label className="form-label">Slug (URL)</label><input className="form-input" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="otomatis dari nama" /></div>
              </div>
              <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
                <div><label className="form-label">Icon</label><input className="form-input" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} placeholder="❄" /></div>
                <div><label className="form-label">Tipe</label>
                  <select className="form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Urutan</label><input type="number" className="form-input" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||0}))} /></div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.85rem', color:'var(--white70)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} style={{ accentColor:'var(--red)', width:16, height:16 }} /><span>Aktif</span>
              </label>
            </div>
            <div style={{ padding:'1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(null)} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX:'auto' }}>
          {isLoading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--white70)' }}>Memuat...</div>
          ) : (
            <table style={{ width:'100%' }}>
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr><th className="th">Icon</th><th className="th">Nama</th><th className="th">Slug</th><th className="th">Tipe</th><th className="th">Urutan</th><th className="th">Status</th><th className="th" style={{ textAlign:'right' }}>Aksi</th></tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="td" style={{ fontSize:'1.4rem' }}>{c.icon || '—'}</td>
                    <td className="td"><p style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--white)' }}>{c.name}</p>{c.description && <p style={{ fontSize:'0.72rem', color:'var(--white40)', marginTop:2 }}>{c.description}</p>}</td>
                    <td className="td" style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--white70)' }}>{c.slug}</td>
                    <td className="td"><span className={`badge ${TYPE_COLORS[c.type] || 'badge-gray'}`}>{TYPE_OPTS.find(t=>t.value===c.type)?.label || c.type}</span></td>
                    <td className="td" style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{c.sort_order}</td>
                    <td className="td"><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="td">
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.4rem' }}>
                        <button onClick={() => openEdit(c)} className="btn btn-outline btn-sm"><Pencil size={13}/></button>
                        <button onClick={() => handleDelete(c)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && categories.length === 0 && <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada kategori.</div>}
        </div>
      </div>
    </div>
  );
}
