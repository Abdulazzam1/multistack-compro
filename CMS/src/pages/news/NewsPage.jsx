import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { getErrorMsg, formatDateShort, imgUrl } from '@/utils/helpers';
import { useState } from 'react';
import styles from './NewsPage.module.css';

const CAT_LABELS = { berita: 'Berita', aktivitas: 'Aktivitas', csr: 'CSR' };

export default function NewsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-news'],
    queryFn: () => api.get('/news?published=all&limit=100').then(r => r.data.data),
  });
  const items = data || [];

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/news/${id}`),
    onSuccess: () => { qc.invalidateQueries(['cms-news']); setConfirm(null); },
    onError: (err) => alert(getErrorMsg(err)),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }) => api.put(`/news/${id}`, { is_published }),
    onSuccess: () => qc.invalidateQueries(['cms-news']),
  });

  return (
    <div className="animate-in">
      <div className={styles.pageHeader}>
        <h1 className="page-title">BERITA & INFORMASI</h1>
        <Link to="/news/new" className="btn btn-primary"><Plus size={16}/> Tulis Berita</Link>
      </div>

      {confirm && (
        <div className={styles.overlay}>
          <div className={styles.confirmBox}>
            <h3>Hapus Berita?</h3>
            <p>Berita <strong>"{confirm.title}"</strong> akan dihapus.</p>
            <div className={styles.confirmActions}>
              <button className="btn btn-danger" onClick={() => deleteMut.mutate(confirm.id)}>Ya, Hapus</button>
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          {isLoading ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--white70)' }}>Memuat...</div> : (
            <table className="w-full">
              <thead style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                <tr>
                  <th className="th">Judul</th>
                  <th className="th">Kategori</th>
                  <th className="th">Penulis</th>
                  <th className="th">Tanggal</th>
                  <th className="th">Status</th>
                  <th className="th" style={{ textAlign:'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map(n => (
                  <tr key={n.id}>
                    <td className="td">
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        {n.cover_image && (
                          <div className={styles.thumb}>
                            <img src={imgUrl(n.cover_image)} alt={n.title} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--white)' }}>{n.title}</p>
                          {n.excerpt && <p style={{ fontSize:'0.72rem', color:'var(--white40)', marginTop:2, maxWidth:300, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{n.excerpt}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td"><span className="badge badge-gray">{CAT_LABELS[n.category] || n.category}</span></td>
                    <td className="td" style={{ fontSize:'0.82rem' }}>{n.author}</td>
                    <td className="td" style={{ fontSize:'0.75rem', color:'var(--white40)', fontFamily:'var(--font-mono)' }}>{formatDateShort(n.created_at)}</td>
                    <td className="td">
                      <span className={`badge ${n.is_published ? 'badge-green' : 'badge-yellow'}`}>
                        {n.is_published ? 'Terbit' : 'Draft'}
                      </span>
                    </td>
                    <td className="td">
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.4rem' }}>
                        <button
                          onClick={() => togglePublish.mutate({ id: n.id, is_published: !n.is_published })}
                          className="btn btn-outline btn-sm"
                          title={n.is_published ? 'Jadikan Draft' : 'Terbitkan'}
                        >
                          {n.is_published ? <EyeOff size={13}/> : <Eye size={13}/>}
                        </button>
                        <Link to={`/news/${n.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={13}/></Link>
                        <button onClick={() => setConfirm(n)} className="btn btn-danger btn-sm"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && items.length === 0 && (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--white70)' }}>
              Belum ada berita. <Link to="/news/new" style={{ color:'var(--red)' }}>Tulis sekarang →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
