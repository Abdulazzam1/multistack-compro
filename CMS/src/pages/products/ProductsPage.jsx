import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star, StarOff } from 'lucide-react';
import api from '@/services/api';
import { getErrorMsg, imgUrl } from '@/utils/helpers';
import styles from './ProductsPage.module.css';

export default function ProductsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-products'],
    queryFn: () => api.get('/products?published=all&limit=100').then(r => r.data.data),
  });
  const products = data || [];

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries(['cms-products']); setConfirm(null); },
    onError: (err) => alert(getErrorMsg(err)),
  });

  const toggleFeat = useMutation({
    mutationFn: ({ id, is_featured }) => api.put(`/products/${id}`, { is_featured }),
    onSuccess: () => qc.invalidateQueries(['cms-products']),
  });

  return (
    <div className="animate-in">
      <div className={styles.pageHeader}>
        <h1 className="page-title">PRODUK</h1>
        <Link to="/products/new" className="btn btn-primary"><Plus size={16}/> Tambah Produk</Link>
      </div>

      {/* Confirm Delete */}
      {confirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3>Hapus Produk?</h3>
            <p>Produk <strong>{confirm.name}</strong> akan dinonaktifkan.</p>
            <div className={styles.confirmActions}>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(confirm.id)} disabled={deleteMut.isLoading}>
                {deleteMut.isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className={styles.tableWrap}>
          {isLoading ? <div className="p-8 text-center" style={{ color:'var(--white70)' }}>Memuat...</div> : (
            <table className="w-full">
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr>
                  <th className="th">Gambar</th>
                  <th className="th">Nama Produk</th>
                  <th className="th">Kategori</th>
                  <th className="th">Brand</th>
                  <th className="th">Unggulan</th>
                  <th className="th" style={{ textAlign:'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="td">
                      <div className={styles.thumb}>
                        {p.images?.[0]
                          ? <img src={imgUrl(p.images[0])} alt={p.name} />
                          : <span>📦</span>}
                      </div>
                    </td>
                    <td className="td"><p className={styles.prodName}>{p.name}</p><p className={styles.prodSlug}>{p.slug}</p></td>
                    <td className="td"><span className="badge badge-gray">{p.category || '—'}</span></td>
                    <td className="td" style={{ fontSize:'0.83rem' }}>{p.brand || '—'}</td>
                    <td className="td">
                      <button
                        onClick={() => toggleFeat.mutate({ id: p.id, is_featured: !p.is_featured })}
                        className={p.is_featured ? 'btn btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{ color: p.is_featured ? '#EAB308' : undefined }}
                      >
                        {p.is_featured ? <Star size={14} fill="currentColor"/> : <StarOff size={14}/>}
                      </button>
                    </td>
                    <td className="td">
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.4rem' }}>
                        <Link to={`/products/${p.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={13}/> Edit</Link>
                        <button onClick={() => setConfirm(p)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && products.length === 0 && (
            <div className="p-8 text-center" style={{ color:'var(--white70)' }}>
              Belum ada produk. <Link to="/products/new" style={{ color:'var(--red)' }}>Tambah sekarang →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
