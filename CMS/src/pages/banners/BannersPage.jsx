// ── BannersPage.jsx ───────────────────────────────────────────────────────────
// Halaman kelola banner slider beranda.
// Banner tampil sebagai fullscreen carousel (bukan strip di bawah hero).
// Rekomendasi ukuran: 1920×1080px (landscape 16:9) atau 1920×800px.
import { useState }      from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Upload, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import api              from '@/services/api';
import { uploadFile }   from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles           from './BannersPage.module.css';

const EMPTY = { title: '', image_url: '', link_url: '', sort_order: 0, is_active: true };

export default function BannersPage() {
  const qc               = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-banners'],
    queryFn:  () => api.get('/banner').then(r => r.data.data),
  });
  const banners = data || [];

  // ── Upload gambar ──────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res  = await uploadFile(file, 'banners');
      const path = res.data?.data?.path || res.data?.path;
      setForm(f => ({ ...f, image_url: path }));
    } catch (err) {
      alert(getErrorMsg(err));
    } finally {
      setUploading(false);
    }
  };

  // ── Simpan banner baru ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.image_url) return alert('Gambar banner wajib diupload terlebih dahulu.');
    setSaving(true);
    try {
      await api.post('/banner', { ...form, sort_order: banners.length });
      qc.invalidateQueries(['cms-banners']);
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      alert(getErrorMsg(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Hapus banner ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus banner ini?')) return;
    try {
      await api.delete(`/banner/${id}`);
      qc.invalidateQueries(['cms-banners']);
    } catch (err) {
      alert(getErrorMsg(err));
    }
  };

  // ── Toggle aktif/nonaktif ─────────────────────────────────────────────────
  const toggleActive = async (b) => {
    try {
      await api.put(`/banner/${b.id}`, { ...b, is_active: !b.is_active });
      qc.invalidateQueries(['cms-banners']);
    } catch (err) {
      alert(getErrorMsg(err));
    }
  };

  // ── Ubah urutan ───────────────────────────────────────────────────────────
  const moveOrder = async (b, direction) => {
    try {
      await api.put(`/banner/${b.id}`, { ...b, sort_order: b.sort_order + direction });
      qc.invalidateQueries(['cms-banners']);
    } catch (err) {
      alert(getErrorMsg(err));
    }
  };

  return (
    <div className="animate-in">

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="page-title">BANNER SLIDER</h1>
          <p className={styles.headerDesc}>
            Banner tampil sebagai <strong>slider fullscreen pertama</strong> di beranda website.
            Rekomendasi ukuran: <strong>1920 × 1080 px</strong> (landscape).
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setShowForm(v => !v); setForm(EMPTY); }}
        >
          <Plus size={16} /> Tambah Banner
        </button>
      </div>

      {/* Form Tambah */}
      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Banner Baru</h3>

          {/* Upload gambar */}
          <div className={styles.uploadArea}>
            {form.image_url ? (
              <div className={styles.previewWrap}>
                <img
                  src={imgUrl(form.image_url)}
                  alt="Preview banner"
                  className={styles.previewImg}
                />
                <button
                  className={styles.removePreview}
                  onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                >
                  ✕ Ganti Gambar
                </button>
              </div>
            ) : (
              <label className={styles.uploadLabel}>
                <Upload size={28} />
                <span>{uploading ? 'Mengupload...' : 'Klik untuk upload gambar banner'}</span>
                <small>Format: JPG, PNG, WebP · Maks. 10 MB · Rekomendasi: 1920×1080px</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Field tambahan */}
          <div className={styles.formFields}>
            <div>
              <label className="form-label">Judul (opsional)</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Misal: Promo Akhir Tahun, Proyek Terbaru, dll."
              />
              <p className={styles.fieldHint}>
                Judul akan tampil sebagai teks overlay di atas gambar banner.
              </p>
            </div>
            <div>
              <label className="form-label">URL Tujuan (opsional)</label>
              <input
                className="form-input"
                value={form.link_url}
                onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                placeholder="Misal: /informasi/promo-akhir-tahun atau https://..."
              />
              <p className={styles.fieldHint}>
                Jika diisi, tombol "Selengkapnya" akan muncul di atas banner.
              </p>
            </div>
          </div>

          <div className={styles.formActions}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Menyimpan...' : 'Simpan Banner'}
            </button>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY); }}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Daftar Banner */}
      {isLoading ? (
        <div className={styles.loading}>Memuat data banner...</div>
      ) : banners.length === 0 ? (
        <div className={`card ${styles.emptyState}`}>
          <div className={styles.emptyIcon}>🖼</div>
          <h3>Belum Ada Banner</h3>
          <p>
            Tambahkan banner pertama untuk ditampilkan sebagai slider di beranda website.<br/>
            Jika tidak ada banner, website akan menampilkan tampilan teks Hero bawaan.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tambah Banner Pertama
          </button>
        </div>
      ) : (
        <div className={styles.bannerList}>
          {banners.map((b, i) => (
            <div key={b.id} className={`card ${styles.bannerItem} ${!b.is_active ? styles.inactive : ''}`}>
              {/* Urutan */}
              <div className={styles.orderBadge}>#{i + 1}</div>

              {/* Thumbnail */}
              <div className={styles.thumbWrap}>
                <img
                  src={imgUrl(b.image_url)}
                  alt={b.title || `Banner ${i + 1}`}
                  className={styles.thumb}
                />
                {!b.is_active && <div className={styles.inactiveOverlay}>Nonaktif</div>}
              </div>

              {/* Info */}
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>{b.title || <em className={styles.noTitle}>Tanpa judul</em>}</p>
                {b.link_url && (
                  <p className={styles.itemUrl}>{b.link_url}</p>
                )}
              </div>

              {/* Aksi */}
              <div className={styles.itemActions}>
                {/* Naik / Turun urutan */}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => moveOrder(b, -1)}
                  disabled={i === 0}
                  title="Pindah ke atas"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => moveOrder(b, 1)}
                  disabled={i === banners.length - 1}
                  title="Pindah ke bawah"
                >
                  <ChevronDown size={14} />
                </button>

                {/* Toggle aktif */}
                <button
                  className={`btn btn-sm ${b.is_active ? 'btn-outline' : 'btn-ghost'}`}
                  onClick={() => toggleActive(b)}
                  title={b.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  {b.is_active
                    ? <><Eye size={13} /> Aktif</>
                    : <><EyeOff size={13} /> Nonaktif</>}
                </button>

                {/* Hapus */}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(b.id)}
                  title="Hapus banner"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info tips */}
      <div className={styles.tips}>
        <h4>💡 Tips Banner yang Baik</h4>
        <ul>
          <li>Gunakan gambar resolusi tinggi <strong>1920 × 1080 px</strong> atau setidaknya 1280 × 720 px.</li>
          <li>Pastikan subjek penting gambar ada di <strong>tengah atau kiri</strong> — teks overlay ada di sudut kiri bawah.</li>
          <li>Banner <strong>aktif pertama (teratas)</strong> akan tampil saat website dibuka.</li>
          <li>Slider akan otomatis berganti setiap <strong>5 detik</strong>.</li>
          <li>Isi <strong>judul</strong> jika ingin menampilkan teks di atas gambar (misal: judul promo atau berita).</li>
          <li>Isi <strong>URL tujuan</strong> jika ingin mengarahkan pengunjung ke halaman tertentu.</li>
        </ul>
      </div>

    </div>
  );
}