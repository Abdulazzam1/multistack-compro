import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './NewsFormPage.module.css';

const EMPTY = { title:'', category:'berita', excerpt:'', content:'', cover_image:'', author:'Admin Multistack', is_published:false, show_on_home:false };
const CATS = [{ value:'berita',label:'Berita' },{ value:'aktivitas',label:'Aktivitas' },{ value:'csr',label:'CSR' }];
const QUILL_MODULES = { toolbar:[[{header:[1,2,3,false]}],['bold','italic','underline','strike'],[{list:'ordered'},{list:'bullet'}],['link','blockquote'],['clean']] };

export default function NewsFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const initialized = useRef(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ['news-item', id],
    queryFn: () => api.get(`/news/${id}`).then(r => r.data.data),
    enabled: isEdit, staleTime: Infinity,
  });

  useEffect(() => {
    if (!existing || initialized.current) return;
    initialized.current = true;
    setForm({ title:existing.title||'', category:existing.category||'berita', excerpt:existing.excerpt||'', content:existing.content||'', cover_image:existing.cover_image||'', author:existing.author||'Admin Multistack', is_published:existing.is_published||false, show_on_home:existing.show_on_home||false });
  }, [existing]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'news');
      setForm(f => ({ ...f, cover_image: res.data?.data?.path || res.data?.path }));
    } catch (err) { alert('Upload gagal: ' + getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Judul berita wajib diisi.');
    setSaving(true);
    try {
      if (isEdit) await api.put(`/news/${id}`, form);
      else await api.post('/news', form);
      qc.invalidateQueries(['cms-news']);
      navigate('/news');
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <button onClick={() => navigate('/news')} className="btn btn-ghost btn-sm"><ArrowLeft size={16}/> Kembali</button>
        <h1 className="page-title">{isEdit ? 'EDIT BERITA' : 'TULIS BERITA'}</h1>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}><Save size={16}/>{saving ? 'Menyimpan...' : 'Simpan'}</button>
      </div>

      <div className={styles.grid}>
        {/* Left: Editor */}
        <div>
          <div className={`card ${styles.section}`}>
            <div><label className="form-label">Judul Berita *</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Judul berita" /></div>
            <div style={{ marginTop:'1rem' }}><label className="form-label">Ringkasan (Excerpt)</label><textarea className="form-input" rows={3} value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} placeholder="Ringkasan singkat untuk daftar berita..." /></div>
          </div>
          <div className={`card ${styles.section} ${styles.editorWrap}`}>
            <label className="form-label">Konten Berita</label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={val => setForm(f => ({ ...f, content: val }))}
              modules={QUILL_MODULES}
              className={styles.quill}
              placeholder="Tulis konten berita di sini..."
            />
          </div>
        </div>

        {/* Right: Meta */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Metadata</h3>
            <div><label className="form-label">Kategori</label>
              <select className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop:'0.75rem' }}><label className="form-label">Penulis</label><input className="form-input" value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} /></div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Foto Cover</h3>
            {form.cover_image && (
              <div className={styles.coverPreview}>
                <img src={imgUrl(form.cover_image)} alt="Cover" />
              </div>
            )}
            <label className={`btn btn-outline ${styles.uploadBtn}`}>
              <Upload size={14}/>{uploading ? 'Mengupload...' : 'Upload Foto Cover'}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
            </label>
            {form.cover_image && <button className="btn btn-ghost btn-sm" onClick={() => setForm(f=>({...f,cover_image:''}))}>Hapus Cover</button>}
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Publikasi</h3>
            <label className={styles.toggle}><input type="checkbox" checked={form.is_published} onChange={e=>setForm(f=>({...f,is_published:e.target.checked}))} /><span>Terbitkan Sekarang</span></label>
            <label className={styles.toggle}><input type="checkbox" checked={form.show_on_home} onChange={e=>setForm(f=>({...f,show_on_home:e.target.checked}))} /><span>Tampilkan di Beranda</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}
