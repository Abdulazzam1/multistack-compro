import { useState }   from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';
import api            from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './PortfolioPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

const EMPTY = {
  title: '', client: '', location: '', category: '', description: '', scope: '',
  images: [], year: new Date().getFullYear(),
  is_featured: false, is_active: true, show_on_home: false,
};

export default function PortfolioPage() {
  const qc = useQueryClient();
  const [open,      setOpen]     = useState(false);
  const [editId,    setEditId]   = useState(null);
  const [form,      setForm]     = useState(EMPTY);
  const [saving,    setSaving]   = useState(false);
  const [uploading, setUploading]= useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-portfolio'],
    queryFn:  () => api.get('/portfolio').then(r => r.data.data),
  });
  const items = data || [];

  const openNew = () => {
    setForm(EMPTY);
    setEditId(null);
    setOpen(true);
  };

  // Semua field existing pasti terisi — tidak ada yang kosong saat buka edit
  const openEdit = (p) => {
    setForm({
      title:        p.title        ?? '',
      client:       p.client       ?? '',
      location:     p.location     ?? '',
      category:     p.category     ?? '',
      description:  p.description  ?? '',
      scope:        p.scope        ?? '',
      images:       Array.isArray(p.images) ? [...p.images] : [],
      year:         p.year         ?? new Date().getFullYear(),
      is_featured:  p.is_featured  ?? false,
      is_active:    p.is_active    !== false,
      show_on_home: p.show_on_home ?? false,
    });
    setEditId(p.id);
    setOpen(true);
  };

  const closeModal = () => { setOpen(false); setEditId(null); };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const res  = await uploadFile(file, 'portfolio');
        const path = res.data?.data?.path || res.data?.path;
        setForm(f => ({ ...f, images: [...f.images, path] }));
      }
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) =>
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Judul proyek wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/portfolio/${editId}`, form);
      else        await api.post('/portfolio', form);
      qc.invalidateQueries(['cms-portfolio']);
      closeModal();
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Hapus portfolio "${p.title}"?`)) return;
    try { await api.delete(`/portfolio/${p.id}`); qc.invalidateQueries(['cms-portfolio']); }
    catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">PORTFOLIO</h1>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={16}/> Tambah Proyek
        </button>
      </div>

      {/* ── Modal Tambah / Edit ──────────────────────────────────────────── */}
      {open && (
        <div className={modal.overlay} onClick={closeModal}>
          {/*
            * Pakai modalLg untuk portfolio karena banyak field.
            * Modal sudah punya max-height + body scroll dari Modal.module.css.
            */}
          <div className={`${modal.modal} ${modal.modalLg}`} onClick={e => e.stopPropagation()}>

            {/* Header — fixed, tidak scroll */}
            <div className={modal.header}>
              <h2>{editId ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>
              <button className={modal.closeBtn} onClick={closeModal} aria-label="Tutup">
                <X size={18}/>
              </button>
            </div>

            {/* Body — scrollable */}
            <div className={modal.body}>

              {/* Judul */}
              <div>
                <label className="form-label">Judul Proyek *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="Contoh: Gedung Perkantoran XYZ Tower"
                />
              </div>

              {/* Klien & Lokasi */}
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Klien</label>
                  <input
                    className="form-input"
                    value={form.client}
                    onChange={e => setForm(f => ({...f, client: e.target.value}))}
                    placeholder="PT. Nama Klien"
                  />
                </div>
                <div>
                  <label className="form-label">Lokasi</label>
                  <input
                    className="form-input"
                    value={form.location}
                    onChange={e => setForm(f => ({...f, location: e.target.value}))}
                    placeholder="Jakarta Selatan"
                  />
                </div>
              </div>

              {/* Kategori & Tahun */}
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Kategori</label>
                  <input
                    className="form-input"
                    value={form.category}
                    onChange={e => setForm(f => ({...f, category: e.target.value}))}
                    placeholder="Gedung Komersial, Hotel, Industri..."
                  />
                </div>
                <div>
                  <label className="form-label">Tahun Selesai</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.year}
                    onChange={e => setForm(f => ({...f, year: parseInt(e.target.value) || new Date().getFullYear()}))}
                    min={2000}
                    max={2100}
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="form-label">Deskripsi Proyek</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  placeholder="Deskripsi singkat tentang proyek..."
                />
              </div>

              {/* Lingkup Pekerjaan */}
              <div>
                <label className="form-label">
                  Lingkup Pekerjaan
                  <span style={{color:'var(--white40)', fontFamily:'var(--font-mono)', fontSize:'0.62rem', textTransform:'none', letterSpacing:0, marginLeft:'0.5rem', fontWeight:400}}>
                    satu item per baris
                  </span>
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.scope}
                  onChange={e => setForm(f => ({...f, scope: e.target.value}))}
                  placeholder={"HVAC Central 2.000 TR\nDistribusi Daya MV/LV\nFire Protection System NFPA\nBuilding Automation System"}
                />
              </div>

              {/* Checkbox */}
              <div className={modal.checkRow}>
                <label className={modal.toggle}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))}
                  />
                  <span>Proyek Unggulan</span>
                </label>
                <label className={modal.toggle}>
                  <input
                    type="checkbox"
                    checked={form.show_on_home}
                    onChange={e => setForm(f => ({...f, show_on_home: e.target.checked}))}
                  />
                  <span>Tampil di Beranda</span>
                </label>
                <label className={modal.toggle}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({...f, is_active: e.target.checked}))}
                  />
                  <span>Aktif</span>
                </label>
              </div>

              {/* Upload Foto */}
              <div>
                <label className="form-label">
                  Foto Proyek
                  <span style={{color:'var(--white40)', fontFamily:'var(--font-mono)', fontSize:'0.62rem', textTransform:'none', letterSpacing:0, marginLeft:'0.5rem', fontWeight:400}}>
                    bisa lebih dari 1
                  </span>
                </label>

                {/* Thumbnail foto yang sudah ada */}
                {form.images.length > 0 && (
                  <div className={modal.imgGrid}>
                    {form.images.map((img, i) => (
                      <div key={i} className={modal.imgWrap}>
                        <img src={imgUrl(img)} alt={`foto-${i + 1}`} />
                        <button onClick={() => removeImage(i)} title="Hapus foto">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <label className={`btn btn-outline ${modal.uploadBtn}`}>
                  <Upload size={14}/>
                  {uploading ? 'Mengupload...' : 'Upload Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

            </div>
            {/* /Body */}

            {/* Footer — fixed, tidak scroll */}
            <div className={modal.footer}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan Proyek'}
              </button>
              <button className="btn btn-outline" onClick={closeModal}>Batal</button>
            </div>

          </div>
        </div>
      )}
      {/* /Modal */}

      {/* ── Grid Portfolio ── */}
      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={styles.skeleton}/>)}
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--white70)' }}>
          Belum ada portfolio.{' '}
          <button className="btn btn-outline btn-sm" onClick={openNew} style={{ marginLeft: '0.5rem' }}>
            Tambah sekarang
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(p => (
            <div key={p.id} className={`card ${styles.card}`}>
              <div className={styles.cardImg}>
                {p.images?.[0]
                  ? <img src={imgUrl(p.images[0])} alt={p.title} />
                  : <div className={styles.imgPlaceholder}>🏗</div>}
              </div>
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {p.is_featured  && <span className="badge badge-yellow">Unggulan</span>}
                  {p.show_on_home && <span className="badge badge-green">Beranda</span>}
                  {p.category && <span className="badge badge-gray">{p.category}</span>}
                  {p.year     && <span className="badge badge-gray">{p.year}</span>}
                </div>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                {(p.location || p.client) && (
                  <p className={styles.cardClient}>
                    {p.location && `📍 ${p.location}`}
                    {p.location && p.client && ' — '}
                    {p.client}
                  </p>
                )}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => openEdit(p)} className="btn btn-outline btn-sm">
                  <Pencil size={13}/> Edit
                </button>
                <button onClick={() => handleDelete(p)} className="btn btn-danger btn-sm">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}