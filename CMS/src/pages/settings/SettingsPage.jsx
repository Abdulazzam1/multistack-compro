import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Upload } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './SettingsPage.module.css';

const TABS = ['Profil Perusahaan', 'Kontak & Sosial', 'Statistik', 'Tampilan'];

export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data.data),
  });

  useEffect(() => { if (data) setForm(data); }, [data]);

  const f = (key) => form[key] || '';
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'settings');
      set(field, res.data?.data?.path || res.data?.path);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/settings', form);
      qc.invalidateQueries(['settings']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  if (isLoading) return <div style={{ padding:'3rem', color:'var(--white70)' }}>Memuat pengaturan...</div>;

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">PENGATURAN</h1>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <Save size={16}/>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
      {saved && <div className={styles.saved}>✅ Pengaturan berhasil disimpan!</div>}

      <div className={styles.layout}>
        {/* Tabs */}
        <div className={styles.tabList}>
          {TABS.map((t,i) => <button key={t} className={`${styles.tabBtn} ${i===activeTab ? styles.activeTab : ''}`} onClick={() => setActiveTab(i)}>{t}</button>)}
        </div>

        {/* Panels */}
        <div className={`card ${styles.panel}`}>
          {activeTab === 0 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Profil Perusahaan</h3>
              <div><label className="form-label">Judul Tentang Kami</label><input className="form-input" value={f('about_title')} onChange={e=>set('about_title',e.target.value)} /></div>
              <div><label className="form-label">Deskripsi Perusahaan</label><textarea className="form-input" rows={5} value={f('about_description')} onChange={e=>set('about_description',e.target.value)} /></div>
              <div><label className="form-label">Visi</label><textarea className="form-input" rows={3} value={f('vision')} onChange={e=>set('vision',e.target.value)} /></div>
              <div><label className="form-label">Misi (satu per baris)</label><textarea className="form-input" rows={5} value={f('mission')} onChange={e=>set('mission',e.target.value)} /></div>
              <div>
                <label className="form-label">Foto Tentang Kami</label>
                {form.about_image && <div className={styles.imgPreview}><img src={imgUrl(form.about_image)} alt="about" /></div>}
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Foto'}
                  <input type="file" accept="image/*" onChange={e=>handleUpload(e,'about_image')} disabled={uploading} style={{ display:'none' }} />
                </label>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Kontak & Media Sosial</h3>
              <div className={styles.row2}>
                <div><label className="form-label">Telepon Sales</label><input className="form-input" value={f('contact_sales')} onChange={e=>set('contact_sales',e.target.value)} /></div>
                <div><label className="form-label">Telepon Service</label><input className="form-input" value={f('contact_service')} onChange={e=>set('contact_service',e.target.value)} /></div>
              </div>
              <div><label className="form-label">Email</label><input type="email" className="form-input" value={f('contact_email')} onChange={e=>set('contact_email',e.target.value)} /></div>
              <div><label className="form-label">Alamat Kantor</label><textarea className="form-input" rows={3} value={f('contact_address')} onChange={e=>set('contact_address',e.target.value)} /></div>
              <div><label className="form-label">Jam Operasional</label><input className="form-input" value={f('operational_hours')} onChange={e=>set('operational_hours',e.target.value)} placeholder="Senin–Jumat: 08.00–17.00 WIB" /></div>
              <div><label className="form-label">Instagram URL</label><input className="form-input" value={f('social_instagram')} onChange={e=>set('social_instagram',e.target.value)} /></div>
              <div><label className="form-label">LinkedIn URL</label><input className="form-input" value={f('social_linkedin')} onChange={e=>set('social_linkedin',e.target.value)} /></div>
              <div><label className="form-label">Facebook URL</label><input className="form-input" value={f('social_facebook')} onChange={e=>set('social_facebook',e.target.value)} /></div>
            </div>
          )}

          {activeTab === 2 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>Statistik (tampil di Beranda)</h3>
              <div className={styles.row2}>
                <div><label className="form-label">Jumlah Proyek</label><input className="form-input" value={f('stats_projects')} onChange={e=>set('stats_projects',e.target.value)} placeholder="500+" /></div>
                <div><label className="form-label">Jumlah Klien</label><input className="form-input" value={f('stats_clients')} onChange={e=>set('stats_clients',e.target.value)} placeholder="200+" /></div>
              </div>
              <div className={styles.row2}>
                <div><label className="form-label">Tahun Pengalaman</label><input className="form-input" value={f('stats_years')} onChange={e=>set('stats_years',e.target.value)} placeholder="16+" /></div>
                <div><label className="form-label">Dukungan</label><input className="form-input" value={f('stats_support')} onChange={e=>set('stats_support',e.target.value)} placeholder="24/7" /></div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className={styles.fields}>
              <h3 className={styles.panelTitle}>File Compro</h3>
              <div>
                <label className="form-label">File Company Profile (PDF)</label>
                {form.compro_file && <p style={{ fontSize:'0.8rem', color:'var(--white70)', marginBottom:'0.5rem' }}>File: {form.compro_file}</p>}
                <label className={`btn btn-outline ${styles.uploadBtn}`}>
                  <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload File PDF'}
                  <input type="file" accept=".pdf" onChange={e=>handleUpload(e,'compro_file')} disabled={uploading} style={{ display:'none' }} />
                </label>
                {form.compro_file && <input className="form-input" style={{ marginTop:'0.5rem' }} value={f('compro_file')} onChange={e=>set('compro_file',e.target.value)} placeholder="Atau isi path manual" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
