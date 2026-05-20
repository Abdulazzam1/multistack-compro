import { useState }   from 'react';
import { Link }       from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import api            from '@/services/api';
import { getErrorMsg, formatDateShort, imgUrl } from '@/utils/helpers';
import styles from './NewsPage.module.css';
import modal  from '@/components/shared/Modal.module.css';

const CAT_LABELS = { berita:'Berita', aktivitas:'Aktivitas', csr:'CSR' };

export default function NewsPage() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms-news'],
    queryFn:  () => api.get('/news?published=all&limit=100').then(r => r.data.data),
  });
  const items = data || [];

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/news/${id}`),
    onSuccess: () => { qc.invalidateQueries(['cms-news']); setConfirm(null); },
    onError:   (err) => alert(getErrorMsg(err)),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }) => api.put(`/news/${id}`, { is_published }),
    onSuccess:  () => qc.invalidateQueries(['cms-news']),
  });

  return (
    <div className="animate-in">
      <div className={styles.pageHeader}>
        <h1 className="page-title">BERITA &amp; INFORMASI</h1>
        <Link to="/news/new" className="btn btn-primary">
          <Plus size={16}/> Tulis Berita
        </Link>
      </div>

      {/* ── Konfirmasi Hapus — pakai Modal.module.css ── */}
      {confirm && (
        <div className={modal.overlay} onClick={() => setConfirm(null)}>
          <div className={`${modal.modal} ${modal.modalSm}`} onClick={e => e.stopPropagation()}>
            <div className={modal.header}>
              <h2>Hapus Berita?</h2>
              <button className={modal.closeBtn} onClick={() => setConfirm(null)}><X size={18}/></button>
            </div>
            <div className={modal.body}>
              <p style={{color:'var(--white70)', fontSize:'0.9rem', lineHeight:1.6}}>
                Berita <strong style={{color:'var(--white)'}}>&ldquo;{confirm.title}&rdquo;</strong> akan dihapus permanen dan tidak bisa dikembalikan.
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

      {/* ── Tabel Berita ── */}
      <div className="card">
        <div style={{overflowX:'auto'}}>
          {isLoading ? (
            <div style={{padding:'2rem', textAlign:'center', color:'var(--white70)'}}>Memuat...</div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead style={{background:'var(--bg3)', borderBottom:'1px solid var(--border)'}}>
                <tr>
                  <th className="th">Judul</th>
                  <th className="th" style={{width:100}}>Kategori</th>
                  <th className="th" style={{width:120}}>Penulis</th>
                  <th className="th" style={{width:110}}>Tanggal</th>
                  <th className="th" style={{width:90}}>Status</th>
                  <th className="th" style={{textAlign:'right', width:130}}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={6} style={{textAlign:'center', padding:'3rem', color:'var(--white70)'}}>
                      Belum ada berita.{' '}
                      <Link to="/news/new" style={{color:'var(--red)'}}>Tulis sekarang →</Link>
                    </td>
                  </tr>
                ) : items.map(n => (
                  <tr key={n.id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td className="td">
                      <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                        {n.cover_image && (
                          <div className={styles.thumb}>
                            <img src={imgUrl(n.cover_image)} alt={n.title} />
                          </div>
                        )}
                        <div style={{minWidth:0}}>
                          <p style={{fontWeight:600, fontSize:'0.88rem', color:'var(--white)', marginBottom:'2px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:320}}>
                            {n.title}
                          </p>
                          {n.excerpt && (
                            <p style={{fontSize:'0.72rem', color:'var(--white40)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:320}}>
                              {n.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className="badge badge-gray">{CAT_LABELS[n.category] || n.category}</span>
                    </td>
                    <td className="td" style={{fontSize:'0.82rem', color:'var(--white70)'}}>
                      {n.author}
                    </td>
                    <td className="td" style={{fontSize:'0.75rem', color:'var(--white40)', fontFamily:'var(--font-mono)'}}>
                      {formatDateShort(n.created_at)}
                    </td>
                    <td className="td">
                      <span className={`badge ${n.is_published ? 'badge-green' : 'badge-yellow'}`}>
                        {n.is_published ? 'Terbit' : 'Draft'}
                      </span>
                    </td>
                    <td className="td">
                      <div style={{display:'flex', justifyContent:'flex-end', gap:'0.4rem'}}>
                        <button
                          onClick={() => togglePublish.mutate({ id: n.id, is_published: !n.is_published })}
                          className="btn btn-outline btn-sm"
                          title={n.is_published ? 'Jadikan Draft' : 'Terbitkan'}
                        >
                          {n.is_published ? <EyeOff size={13}/> : <Eye size={13}/>}
                        </button>
                        <Link to={`/news/${n.id}/edit`} className="btn btn-outline btn-sm">
                          <Pencil size={13}/>
                        </Link>
                        <button onClick={() => setConfirm(n)} className="btn btn-danger btn-sm">
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