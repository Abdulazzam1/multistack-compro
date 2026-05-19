import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './PortfolioPage.module.css';

const EMPTY = { title:'', client:'', location:'', category:'', description:'', scope:'', images:[], year:new Date().getFullYear(), is_featured:false, is_active:true, show_on_home:false };

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-portfolio'],
    queryFn: () => api.get('/portfolio').then(r => r.data.data),
  });
  const items = data || [];

  const openNew  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ title:p.title||'', client:p.client||'', location:p.location||'', category:p.category||'', description:p.description||'', scope:p.scope||'', images:p.images||[], year:p.year||new Date().getFullYear(), is_featured:p.is_featured||false, is_active:p.is_active!==false, show_on_home:p.show_on_home||false });
    setEditId(p.id); setModal(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'portfolio');
      setForm(f => ({ ...f, images: [...f.images, res.data?.data?.path || res.data?.path] }));
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Judul proyek wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/portfolio/${editId}`, form);
      else await api.post('/portfolio', form);
      qc.invalidateQueries(['cms-portfolio']);
      setModal(null);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Hapus portfolio "${p.title}"?`)) return;
    try { await api.delete(`/portfolio/${p.id}`); qc.invalidateQueries(['cms-portfolio']); } catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">PORTFOLIO</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah Proyek</button>
      </div>

      {modal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Edit Proyek' : 'Tambah Proyek'}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div className={styles.modalBody}>
              <div><label className="form-label">Judul Proyek *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
              <div className={styles.row2}>
                <div><label className="form-label">Klien</label><input className="form-input" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} /></div>
                <div><label className="form-label">Lokasi</label><input className="form-input" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} /></div>
              </div>
              <div className={styles.row2}>
                <div><label className="form-label">Kategori</label><input className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Gedung Komersial, Hotel, dll." /></div>
                <div><label className="form-label">Tahun</label><input type="number" className="form-input" value={form.year} onChange={e=>setForm(f=>({...f,year:parseInt(e.target.value)||2024}))} /></div>
              </div>
              <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
              <div><label className="form-label">Lingkup Pekerjaan (satu per baris)</label><textarea className="form-input" rows={5} value={form.scope} onChange={e=>setForm(f=>({...f,scope:e.target.value}))} /></div>
              <div className={styles.checkRow}>
                <label className={styles.toggle}><input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} /><span>Unggulan</span></label>
                <label className={styles.toggle}><input type="checkbox" checked={form.show_on_home} onChange={e=>setForm(f=>({...f,show_on_home:e.target.checked}))} /><span>Tampil di Beranda</span></label>
                <label className={styles.toggle}><input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} /><span>Aktif</span></label>
              </div>
              <div>
                <label className="form-label">Foto Proyek</label>
                <div className={styles.imgGrid}>
                  {form.images.map((img,i) => (
                    <div key={i} className={styles.imgWrap}>
                      <img src={imgUrl(img)} alt="" />
                      <button onClick={() => setForm(f=>({...f,images:f.images.filter((_,idx)=>idx!==i)}))}>✕</button>
                    </div>
                  ))}
                </div>
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Foto'}
                  <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button onClick={() => setModal(null)} className="btn btn-outline">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {isLoading ? [1,2,3,4,5,6].map(i=><div key={i} className={styles.skeleton}/>) : items.map(p => (
          <div key={p.id} className={`card ${styles.card}`}>
            <div className={styles.cardImg}>
              {p.images?.[0]
                ? <img src={imgUrl(p.images[0])} alt={p.title} />
                : <div className={styles.imgPlaceholder}>🏗</div>}
            </div>
            <div className={styles.cardBody}>
              <div style={{ display:'flex', gap:'4px', marginBottom:'0.5rem', flexWrap:'wrap' }}>
                {p.is_featured && <span className="badge badge-yellow">Unggulan</span>}
                <span className="badge badge-gray">{p.category || '—'}</span>
                {p.year && <span className="badge badge-gray">{p.year}</span>}
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              {p.client && <p className={styles.cardClient}>📍 {p.location} — {p.client}</p>}
            </div>
            <div className={styles.cardActions}>
              <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm"><Pencil size={13}/> Edit</button>
              <button onClick={() => handleDelete(p)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
      {!isLoading && items.length === 0 && <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>Belum ada portfolio.</div>}
    </div>
  );
}
