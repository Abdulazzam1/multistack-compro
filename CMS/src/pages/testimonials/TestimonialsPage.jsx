import { useState }   from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import api            from '@/services/api';
import { getErrorMsg } from '@/utils/helpers';
import styles from './TestimonialsPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

const EMPTY = { client_name:'', client_title:'', client_company:'', content:'', rating:5, is_active:true };

export default function TestimonialsPage() {
  const qc = useQueryClient();
  const [open,    setOpen]   = useState(false);
  const [editId,  setEditId] = useState(null);
  const [form,    setForm]   = useState(EMPTY);
  const [saving,  setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-testimonials'],
    queryFn:  () => api.get('/testimonials').then(r => r.data.data),
  });
  const items = data || [];

  const openNew = () => {
    setForm(EMPTY);
    setEditId(null);
    setOpen(true);
  };

  // Semua field existing terisi saat buka edit
  const openEdit = (t) => {
    setForm({
      client_name:    t.client_name    ?? '',
      client_title:   t.client_title   ?? '',
      client_company: t.client_company ?? '',
      content:        t.content        ?? '',
      rating:         t.rating         ?? 5,
      is_active:      t.is_active      !== false,
    });
    setEditId(t.id);
    setOpen(true);
  };

  const closeModal = () => { setOpen(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.client_name.trim()) return alert('Nama klien wajib diisi.');
    if (!form.content.trim())     return alert('Isi testimoni wajib diisi.');
    setSaving(true);
    try {
      if (editId) await api.put(`/testimonials/${editId}`, form);
      else        await api.post('/testimonials', form);
      qc.invalidateQueries(['cms-testimonials']);
      closeModal();
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Hapus testimoni dari "${t.client_name}"?`)) return;
    try { await api.delete(`/testimonials/${t.id}`); qc.invalidateQueries(['cms-testimonials']); }
    catch (err) { alert(getErrorMsg(err)); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">TESTIMONI</h1>
        <button onClick={openNew} className="btn btn-primary">
          <Plus size={16}/> Tambah Testimoni
        </button>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={`${modal.modal} ${modal.modalSm}`} onClick={e => e.stopPropagation()}>

            <div className={modal.header}>
              <h2>{editId ? 'Edit Testimoni' : 'Tambah Testimoni'}</h2>
              <button className={modal.closeBtn} onClick={closeModal}><X size={18}/></button>
            </div>

            <div className={modal.body}>
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Nama Klien *</label>
                  <input className="form-input" value={form.client_name}
                    onChange={e => setForm(f => ({...f, client_name: e.target.value}))}
                    placeholder="Ahmad Hidayat" />
                </div>
                <div>
                  <label className="form-label">Jabatan</label>
                  <input className="form-input" value={form.client_title}
                    onChange={e => setForm(f => ({...f, client_title: e.target.value}))}
                    placeholder="Facility Manager" />
                </div>
              </div>

              <div>
                <label className="form-label">Perusahaan</label>
                <input className="form-input" value={form.client_company}
                  onChange={e => setForm(f => ({...f, client_company: e.target.value}))}
                  placeholder="PT. Nama Perusahaan" />
              </div>

              <div>
                <label className="form-label">Isi Testimoni *</label>
                <textarea className="form-input" rows={4} value={form.content}
                  onChange={e => setForm(f => ({...f, content: e.target.value}))}
                  placeholder="Tulis testimoni dari klien..." />
              </div>

              <div>
                <label className="form-label">Rating</label>
                <div className={styles.starRow}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={styles.starBtn}
                      style={{color: n <= form.rating ? 'var(--red)' : 'var(--white40)'}}
                      onClick={() => setForm(f => ({...f, rating: n}))}>★</button>
                  ))}
                  <span className={styles.ratingLabel}>{form.rating}/5</span>
                </div>
              </div>

              <label className={modal.toggle}>
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                <span>Aktif (tampil di website)</span>
              </label>
            </div>

            <div className={modal.footer}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15}/> {saving ? 'Menyimpan...' : 'Simpan Testimoni'}
              </button>
              <button className="btn btn-outline" onClick={closeModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {isLoading
          ? [1,2,3].map(i => <div key={i} className={styles.skeleton}/>)
          : items.map(t => (
              <div key={t.id} className={`card ${styles.card}`}>
                <div className={styles.cardTop}>
                  <div className={styles.stars}>{'★'.repeat(t.rating || 5)}</div>
                  <div className={styles.cardActions}>
                    <button onClick={() => openEdit(t)} className="btn btn-ghost btn-sm" title="Edit">
                      <Pencil size={13}/>
                    </button>
                    <button onClick={() => handleDelete(t)} className="btn btn-danger btn-sm" title="Hapus">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                <p className={styles.content}>"{t.content}"</p>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {(t.client_name || '?').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.name}>{t.client_name}</p>
                    <p className={styles.role}>
                      {[t.client_title, t.client_company].filter(Boolean).join(' — ')}
                    </p>
                  </div>
                </div>
                {!t.is_active && (
                  <span className="badge badge-gray"
                    style={{position:'absolute', bottom:'1rem', right:'1rem'}}>
                    Nonaktif
                  </span>
                )}
              </div>
            ))
        }
      </div>
      {!isLoading && items.length === 0 && (
        <div className="card" style={{padding:'3rem', textAlign:'center', color:'var(--white70)'}}>
          Belum ada testimoni.{' '}
          <button className="btn btn-outline btn-sm" onClick={openNew} style={{marginLeft:'0.5rem'}}>
            Tambah sekarang
          </button>
        </div>
      )}
    </div>
  );
}