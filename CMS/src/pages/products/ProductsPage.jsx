import { useState }   from 'react';
import { Link }       from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star, StarOff, X } from 'lucide-react';
import api            from '@/services/api';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './ProductsPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

export default function ProductsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-products'],
    queryFn:  () => api.get('/products?published=all&limit=100').then(r => r.data.data),
  });
  const products = data || [];

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess:  () => { qc.invalidateQueries(['cms-products']); setConfirm(null); },
    onError:    (err) => alert(getErrorMsg(err)),
  });

  const toggleFeat = useMutation({
    mutationFn: ({ id, is_featured }) => api.put(`/products/${id}`, { is_featured }),
    onSuccess:  () => qc.invalidateQueries(['cms-products']),
  });

  return (
    <div className="animate-in">
      <div className={styles.pageHeader}>
        <h1 className="page-title">PRODUK</h1>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16}/> Tambah Produk
        </Link>
      </div>

      {/* ── Konfirmasi Hapus ── */}
      {confirm && (
        <div className={modal.overlay} onClick={() => setConfirm(null)}>
          <div className={`${modal.modal} ${modal.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={modal.header}>
              <h2>Hapus Produk?</h2>
              <button className={modal.closeBtn} onClick={() => setConfirm(null)}><X size={18}/></button>
            </div>
            <div className={modal.body}>
              <p style={{color:'var(--white70)', fontSize:'0.9rem', lineHeight:1.6}}>
                Produk <strong style={{color:'var(--white)'}}>{confirm.name}</strong> akan dinonaktifkan dari website.
              </p>
            </div>
            <div className={modal.footer}>
              <button
                className="btn btn-danger"
                onClick={() => deleteMut.mutate(confirm.id)}
                disabled={deleteMut.isLoading}
              >
                {deleteMut.isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className={styles.tableWrap}>
          {isLoading ? (
            <div style={{padding:'2rem', textAlign:'center', color:'var(--white70)'}}>Memuat...</div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead style={{background:'var(--bg3)', borderBottom:'1px solid var(--border)'}}>
                <tr>
                  <th className="th" style={{width:60}}>Foto</th>
                  <th className="th">Nama Produk</th>
                  <th className="th" style={{width:130}}>Kategori</th>
                  <th className="th" style={{width:110}}>Brand</th>
                  <th className="th" style={{width:90, textAlign:'center'}}>Unggulan</th>
                  <th className="th" style={{textAlign:'right', width:130}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={6} style={{textAlign:'center', padding:'3rem', color:'var(--white70)'}}>
                      Belum ada produk.{' '}
                      <Link to="/products/new" style={{color:'var(--red)'}}>Tambah sekarang →</Link>
                    </td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td className="td">
                      <div className={styles.thumb}>
                        {p.images?.[0]
                          ? <img src={imgUrl(p.images[0])} alt={p.name} />
                          : <span>📦</span>}
                      </div>
                    </td>
                    <td className="td">
                      <p className={styles.prodName}>{p.name}</p>
                      <p className={styles.prodSlug}>{p.slug}</p>
                    </td>
                    <td className="td">
                      <span className="badge badge-gray">{p.category || '—'}</span>
                    </td>
                    <td className="td" style={{fontSize:'0.83rem', color:'var(--white70)'}}>
                      {p.brand || '—'}
                    </td>
                    <td className="td" style={{textAlign:'center'}}>
                      <button
                        onClick={() => toggleFeat.mutate({ id: p.id, is_featured: !p.is_featured })}
                        className={p.is_featured ? 'btn btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{color: p.is_featured ? '#EAB308' : undefined}}
                        title={p.is_featured ? 'Hapus dari unggulan' : 'Jadikan unggulan'}
                      >
                        {p.is_featured
                          ? <Star size={14} fill="currentColor"/>
                          : <StarOff size={14}/>}
                      </button>
                    </td>
                    <td className="td">
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'0.4rem'}}>
                        <Link to={`/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                          <Pencil size={13}/> Edit
                        </Link>
                        <button onClick={() => setConfirm(p)} className="btn btn-danger btn-sm">
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