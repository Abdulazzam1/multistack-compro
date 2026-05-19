import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './ServicesPage.module.css';

const EMPTY = { name:'', description:'', scope:'', icon:'', image:'', sort_order:0, is_active:true };

export default function ServicesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'new' | {existing}
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-services'],
    queryFn: () => api.get('/services').then(r => r.data.data),
  });
  const services = data || [];

  const openNew = () => { setForm(EMPTY); setModal('new'); };
  const openEdit = (s) => { setForm({ name:s.name||'', description:s.description||'', scope:s.scope||'', icon:s.icon||'', image:s.image||'', sort_order:s.sort_order||0, is_active:s.is_active!==false }); setModal(s); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'services');
      setForm(f => ({ ...f, image: res.data?.data?.path || res.data?.path }));
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Nama layanan wajib diisi.');
    setSaving(true);
    try {
      if (modal && modal !== 'new') await api.put(`/services/${modal.id}`, form);
      else await api.post('/services', form);
      qc.invalidateQueries(['cms-services']);
      setModal(null);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!confirm(`Hapus layanan "${s.name}"?`)) return;
    try { await api.delete(`/services/${s.id}`); qc.invalidateQueries(['cms-services']); } catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">LAYANAN</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah Layanan</button>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{modal === 'new' ? 'Tambah Layanan' : 'Edit Layanan'}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.row2}>
                <div><label className="form-label">Nama Layanan *</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                <div><label className="form-label">Icon (emoji)</label><input className="form-input" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} placeholder="❄" /></div>
              </div>
              <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
              <div><label className="form-label">Lingkup Pekerjaan (satu per baris)</label><textarea className="form-input" rows={6} value={form.scope} onChange={e=>setForm(f=>({...f,scope:e.target.value}))} placeholder={"Instalasi & Komisioning\nPreventive Maintenance\nSuku Cadang Original"} /></div>
              <div className={styles.row2}>
                <div><label className="form-label">Urutan</label><input type="number" className="form-input" value={form.sort_order} onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||0}))} /></div>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                  <label className={styles.toggle}><input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} /><span>Aktif</span></label>
                </div>
              </div>
              <div>
                <label className="form-label">Foto Layanan</label>
                {form.image && <div className={styles.imgPreview}><img src={imgUrl(form.image)} alt="layanan" /></div>}
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Foto'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
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

      <div className="card">
        {isLoading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--white70)' }}>Memuat...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table className="w-full">
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr><th className="th">Urutan</th><th className="th">Icon</th><th className="th">Nama Layanan</th><th className="th">Status</th><th className="th" style={{ textAlign:'right' }}>Aksi</th></tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td className="td" style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{s.sort_order}</td>
                    <td className="td" style={{ fontSize:'1.5rem' }}>{s.icon || '⚙'}</td>
                    <td className="td">
                      <p style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--white)' }}>{s.name}</p>
                      {s.description && <p style={{ fontSize:'0.75rem', color:'var(--white40)', maxWidth:380, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{s.description}</p>}
                    </td>
                    <td className="td"><span className={`badge ${s.is_active ? 'badge-green' : 'badge-gray'}`}>{s.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="td">
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.4rem' }}>
                        <button onClick={() => openEdit(s)} className="btn btn-outline btn-sm"><Pencil size={13}/> Edit</button>
                        <button onClick={() => handleDelete(s)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
