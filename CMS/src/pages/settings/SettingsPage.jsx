import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Upload, Plus, Trash2 } from 'lucide-react';
import api          from '@/services/api';
import { uploadFile }       from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles       from './SettingsPage.module.css';

const TABS = [
  'Profil Perusahaan',
  'Kontak & Sosial',
  'Statistik',
  'Contact Person',
  'Footer Kontak',
  'Tampilan',
];

// ── Template item kosong ──────────────────────────────────────────────────────
const emptyCP = () => ({ name: '', role: '', phone: '' });
const emptyFC = () => ({ name: '', role: '', phone: '' });

export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved,     setSaved]     = useState(false);

  // contact_persons & footer_contacts disimpan terpisah sebagai array
  const [contactPersons, setContactPersons] = useState([]);
  const [footerContacts, setFooterContacts] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn:  () => api.get('/settings').then(r => r.data.data),
  });

  useEffect(() => {
    if (!data) return;
    setForm(data);
    setContactPersons(Array.isArray(data.contact_persons) ? data.contact_persons : []);
    setFooterContacts(Array.isArray(data.footer_contacts)  ? data.footer_contacts  : []);
  }, [data]);

  const f   = (key)      => form[key] ?? '';
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res  = await uploadFile(file, 'settings');
      set(field, res.data?.data?.path || res.data?.path);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', {
        ...form,
        contact_persons: contactPersons,
        footer_contacts: footerContacts,
      });
      qc.invalidateQueries(['settings']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  // ── Helpers untuk array items ─────────────────────────────────────────────
  const updateCP = (idx, field, val) =>
    setContactPersons(prev => prev.map((cp, i) => i === idx ? { ...cp, [field]: val } : cp));
  const addCP    = () => setContactPersons(prev => [...prev, emptyCP()]);
  const removeCP = (idx) => setContactPersons(prev => prev.filter((_, i) => i !== idx));

  const updateFC = (idx, field, val) =>
    setFooterContacts(prev => prev.map((fc, i) => i === idx ? { ...fc, [field]: val } : fc));
  const addFC    = () => setFooterContacts(prev => [...prev, emptyFC()]);
  const removeFC = (idx) => setFooterContacts(prev => prev.filter((_, i) => i !== idx));

  if (isLoading) return <div style={{ padding:'3rem', color:'var(--white70)' }}>Memuat pengaturan...</div>;

  return (
    <div className="animate-in">

      {/* Header */}
      <div className={styles.header}>
        <h1 className="page-title">PENGATURAN</h1>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <Save size={16}/>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
      {saved && <div className={styles.saved}>✅ Pengaturan berhasil disimpan!</div>}

      <div className={styles.layout}>
        {/* Tab List */}
        <div className={styles.tabList}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`${styles.tabBtn} ${i === activeTab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(i)}
            >{t}</button>
          ))}
        </div>

        {/* Panel */}
        <div className={`card ${styles.panel}`}>

          {/* ── 0: Profil Perusahaan ── */}
          {activeTab === 0 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Profil Perusahaan</h3>
              <div>
                <label className="form-label">Judul Tentang Kami</label>
                <input className="form-input" value={f('about_title')} onChange={e => set('about_title', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Deskripsi Perusahaan</label>
                <textarea className="form-input" rows={5} value={f('about_description')} onChange={e => set('about_description', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Visi</label>
                <textarea className="form-input" rows={3} value={f('vision')} onChange={e => set('vision', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Misi (satu per baris)</label>
                <textarea className="form-input" rows={5} value={f('mission')} onChange={e => set('mission', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Foto Tentang Kami</label>
                {form.about_image && (
                  <div className={styles.imgPreview}>
                    <img src={imgUrl(form.about_image)} alt="about" />
                  </div>
                )}
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Foto'}
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'about_image')} disabled={uploading} style={{ display:'none' }} />
                </label>
              </div>
            </div>
          )}

          {/* ── 1: Kontak & Sosial ── */}
          {activeTab === 1 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Kontak &amp; Media Sosial</h3>
              <p className={styles.tabDesc}>
                Nomor-nomor ini digunakan di seluruh website: Footer, Header (tombol WA), Halaman Kontak, dan tombol WhatsApp floating.
              </p>
              <div className={styles.row2}>
                <div>
                  <label className="form-label">Telepon Sales ★</label>
                  <input className="form-input" value={f('contact_sales')} onChange={e => set('contact_sales', e.target.value)} placeholder="(021) 1234-5678" />
                  <p className={styles.fieldNote}>★ Nomor ini juga dipakai untuk tombol WhatsApp.</p>
                </div>
                <div>
                  <label className="form-label">Telepon Service</label>
                  <input className="form-input" value={f('contact_service')} onChange={e => set('contact_service', e.target.value)} placeholder="(021) 8765-4321" />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={f('contact_email')} onChange={e => set('contact_email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Alamat Kantor</label>
                <textarea className="form-input" rows={3} value={f('contact_address')} onChange={e => set('contact_address', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Jam Operasional</label>
                <input className="form-input" value={f('operational_hours')} onChange={e => set('operational_hours', e.target.value)} placeholder="Senin–Jumat: 08.00–17.00 WIB" />
              </div>
              <div>
                <label className="form-label">Instagram URL</label>
                <input className="form-input" value={f('social_instagram')} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" value={f('social_linkedin')} onChange={e => set('social_linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </div>
              <div>
                <label className="form-label">Facebook URL</label>
                <input className="form-input" value={f('social_facebook')} onChange={e => set('social_facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
            </div>
          )}

          {/* ── 2: Statistik ── */}
          {activeTab === 2 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Statistik Perusahaan</h3>
              <p className={styles.tabDesc}>
                Angka-angka ini tampil di <strong>Beranda</strong> (Proyek, Klien, Tahun, Dukungan) dan
                di <strong>Tentang Kami</strong> (Proyek, Klien Aktif, Tenaga Ahli, Tahun).
              </p>
              <div className={styles.row2}>
                <div>
                  <label className="form-label">Jumlah Proyek</label>
                  <input className="form-input" value={f('stats_projects')} onChange={e => set('stats_projects', e.target.value)} placeholder="500+" />
                  <p className={styles.fieldNote}>Beranda: "Proyek Selesai" · Tentang: "Proyek Selesai"</p>
                </div>
                <div>
                  <label className="form-label">Jumlah Klien</label>
                  <input className="form-input" value={f('stats_clients')} onChange={e => set('stats_clients', e.target.value)} placeholder="200+" />
                  <p className={styles.fieldNote}>Beranda: "Klien Puas" · Tentang: "Klien Aktif"</p>
                </div>
              </div>
              <div className={styles.row2}>
                <div>
                  <label className="form-label">Tahun Pengalaman</label>
                  <input className="form-input" value={f('stats_years')} onChange={e => set('stats_years', e.target.value)} placeholder="16+" />
                  <p className={styles.fieldNote}>Beranda & Tentang: "Tahun Pengalaman"</p>
                </div>
                <div>
                  <label className="form-label">Dukungan Teknis</label>
                  <input className="form-input" value={f('stats_support')} onChange={e => set('stats_support', e.target.value)} placeholder="24/7" />
                  <p className={styles.fieldNote}>Beranda saja: "Dukungan Teknis"</p>
                </div>
              </div>
              <div>
                <label className="form-label">Jumlah Tenaga Ahli</label>
                <input className="form-input" value={f('stats_staff')} onChange={e => set('stats_staff', e.target.value)} placeholder="350+" />
                <p className={styles.fieldNote}>Halaman Tentang Kami saja: "Tenaga Ahli"</p>
              </div>
            </div>
          )}

          {/* ── 3: Contact Person ── */}
          {activeTab === 3 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Contact Person</h3>
              <p className={styles.tabDesc}>
                Daftar ini tampil di <strong>Halaman Kontak</strong> sebagai "Contact Person" yang bisa dihubungi.
                Tambahkan nama, jabatan/peran, dan nomor telepon/WA mereka.
              </p>

              {contactPersons.length === 0 && (
                <div className={styles.emptyList}>Belum ada contact person. Klik tombol di bawah untuk menambahkan.</div>
              )}

              {contactPersons.map((cp, idx) => (
                <div key={idx} className={styles.arrayItem}>
                  <div className={styles.arrayItemNum}>#{idx + 1}</div>
                  <div className={styles.arrayItemFields}>
                    <div className={styles.row3}>
                      <div>
                        <label className="form-label">Nama</label>
                        <input className="form-input" value={cp.name} onChange={e => updateCP(idx, 'name', e.target.value)} placeholder="Ahmad Suryadi" />
                      </div>
                      <div>
                        <label className="form-label">Jabatan / Peran</label>
                        <input className="form-input" value={cp.role} onChange={e => updateCP(idx, 'role', e.target.value)} placeholder="Sales Manager" />
                      </div>
                      <div>
                        <label className="form-label">No. Telepon / WA</label>
                        <input className="form-input" value={cp.phone} onChange={e => updateCP(idx, 'phone', e.target.value)} placeholder="0812-3456-7890" />
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeCP(idx)} title="Hapus">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}

              <button className="btn btn-outline" onClick={addCP} style={{ width:'fit-content' }}>
                <Plus size={15}/> Tambah Contact Person
              </button>
            </div>
          )}

          {/* ── 4: Footer Kontak ── */}
          {activeTab === 4 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Footer Kontak</h3>
              <p className={styles.tabDesc}>
                Daftar ini tampil di <strong>Footer website</strong> bagian "Contact Person".
                Bisa berbeda dengan Contact Person di halaman Kontak — misal hanya tampilkan sebagian saja.
              </p>

              {footerContacts.length === 0 && (
                <div className={styles.emptyList}>Belum ada kontak footer. Klik tombol di bawah untuk menambahkan.</div>
              )}

              {footerContacts.map((fc, idx) => (
                <div key={idx} className={styles.arrayItem}>
                  <div className={styles.arrayItemNum}>#{idx + 1}</div>
                  <div className={styles.arrayItemFields}>
                    <div className={styles.row3}>
                      <div>
                        <label className="form-label">Nama</label>
                        <input className="form-input" value={fc.name} onChange={e => updateFC(idx, 'name', e.target.value)} placeholder="Rina Pratiwi" />
                      </div>
                      <div>
                        <label className="form-label">Jabatan / Peran</label>
                        <input className="form-input" value={fc.role} onChange={e => updateFC(idx, 'role', e.target.value)} placeholder="Customer Service" />
                      </div>
                      <div>
                        <label className="form-label">No. Telepon / WA</label>
                        <input className="form-input" value={fc.phone} onChange={e => updateFC(idx, 'phone', e.target.value)} placeholder="0821-9876-5432" />
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFC(idx)} title="Hapus">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}

              <button className="btn btn-outline" onClick={addFC} style={{ width:'fit-content' }}>
                <Plus size={15}/> Tambah Kontak Footer
              </button>
            </div>
          )}

          {/* ── 5: Tampilan (Compro) ── */}
          {activeTab === 5 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>File Company Profile</h3>
              <div>
                <label className="form-label">File Compro (PDF)</label>
                {form.compro_file && (
                  <p style={{ fontSize:'0.8rem', color:'var(--white70)', marginBottom:'0.5rem' }}>
                    File: {form.compro_file}
                  </p>
                )}
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload File PDF'}
                  <input type="file" accept=".pdf" onChange={e => handleUpload(e, 'compro_file')} disabled={uploading} style={{ display:'none' }} />
                </label>
                {form.compro_file && (
                  <input
                    className="form-input"
                    style={{ marginTop:'0.5rem' }}
                    value={f('compro_file')}
                    onChange={e => set('compro_file', e.target.value)}
                    placeholder="Atau isi path manual"
                  />
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}