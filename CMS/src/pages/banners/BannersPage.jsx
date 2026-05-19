import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';

const EMPTY = { title:'', image_url:'', link_url:'', sort_order:0, is_active:true };

export default function BannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-banners'],
    queryFn: () => api.get('/banner').then(r => r.data.data),
  });
  const banners = data || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'banners');
      const path = res.data?.data?.path || res.data?.path;
      setForm(f => ({ ...f, image_url: path }));
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.image_url) return alert('Gambar banner wajib diupload.');
    setSaving(true);
    try {
      await api.post('/banner', form);
      qc.invalidateQueries(['cms-banners']);
      setForm(EMPTY); setShowForm(false);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus banner ini?')) return;
    try { await api.delete(`/banner/${id}`); qc.invalidateQueries(['cms-banners']); } catch (err) { alert(getErrorMsg(err)); }
  };

  const toggleActive = async (b) => {
    try { await api.put(`/banner/${b.id}`, { ...b, is_active: !b.is_active }); qc.invalidateQueries(['cms-banners']); } catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <h1 className="page-title">BANNER</h1>
        <button onClick={() => setShowForm(v => !v)} className="btn btn-primary"><Plus size={16}/> Tambah Banner</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', marginBottom:'1rem' }}>Banner Baru</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <div><label className="form-label">Judul Banner</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Opsional" /></div>
            <div><label className="form-label">URL Tujuan (Link)</label><input className="form-input" value={form.link_url} onChange={e=>setForm(f=>({...f,link_url:e.target.value}))} placeholder="https://..." /></div>
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label className="form-label">Gambar Banner *</label>
            {form.image_url && (
              <div style={{ aspectRatio:'16/5', overflow:'hidden', borderRadius:6, border:'1px solid var(--border)', marginBottom:'0.5rem' }}>
                <img src={imgUrl(form.image_url)} alt="banner" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            )}
            <label className="btn btn-outline" style={{ cursor:'pointer', width:'fit-content', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
              <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Gambar Banner'}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
            </label>
            <p style={{ fontSize:'0.72rem', color:'var(--white40)', marginTop:'0.35rem' }}>Rekomendasi: 1920×600px atau 16:5 ratio</p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Banner'}</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn btn-outline">Batal</button>
          </div>
        </div>
      )}

      {/* Banner List */}
      {isLoading ? (
        <div style={{ color:'var(--white70)', padding:'2rem' }}>Memuat...</div>
      ) : banners.length === 0 ? (
        <div className="card" style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada banner. Tambahkan banner pertama Anda.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {banners.map((b, i) => (
            <div key={b.id} className="card" style={{ padding:0, overflow:'hidden', display:'flex', alignItems:'stretch' }}>
              {/* Thumb */}
              <div style={{ width:200, flexShrink:0, background:'var(--bg3)', position:'relative' }}>
                {b.image_url
                  ? <img src={imgUrl(b.image_url)} alt={b.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', opacity:0.3 }}>🖼</div>}
                <div style={{ position:'absolute', top:8, left:8, background:'var(--bg)', borderRadius:4, padding:'2px 6px', fontSize:'0.65rem', fontFamily:'var(--font-mono)', color:'var(--white70)' }}>#{i+1}</div>
              </div>
              {/* Info */}
              <div style={{ flex:1, padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, fontSize:'0.88rem', marginBottom:'0.25rem' }}>{b.title || '(tanpa judul)'}</p>
                  {b.link_url && <p style={{ fontSize:'0.75rem', color:'var(--white70)', fontFamily:'var(--font-mono)' }}>{b.link_url}</p>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                  <button onClick={() => toggleActive(b)} className={`badge ${b.is_active ? 'badge-green' : 'badge-gray'}`} style={{ cursor:'pointer', border:'none' }}>
                    {b.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
