import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Trash2, Upload } from 'lucide-react';
import api from '@/services/api';
import { uploadFile } from '@/services/uploadService';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './ProductFormPage.module.css';

const EMPTY = { name:'', category:'', brand:'', description:'', specs:'{}', images:[], is_featured:false, is_active:true };

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [specsText, setSpecsText] = useState('{}');

  const { data: existing } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data.data),
    enabled: isEdit,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      name:        existing.name || '',
      category:    existing.category || '',
      brand:       existing.brand || '',
      description: existing.description || '',
      specs:       existing.specs,
      images:      existing.images || [],
      is_featured: existing.is_featured || false,
      is_active:   existing.is_active !== false,
    });
    setSpecsText(typeof existing.specs === 'string' ? existing.specs : JSON.stringify(existing.specs || {}, null, 2));
  }, [existing]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, 'products');
      const path = res.data?.data?.path || res.data?.path;
      setForm(f => ({ ...f, images: [...f.images, path] }));
    } catch (err) { alert('Upload gagal: ' + getErrorMsg(err)); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Nama produk wajib diisi.');
    let specs = form.specs;
    try { specs = JSON.parse(specsText); } catch { return alert('Format JSON spesifikasi tidak valid.'); }
    setSaving(true);
    try {
      const payload = { ...form, specs };
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      qc.invalidateQueries(['cms-products']);
      navigate('/products');
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <button onClick={() => navigate('/products')} className="btn btn-ghost btn-sm"><ArrowLeft size={16}/> Kembali</button>
        <h1 className="page-title">{isEdit ? 'EDIT PRODUK' : 'TAMBAH PRODUK'}</h1>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <Save size={16}/>{saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <div className={styles.grid}>
        {/* Left */}
        <div className={styles.left}>
          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Informasi Produk</h3>
            <div><label className="form-label">Nama Produk *</label><input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Nama produk" /></div>
            <div className={styles.row2}>
              <div><label className="form-label">Kategori</label><input className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="HVAC, Elektrikal, dll." /></div>
              <div><label className="form-label">Brand</label><input className="form-input" value={form.brand} onChange={e=>setForm(f=>({...f,brand:e.target.value}))} placeholder="Carrier, ABB, dll." /></div>
            </div>
            <div><label className="form-label">Deskripsi</label><textarea className="form-input" rows={5} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Deskripsi singkat produk..." /></div>
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Spesifikasi Teknis (JSON)</h3>
            <textarea className={`form-input ${styles.jsonInput}`} rows={10} value={specsText} onChange={e=>setSpecsText(e.target.value)} placeholder='{"Kapasitas": "200 TR", "Refrigeran": "R-134a"}' spellCheck={false} />
            {/* BARIS DI BAWAH INI YANG DIPERBAIKI */}
            <p className={styles.hint}>Format: JSON object. Contoh: {'{"Daya": "100 kVA", "Tegangan": "380V"}'}</p>
          </div>
        </div>

        {/* Right */}
        <div className={styles.right}>
          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Status</h3>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.is_featured} onChange={e=>setForm(f=>({...f,is_featured:e.target.checked}))} />
              <span>Produk Unggulan (tampil di Beranda)</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} />
              <span>Aktif (tampil di website)</span>
            </label>
          </div>

          <div className={`card ${styles.section}`}>
            <h3 className={styles.sectionTitle}>Gambar Produk</h3>
            <label className={`btn btn-outline ${styles.uploadBtn}`}>
              <Upload size={15}/>{uploading ? 'Mengupload...' : 'Upload Gambar'}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display:'none' }} />
            </label>
            <div className={styles.imageGrid}>
              {form.images.map((img, i) => (
                <div key={i} className={styles.imgWrap}>
                  <img src={imgUrl(img)} alt={`img-${i}`} />
                  <button className={styles.removeImg} onClick={() => removeImage(i)}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}