import { useState }      from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import api            from '@/services/api';
import { getErrorMsg, toSlug } from '@/utils/helpers';
import styles  from './CategoriesPage.module.css';
import modal   from '@/components/shared/Modal.module.css';

const EMPTY = { name:'', slug:'', description:'', icon:'', sort_order:0, type:'product', is_active:true };
const TYPE_OPTS = [
  { value:'product',   label:'Produk' },
  { value:'portfolio', label:'Portfolio' },
  { value:'news',      label:'Berita' },
];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [open,     setOpen]     = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-categories'],
    queryFn:  () => api.get('/categories').then(r => r.data.data),
  });
  const categories = data || [];

  const openNew  = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (c) => {
    setForm({ name:c.name||'', slug:c.slug||'', description:c.description||'',
              icon:c.icon||'', sort_order:c.sort_order||0, type:c.type||'product', is_active:c.is_active!==false });
    setEditId(c.id); setOpen(true);
  };
  const closeModal = () => { setOpen(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Nama kategori wajib diisi.');
    const payload = { ...form, slug: form.slug.trim() || toSlug(form.name) };
    setSaving(true);
    try {
      if (editId) await api.put(`/categories/${editId}`, payload);
      else        await api.post('/categories', payload);
      qc.invalidateQueries(['cms-categories']);
      closeModal();
    } catch (err) { alert(getErrorMsg(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Hapus kategori "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c.id}`); qc.invalidateQueries(['cms-categories']); }
    catch (err) { alert(getErrorMsg(err)); }
  };

  const TYPE_COLOR = { product:'badge-yellow', portfolio:'badge-green', news:'badge-gray' };

  return (
    <div className="animate-in">
      <div className={styles.header}>
        <h1 className="page-title">KATEGORI</h1>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16}/> Tambah Kategori</button>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={`${modal.modal} ${modal.modalSm}`} onClick={e => e.stopPropagation()}>

            <div className={modal.header}>
              <h2>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button className={modal.closeBtn} onClick={closeModal}><X size={18}/></button>
            </div>

            <div className={modal.body}>
              <div className={modal.row2}>
                <div>
                  <label className="form-label">Nama Kategori *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="HVAC & Pendingin" />
                </div>
                <div>
                  <label className="form-label">Icon (emoji)</label>
                  <input className="form-input" value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="❄" />
                </div>
              </div>

              <div>
                <label className="form-label">Slug (URL)</label>
                <input className="form-input" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="otomatis dari nama jika dikosongkan" />
                <p style={{fontSize:'0.7rem',color:'var(--white40)',marginTop:'0.3rem',fontFamily:'var(--font-mono)'}}>
                  Biarkan kosong untuk generate otomatis
                </p>
              </div>

              <div>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className={modal.row2}>
                <div>
                  <label className="form-label">Tipe</label>
                  <select className="form-input" value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Urutan</label>
                  <input type="number" className="form-input" value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <label className={modal.toggle}>
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <span>Aktif</span>
              </label>
            </div>

            <div className={modal.footer}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={15}/>{saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-outline" onClick={closeModal}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabel ── */}
      <div className="card">
        <div style={{overflowX:'auto'}}>
          {isLoading
            ? <div style={{padding:'2rem',textAlign:'center',color:'var(--white70)'}}>Memuat...</div>
            : (
              <table style={{width:'100%'}}>
                <thead style={{background:'var(--bg3)',borderBottom:'1px solid var(--border)'}}>
                  <tr>
                    <th className="th" style={{width:40}}>Icon</th>
                    <th className="th">Nama</th>
                    <th className="th">Slug</th>
                    <th className="th" style={{width:100}}>Tipe</th>
                    <th className="th" style={{width:60}}>Urutan</th>
                    <th className="th" style={{width:90}}>Status</th>
                    <th className="th" style={{textAlign:'right',width:100}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0
                    ? <tr><td className="td" colSpan={7} style={{textAlign:'center',padding:'2rem',color:'var(--white70)'}}>Belum ada kategori.</td></tr>
                    : categories.map(c => (
                        <tr key={c.id}>
                          <td className="td" style={{fontSize:'1.3rem'}}>{c.icon || '—'}</td>
                          <td className="td">
                            <p style={{fontWeight:600,fontSize:'0.88rem',color:'var(--white)'}}>{c.name}</p>
                            {c.description && <p style={{fontSize:'0.72rem',color:'var(--white40)',marginTop:2}}>{c.description}</p>}
                          </td>
                          <td className="td" style={{fontFamily:'var(--font-mono)',fontSize:'0.73rem',color:'var(--white70)'}}>{c.slug}</td>
                          <td className="td"><span className={`badge ${TYPE_COLOR[c.type] || 'badge-gray'}`}>{TYPE_OPTS.find(t=>t.value===c.type)?.label || c.type}</span></td>
                          <td className="td" style={{fontFamily:'var(--font-mono)',fontSize:'0.78rem',textAlign:'center'}}>{c.sort_order}</td>
                          <td className="td"><span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                          <td className="td">
                            <div style={{display:'flex',justifyContent:'flex-end',gap:'0.4rem'}}>
                              <button onClick={() => openEdit(c)} className="btn btn-outline btn-sm"><Pencil size={13}/></button>
                              <button onClick={() => handleDelete(c)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  );
}