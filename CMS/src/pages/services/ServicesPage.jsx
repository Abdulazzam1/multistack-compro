import { useState }   from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api            from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './ServicesPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

const EMPTY = { name:'', description:'', scope:'', icon:'', image:'', sort_order:0, is_active:true };

export default function ServicesPage() {
  const qc = useQueryClient();
  const [open,      setOpen]     = useState(false);
  const [editData,  setEditData] = useState(null);   // data asli untuk edit
  const [form,      setForm]     = useState(EMPTY);
  const [saving,    setSaving]   = useState(false);
  const [uploading, setUploading]= useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-services'],
    queryFn:  () => api.get('/services').then(r => r.data.data),
  });
  const services = data || [];

  const openNew = () => {
    setForm(EMPTY);
    setEditData(null);
    setOpen(true);
  };

  // Isi form dengan data existing saat edit
  const openEdit = (s) => {
    setForm({
      name:        s.name        ?? '',
      description: s.description ?? '',
      scope:       s.scope       ?? '',
      icon:        s.icon        ?? '',
      image:       s.image       ?? '',
      sort_order:  s.sort_order  ?? 0,
      is_active:   s.is_active   !== false,
    });
    setEditData(s);
    setOpen(true);
  };

  const closeModal = () => { setOpen(false); setEditData(null); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      if (editData) await api.put(`/services/${editData.id}`, form);
      else          await api.post('/services', form);
      qc.invalidateQueries(['cms-services']);
      closeModal();
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Hapus layanan "${s.name}"?`)) return;
    try { await api.delete(`/services/${s.id}`); qc.invalidateQueries(['cms-services']); }
    catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">LAYANAN</h1>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={16}/> Tambah Layanan
        </button>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={modal.modal} onClick={e => e.stopPropagation()}>

            <div className={modal.header}>
              <h2>{editData ? 'Edit Layanan' : 'Tambah Layanan'}</h2>
              <button className={modal.closeBtn} onClick={closeModal}><X size={18}/></button>
            </div>

            <div className={modal.body}>
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Nama Layanan *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    placeholder="HVAC & Refrigerasi" />
                </div>
                <div>
                  <label className="form-label">Icon (emoji)</label>
                  <input className="form-input" value={form.icon}
                    onChange={e => setForm(f => ({...f, icon: e.target.value}))}
                    placeholder="❄" />
                </div>
              </div>

              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Penjelasan singkat layanan..." />
              </div>

              <div>
                <label className="form-label">
                  Lingkup Pekerjaan
                  <span style={{color:'var(--white40)',fontFamily:'var(--font-mono)',fontSize:'0.62rem',textTransform:'none',letterSpacing:0,marginLeft:'0.5rem'}}>
                    (satu item per baris)
                  </span>
                </label>
                <textarea className="form-input" rows={6} value={form.scope}
                  onChange={e => setForm(f => ({...f, scope: e.target.value}))}
                  placeholder={"Instalasi & Komisioning\nPreventive Maintenance\nSuku Cadang Original"} />
              </div>

              <div className={modal.row2}>
                <div>
                  <label className="form-label">Urutan Tampil</label>
                  <input type="number" className="form-input" value={form.sort_order}
                    onChange={e => setForm(f => ({...f, sort_order: parseInt(e.target.value) || 0}))}
                    min={0} />
                </div>
                <div style={{display:'flex', alignItems:'flex-end', paddingBottom:'0.3rem'}}>
                  <label className={modal.toggle}>
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                    <span>Aktif (tampil di website)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Foto Layanan</label>
                {form.image && (
                  <div className={modal.imgPreview}>
                    <img src={imgUrl(form.image)} alt="preview layanan" />
                  </div>
                )}
                <label className={`btn btn-outline ${modal.uploadBtn}`}>
                  <Upload size={14}/>
                  {uploading ? 'Mengupload...' : form.image ? 'Ganti Foto' : 'Upload Foto'}
                  <input type="file" accept="image/*" onChange={handleUpload}
                    disabled={uploading} style={{display:'none'}} />
                </label>
                {form.image && (
                  <button className="btn btn-ghost btn-sm" style={{marginTop:'0.35rem'}}
                    onClick={() => setForm(f => ({...f, image: ''}))}>
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>

            <div className={modal.footer}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan Layanan'}
              </button>
              <button className="btn btn-outline" onClick={closeModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabel ── */}
      <div className="card">
        <div style={{overflowX:'auto'}}>
          {isLoading ? (
            <div style={{padding:'2rem', textAlign:'center', color:'var(--white70)'}}>Memuat...</div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead style={{background:'var(--bg3)', borderBottom:'1px solid var(--border)'}}>
                <tr>
                  <th className="th" style={{width:50}}>No</th>
                  <th className="th" style={{width:50}}>Icon</th>
                  <th className="th">Nama Layanan</th>
                  <th className="th" style={{width:100}}>Status</th>
                  <th className="th" style={{textAlign:'right', width:140}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={5} style={{textAlign:'center', padding:'3rem', color:'var(--white70)'}}>
                      Belum ada layanan.{' '}
                      <button className="btn btn-outline btn-sm" onClick={openNew} style={{marginLeft:'0.5rem'}}>
                        Tambah sekarang
                      </button>
                    </td>
                  </tr>
                ) : services.map(s => (
                  <tr key={s.id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td className="td" style={{fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--white40)', textAlign:'center'}}>
                      {s.sort_order}
                    </td>
                    <td className="td" style={{fontSize:'1.4rem', textAlign:'center'}}>{s.icon || '⚙'}</td>
                    <td className="td">
                      <p style={{fontWeight:600, fontSize:'0.88rem', color:'var(--white)', marginBottom:'2px'}}>{s.name}</p>
                      {s.description && (
                        <p style={{fontSize:'0.73rem', color:'var(--white40)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:400}}>
                          {s.description}
                        </p>
                      )}
                    </td>
                    <td className="td">
                      <span className={`badge ${s.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="td">
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'0.4rem'}}>
                        <button onClick={() => openEdit(s)} className="btn btn-outline btn-sm">
                          <Pencil size={13}/> Edit
                        </button>
                        <button onClick={() => handleDelete(s)} className="btn btn-danger btn-sm">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}