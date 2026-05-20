import { useState }   from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api            from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './AwardsPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

const EMPTY = {
  type:'penghargaan', title:'', image_url:'', issued_by:'',
  year: new Date().getFullYear(), description:'', show_on_home:false, sort_order:0, is_active:true,
};
const TYPE_OPTS = ['penghargaan', 'sertifikasi', 'standarisasi'];

export default function AwardsPage() {
  const qc = useQueryClient();
  const [open,      setOpen]     = useState(false);
  const [editId,    setEditId]   = useState(null);
  const [form,      setForm]     = useState(EMPTY);
  const [saving,    setSaving]   = useState(false);
  const [uploading, setUploading]= useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-awards'],
    queryFn:  () => api.get('/awards').then(r => r.data.data),
  });
  const items = data || [];

  const openNew = () => {
    setForm(EMPTY);
    setEditId(null);
    setOpen(true);
  };

  // Semua field existing terisi saat buka edit
  const openEdit = (a) => {
    setForm({
      type:        a.type        ?? 'penghargaan',
      title:       a.title       ?? '',
      image_url:   a.image_url   ?? '',
      issued_by:   a.issued_by   ?? '',
      year:        a.year        ?? new Date().getFullYear(),
      description: a.description ?? '',
      show_on_home:a.show_on_home ?? false,
      sort_order:  a.sort_order  ?? 0,
      is_active:   a.is_active   !== false,
    });
    setEditId(a.id);
    setOpen(true);
  };

  const closeModal = () => { setOpen(false); setEditId(null); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      else        await api.post('/awards', form);
      qc.invalidateQueries(['cms-awards']);
      closeModal();
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Hapus "${a.title}"?`)) return;
    try { await api.delete(`/awards/${a.id}`); qc.invalidateQueries(['cms-awards']); }
    catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">PENGHARGAAN &amp; SERTIFIKASI</h1>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={16}/> Tambah
        </button>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={`${modal.modal} ${modal.modalSm}`} onClick={e => e.stopPropagation()}>

            <div className={modal.header}>
              <h2>{editId ? 'Edit' : 'Tambah'} Penghargaan</h2>
              <button className={modal.closeBtn} onClick={closeModal}><X size={18}/></button>
            </div>

            <div className={modal.body}>
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Tipe</label>
                  <select className="form-input" value={form.type}
                    onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {TYPE_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tahun</label>
                  <input type="number" className="form-input" value={form.year}
                    onChange={e => setForm(f => ({...f, year: parseInt(e.target.value) || new Date().getFullYear()}))}
                    min={1900} max={2100} />
                </div>
              </div>

              <div>
                <label className="form-label">Judul *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="ISO 9001:2015" />
              </div>

              <div>
                <label className="form-label">Diberikan oleh</label>
                <input className="form-input" value={form.issued_by}
                  onChange={e => setForm(f => ({...f, issued_by: e.target.value}))}
                  placeholder="LRQA, GBCI, GAPENSI, Kemnaker, dll." />
              </div>

              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Keterangan singkat tentang penghargaan ini..." />
              </div>

              <div>
                <label className="form-label">Logo / Gambar Sertifikat</label>
                {form.image_url && (
                  <div className={styles.logoPreview}>
                    <img src={imgUrl(form.image_url)} alt="logo" />
                  </div>
                )}
                <label className={`btn btn-outline ${modal.uploadBtn}`}>
                  <Upload size={13}/>
                  {uploading ? 'Mengupload...' : form.image_url ? 'Ganti Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleUpload}
                    disabled={uploading} style={{display:'none'}} />
                </label>
                {form.image_url && (
                  <button className="btn btn-ghost btn-sm" style={{marginTop:'0.35rem'}}
                    onClick={() => setForm(f => ({...f, image_url: ''}))}>
                    Hapus Logo
                  </button>
                )}
              </div>

              <div className={modal.checkRow}>
                <label className={modal.toggle}>
                  <input type="checkbox" checked={form.show_on_home}
                    onChange={e => setForm(f => ({...f, show_on_home: e.target.checked}))} />
                  <span>Tampil di Beranda</span>
                </label>
                <label className={modal.toggle}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                  <span>Aktif</span>
                </label>
              </div>
            </div>

            <div className={modal.footer}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-outline" onClick={closeModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {isLoading
          ? [1,2,3,4].map(i => <div key={i} className={styles.skeleton}/>)
          : items.map(a => (
              <div key={a.id} className={`card ${styles.card}`}>
                <div className={styles.cardActions}>
                  <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" title="Edit">
                    <Pencil size={13}/>
                  </button>
                  <button onClick={() => handleDelete(a)} className="btn btn-danger btn-sm" title="Hapus">
                    <Trash2 size={13}/>
                  </button>
                </div>
                <div className={styles.cardIcon}>
                  {a.image_url
                    ? <img src={imgUrl(a.image_url)} alt={a.title} />
                    : <span>{a.type === 'sertifikasi' ? '🏅' : '🏆'}</span>}
                </div>
                <span className="badge badge-gray" style={{marginBottom:'0.5rem'}}>{a.type}</span>
                <h4 className={styles.cardTitle}>{a.title}</h4>
                {a.issued_by && <p className={styles.cardBy}>{a.issued_by}</p>}
                {a.year      && <p className={styles.cardYear}>{a.year}</p>}
              </div>
            ))
        }
      </div>
      {!isLoading && items.length === 0 && (
        <div className="card" style={{padding:'3rem', textAlign:'center', color:'var(--white70)'}}>
          Belum ada penghargaan.{' '}
          <button className="btn btn-outline btn-sm" onClick={openNew} style={{marginLeft:'0.5rem'}}>
            Tambah sekarang
          </button>
        </div>
      )}
    </div>
  );
}