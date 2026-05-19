import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';

const EMPTY = { type:'penghargaan', title:'', image_url:'', issued_by:'', year:new Date().getFullYear(), description:'', show_on_home:false, sort_order:0, is_active:true };
const TYPE_OPTS = ['penghargaan','sertifikasi','standarisasi'];

export default function AwardsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-awards'],
    queryFn: () => api.get('/awards').then(r => r.data.data),
  });
  const items = data || [];

  const openNew  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (a) => { setForm({ type:a.type||'penghargaan', title:a.title||'', image_url:a.image_url||'', issued_by:a.issued_by||'', year:a.year||new Date().getFullYear(), description:a.description||'', show_on_home:a.show_on_home||false, sort_order:a.sort_order||0, is_active:a.is_active!==false }); setEditId(a.id); setModal(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'awards');
      setForm(f => ({ ...f, image_url: res.data?.data?.path || res.data?.path }));
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Judul wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/awards/${editId}`, form);
      else await api.post('/awards', form);
      qc.invalidateQueries(['cms-awards']);
      setModal(null);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (a) => {
    if (!confirm(`Hapus "${a.title}"?`)) return;
    try { await api.delete(`/awards/${a.id}`); qc.invalidateQueries(['cms-awards']); } catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">PENGHARGAAN & SERTIFIKASI</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah</button>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem' }}>{editId ? 'Edit' : 'Tambah'} Penghargaan</h2>
              <button style={{ background:'none', border:'none', color:'var(--white70)', cursor:'pointer' }} onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label className="form-label">Tipe</label>
                  <select className="form-input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {TYPE_OPTS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Tahun</label><input type="number" className="form-input" value={form.year} onChange={e=>setForm(f=>({...f,year:parseInt(e.target.value)||2024}))} /></div>
              </div>
              <div><label className="form-label">Judul *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
              <div><label className="form-label">Diberikan oleh</label><input className="form-input" value={form.issued_by} onChange={e=>setForm(f=>({...f,issued_by:e.target.value}))} placeholder="ISO, GBCI, dll." /></div>
              <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
              <div>
                <label className="form-label">Logo/Gambar</label>
                {form.image_url && <div style={{ width:80, height:80, overflow:'hidden', borderRadius:6, border:'1px solid var(--border)', marginBottom:'0.5rem' }}><img src={imgUrl(form.image_url)} alt="award" style={{ width:'100%', height:'100%', objectFit:'contain' }} /></div>}
                <label className="btn btn-outline" style={{ cursor:'pointer', width:'fit-content', display:'inline-flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem' }}>
                  <Upload size={13}/>{uploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
                </label>
              </div>
              <div style={{ display:'flex', gap:'1.5rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.83rem', color:'var(--white70)', cursor:'pointer' }}><input type="checkbox" checked={form.show_on_home} onChange={e=>setForm(f=>({...f,show_on_home:e.target.checked}))} style={{ accentColor:'var(--red)' }} /><span>Tampil di Beranda</span></label>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.83rem', color:'var(--white70)', cursor:'pointer' }}><input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} style={{ accentColor:'var(--red)' }} /><span>Aktif</span></label>
              </div>
            </div>
            <div style={{ padding:'1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(null)} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
        {isLoading ? [1,2,3,4].map(i=><div key={i} style={{ height:160, background:'var(--bg2)', borderRadius:8, animation:'pulse 1.5s ease infinite' }}/>) :
          items.map(a => (
            <div key={a.id} className="card" style={{ padding:'1.25rem', textAlign:'center', position:'relative' }}>
              <div style={{ position:'absolute', top:'0.5rem', right:'0.5rem', display:'flex', gap:'0.25rem' }}>
                <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" style={{ padding:'0.2rem' }}><Pencil size={12}/></button>
                <button onClick={() => handleDelete(a)} className="btn btn-danger btn-sm" style={{ padding:'0.2rem' }}><Trash2 size={12}/></button>
              </div>
              {a.image_url
                ? <img src={imgUrl(a.image_url)} alt={a.title} style={{ width:48, height:48, objectFit:'contain', margin:'0 auto 0.75rem' }} />
                : <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{a.type==='sertifikasi'?'🏅':'🏆'}</div>}
              <span className="badge badge-gray" style={{ marginBottom:'0.5rem', display:'inline-block' }}>{a.type}</span>
              <h4 style={{ fontSize:'0.85rem', fontWeight:700, marginBottom:'0.25rem', lineHeight:1.35 }}>{a.title}</h4>
              {a.issued_by && <p style={{ fontSize:'0.75rem', color:'var(--white70)' }}>{a.issued_by}</p>}
              {a.year && <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--red)', marginTop:'0.35rem' }}>{a.year}</p>}
            </div>
          ))}
      </div>
      {!isLoading && items.length === 0 && <div className="card" style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada penghargaan atau sertifikasi.</div>}
    </div>
  );
}
